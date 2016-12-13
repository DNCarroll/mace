enum CacheStrategy {
    ViewAndData,
    View,
    Data
}
abstract class View implements IView {
    abstract ViewUrl(): string;
    abstract ContainerID(): string;
    
    private countBinders: number;
    private countBindersReported: number;
    private cachedElement: HTMLElement    
    private eventHandlers = new Array<Listener<IView>>();
    ViewInstance: ViewInstance;   
    private preload: IPreViewLoad = null;
    get Preload() {
        return this.preload;
    }
    set Preload(value: IPreViewLoad) {
        this.preload = value;
    }    
    Cache(strategy: CacheStrategy = CacheStrategy.ViewAndData) {
        if (this.Preload &&
            (strategy === CacheStrategy.ViewAndData || strategy === CacheStrategy.Data)) {
            this.Preload.Execute(() => { });
        }        
        var found = sessionStorage.getItem(this.ViewUrl());
        if (!found && (strategy === CacheStrategy.View || strategy === CacheStrategy.ViewAndData)) {
            var that = this;
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, (arg: ICustomEventArg<Ajax>) => {
                that.RequestCompleted(arg, true);
            });
            ajax.Get(this.ViewUrl());
        }
    }
    Show(viewInstance: ViewInstance) {                        
        if (this.Preload) {
            this.Preload.Execute(this.postPreloaded.bind(this));
        }
        else {
            this.postPreloaded();
        }
    }
    private postPreloaded() {
        var found = sessionStorage.getItem(this.ViewUrl());
        if (!found || window["IsDebug"]) {
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this.RequestCompleted.bind(this));
            ajax.Get(this.ViewUrl());
        }
        else {
            this.SetHTML(found);
        }
    }
    RequestCompleted(arg: CustomEventArg<Ajax>, dontSetHTML = false) {        
        if (arg.Sender.ResponseText) {
            sessionStorage.setItem(this.ViewUrl(), arg.Sender.ResponseText);
            if (!dontSetHTML) {
                this.SetHTML(arg.Sender.ResponseText);
            }
        }        
        arg.Sender = null;
    }    
    
    SetHTML(html: string) {
        var containter = this.ContainerID().Element();        
        if (!Is.NullOrEmpty(containter)) {
            this.cachedElement = "div".CreateElement({ "innerHTML": html });
            var elements = this.cachedElement.Get(ele => !Is.NullOrEmpty(ele.getAttribute("data-binder")));
            this.countBindersReported = 0;
            this.countBinders = 0;
            if (elements.length > 0) {
                elements.forEach(e => {
                    try {
                        var attribute = e.getAttribute("data-binder");
                        if (attribute) {
                            var fun = new Function("return new " + attribute + "()");
                            e.Binder = <IBinder>fun();
                            e.Binder.AddListener(EventType.Completed, this.OnBinderComplete.bind(this));
                            e.Binder.Element = e;
                            this.countBinders = this.countBinders + 1;
                        }
                    }
                    catch (e) {
                    }
                });
                elements.forEach(e => {
                    if (e.Binder) {
                        try {
                            e.Binder.Execute();
                        }
                        catch (ex) {
                            var exmessage = ex;
                        }
                    }
                });
            } else {
                this.MoveStuffFromCacheToReal();
            }
        }
        else {
            this.Dispatch(EventType.Completed);
        }
    }    
    OnBinderComplete(arg: ICustomEventArg<IBinder>) {
        if (arg.EventType === EventType.Completed) {
            this.countBindersReported = this.countBindersReported + 1;
            if (this.countBinders === this.countBindersReported) {
                this.MoveStuffFromCacheToReal();
            }
        }
    }
    MoveStuffFromCacheToReal() {
        var containter = this.ContainerID().Element();
        var boundElements = containter.Get(e => e.Binder != null);
        boundElements.forEach(e => e.Binder.Dispose());
        containter.Clear();
        while (this.cachedElement.childNodes.length > 0) {
            var node = this.cachedElement.childNodes[0];
            this.cachedElement.removeChild(node);
            containter.appendChild(node);
        }
        this.Dispatch(EventType.Completed);
    }
    AddListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<IView>) => void) {
        var found = this.eventHandlers.First(h => h.EventType === eventType && h.EventHandler === eventHandler);
        if (!found) {
            this.eventHandlers.Add(new Listener(eventType, eventHandler));
        }
    }
    RemoveListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<IView>) => void) {
        this.eventHandlers.Remove(l => l.EventType === eventType && eventHandler === eventHandler);
    }
    RemoveListeners(eventType: EventType) {
        this.eventHandlers.Remove(l => l.EventType === eventType);
    }
    Dispatch(eventType: EventType) {
        var listeners = this.eventHandlers.Where(e => e.EventType === eventType);
        listeners.forEach(l => l.EventHandler(new CustomEventArg<IView>(this, eventType)));
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
        this._callback = callback;
        this.completedCount = 0;
        this._dataLoaders.forEach(d => d.Execute(this.Completed.bind(this)));
    }
    Completed() {
        this.completedCount++;
        if (this.completedCount == this._dataLoaders.length) {
            this._callback();
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
        this._dataCallBack = dataCallBack;
        this._dataUrl = dataUrl;
        this._shouldTryLoad = shouldTryLoad;
    }
    Execute(completed: () => void) {
        this._completed = completed;
        if (!this._shouldTryLoad || this._shouldTryLoad()) {
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this._ajaxCompleted.bind(this));
            ajax.Get(this._dataUrl, this._parameters);
        }
        else {
            this._completed();
        }
    }
    private _ajaxCompleted(arg: ICustomEventArg<Ajax>) {
        this._dataCallBack(arg);
        this._completed();
    }
}
//would like to have this be a Promise structure
//class GenericPreloader {
//    //this isnt async
//    constructor(executor:(...parameters:any)=>any, callback:
//}