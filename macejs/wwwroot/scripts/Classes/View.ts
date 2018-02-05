enum CacheStrategy {
    None,
    ViewAndPreload,
    View,
    Preload
}
class View implements IView {
    private url: string;
    CacheStrategy: CacheStrategy = CacheStrategy.None;
    constructor(cacheStrategy: CacheStrategy = CacheStrategy.View, containerId: string = "content", viewPath: string = null) {
        var t = this;
        t.url = viewPath;
        t._containerID = containerId;
        t.CacheStrategy = cacheStrategy;
        t.Cache(t.CacheStrategy);
    }
    Prefix() {
        return "/Views/";
    }
    Url() {
        if (!this.url) {
            var n = Reflection.GetName(this.constructor).replace("View", "");
            this.url = this.Prefix() + n + ".html";
        }
        return this.url;
    };
    _containerID: string = null;
    ContainerID(): string { return this._containerID; };
    private countBindersReported: number;
    private cached: HTMLElement
    private eHandlrs = new Array<Listener<IView>>();
    private binders = new Array<IBinder>();
    ViewInstance: ViewInstance;
    private preload: IPreViewLoad = null;
    get Preload() {
        return this.preload;
    }
    set Preload(value: IPreViewLoad) {
        this.preload = value;
    }
    Cache(strategy: CacheStrategy = CacheStrategy.ViewAndPreload) {
        var t = this;
        if (t.Preload &&
            (strategy === CacheStrategy.ViewAndPreload || strategy === CacheStrategy.Preload)) {
            t.Preload.Execute(() => { });
        }
        if (strategy === CacheStrategy.View || strategy === CacheStrategy.ViewAndPreload) {
            t.postPreloaded(true);
        }
    }
    Show(viewInstance: ViewInstance) {
        var t = this;
        t.ViewInstance = viewInstance;
        t.binders = new Array<IBinder>();
        t.binders.forEach(b => b.RemoveListeners(EventType.Any));
        t.Preload ? t.Preload.Execute(t.postPreloaded.bind(this)) : t.postPreloaded();
    }
    private postPreloaded(dontSetHtml: boolean = false) {
        var t = this,
            a = new Ajax();
        if (!dontSetHtml) {
            a.AddListener(EventType.Completed, t.RequestCompleted.bind(this));
        }
        a.Get(t.Url());
    }
    RequestCompleted(a: CustomEventArg<Ajax>) {
        if (a.Sender.ResponseText) {
            this.SetHTML(a.Sender.ResponseText);
        }
        a.Sender = null;
    }
    SetHTML(html: string) {
        var t = this,
            c = t.ContainerID().Element();
        if (!Is.NullOrEmpty(c)) {
            t.cached = "div".CreateElement({ "innerHTML": html });
            var ele = t.cached.Get(ele => !Is.NullOrEmpty(ele.getAttribute("data-binder")));
            t.countBindersReported = 0;
            if (ele.length > 0) {
                ele.forEach(e => {
                    try {
                        let a = e.getAttribute("data-binder");
                        if (a) {
                            let fun = new Function("return new " + a + (a.indexOf("Binder(") == 0 ? "" : "()"));
                            e.Binder = <IBinder>fun();
                            e.Binder.AddListener(EventType.Completed, t.OnBinderComplete.bind(this));
                            e.Binder.Element = e;
                            t.binders.Add(e.Binder);
                        }
                    }
                    catch (e) {
                        window.Exception(e);
                    }
                });
                ele.forEach(e => {
                    if (e.Binder) {
                        try {
                            e.Binder.Execute(t.ViewInstance);
                        }
                        catch (ex) {
                            window.Exception(ex);
                        }
                    }
                });
            } else {
                t.MoveStuffFromCacheToReal();
            }
        }
        else {
            t.Dispatch(EventType.Completed);
        }
    }
    OnBinderComplete(a: ICustomEventArg<IBinder>) {
        var t = this;
        if (a.EventType === EventType.Completed) {
            t.countBindersReported = t.countBindersReported + 1;
            if (t.binders.length === t.countBindersReported) {
                t.MoveStuffFromCacheToReal();
                t.binders.forEach(b => {
                    b.RemoveListener(EventType.Completed, t.OnBinderComplete.bind(this));
                });
            }
        }
    }
    MoveStuffFromCacheToReal() {
        var t = this,
            c = t.ContainerID().Element();
        var be = c.Get(e => e.Binder != null);
        be.forEach(e => e.Binder.Dispose());
        c.Clear();
        while (t.cached.childNodes.length > 0) {
            let n = t.cached.childNodes[0];
            t.cached.removeChild(n);
            c.appendChild(n);
        }
        setTimeout(() => { t.Dispatch(EventType.Completed); }, 20);
    }
    AddListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<IView>) => void) {
        var t = this,
            f = t.eHandlrs.First(h => h.EventType === eventType && h.EventHandler === eventHandler);
        if (!f) {
            t.eHandlrs.Add(new Listener(eventType, eventHandler));
        }
    }
    RemoveListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<IView>) => void) {
        this.eHandlrs.Remove(l => l.EventType === eventType && eventHandler === eventHandler);
    }
    RemoveListeners(eventType: EventType) {
        this.eHandlrs.Remove(l => l.EventType === eventType);
    }
    Dispatch(eventType: EventType) {
        var l = this.eHandlrs.Where(e => e.EventType === eventType);
        l.forEach(l => l.EventHandler(new CustomEventArg<IView>(this, eventType)));
    }
}
//thinking is could have a generic type that could 
//be set for the preload
interface IPreViewLoad {
    Execute(callback: () => void): void;
}
class DataLoaders implements IPreViewLoad {
    _callback: () => any;
    completedCount: number = 0;
    private _dataLoaders: Array<DataLoader>;
    constructor(...dataLoaders: Array<DataLoader>) {
        this._dataLoaders = dataLoaders;
    }
    Execute(callback: () => void) {
        var t = this;
        t._callback = callback;
        t.completedCount = 0;
        t._dataLoaders.forEach(d => d.Execute(t.Completed.bind(this)));
    }
    Completed() {
        var t = this;
        t.completedCount++;
        if (t.completedCount === t._dataLoaders.length) {
            t._callback();
        }
    }
}
class DataLoader {
    private _dataUrl: string;
    private _shouldTryLoad: () => boolean;
    private _dataCallBack: (arg: ICustomEventArg<Ajax>) => void;
    private _completed: () => void;
    private _parameters: any = null;
    constructor(dataUrl: string, dataCallBack: (arg: ICustomEventArg<Ajax>) => void, shouldTryLoad: () => boolean = null, parameters: any = null) {
        var t = this;
        t._dataCallBack = dataCallBack;
        t._dataUrl = dataUrl;
        t._shouldTryLoad = shouldTryLoad;
    }
    Execute(completed: () => void) {
        var t = this;
        t._completed = completed;
        if (!t._shouldTryLoad || t._shouldTryLoad()) {
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, t._ajaxCompleted.bind(this));
            ajax.Get(t._dataUrl, t._parameters);
        }
        else {
            t._completed();
        }
    }
    private _ajaxCompleted(arg: ICustomEventArg<Ajax>) {
        this._dataCallBack(arg);
        this._completed();
    }
}