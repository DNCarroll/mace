enum CacheStrategy {
    None,
    ViewAndPreload,
    View,
    Preload
}
abstract class View implements IView {
    private viewPath: string;
    CacheStrategy: CacheStrategy = CacheStrategy.None;
    Prefix() {
        return "/Views/";
    }
    Url() {
        if (!this.viewPath) {
            var i = Initializer,
                name = i.GetFuncName(i.GetStringOf(this.constructor.toString()));
            this.viewPath = this.Prefix() + name + ".html";
        }       
        return this.viewPath;
    };
    abstract ContainerID(): string;    
    private countBinders: number;
    private countBindersReported: number;
    private cached: HTMLElement    
    private eHandlrs = new Array<Listener<IView>>();
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
        var f = sessionStorage.getItem(t.Url());
        if (!f && (strategy === CacheStrategy.View || strategy === CacheStrategy.ViewAndPreload)) {            
            var a = new Ajax();
            a.AddListener(EventType.Completed, (arg: ICustomEventArg<Ajax>) => {
                t.RequestCompleted(arg, true);
            });
            a.Get(t.Url());
        }
    }
    Show(viewInstance: ViewInstance) {
        var t = this;
        t.ViewInstance = viewInstance;
        t.Preload ? t.Preload.Execute(t.postPreloaded.bind(this)) : t.postPreloaded();
    }
    private postPreloaded() {
        var t = this,
            f = sessionStorage.getItem(t.Url());
        if (!f || window["IsDebug"]) {
            var a = new Ajax();
            a.AddListener(EventType.Completed, t.RequestCompleted.bind(this));
            a.Get(t.Url());
        }
        else {
            t.SetHTML(f);
        }
    }
    RequestCompleted(a: CustomEventArg<Ajax>, dontSetHTML = false) {        
        if (a.Sender.ResponseText) {
            sessionStorage.setItem(this.Url(), a.Sender.ResponseText);
            if (!dontSetHTML) {
                this.SetHTML(a.Sender.ResponseText);
            }
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
            t.countBinders = 0;
            if (ele.length > 0) {
                ele.forEach(e => {
                    try {
                        var attribute = e.getAttribute("data-binder");
                        if (attribute) {
                            let fun = new Function("return new " + attribute + "()");
                            e.Binder = <IBinder>fun();
                            e.Binder.AddListener(EventType.Completed, t.OnBinderComplete.bind(this));
                            e.Binder.Element = e;
                            t.countBinders = t.countBinders + 1;
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
                            window.Exception(e);
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
            if (t.countBinders === t.countBindersReported) {
                t.MoveStuffFromCacheToReal();
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
        t.Dispatch(EventType.Completed);
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
class DataLoaders implements IPreViewLoad{
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