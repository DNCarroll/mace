var CacheStrategy;
(function (CacheStrategy) {
    CacheStrategy[CacheStrategy["ViewAndData"] = 0] = "ViewAndData";
    CacheStrategy[CacheStrategy["View"] = 1] = "View";
    CacheStrategy[CacheStrategy["Data"] = 2] = "Data";
})(CacheStrategy || (CacheStrategy = {}));
var View = (function () {
    function View() {
        this.eventHandlers = new Array();
        this.preload = null;
    }
    Object.defineProperty(View.prototype, "Preload", {
        get: function () {
            return this.preload;
        },
        set: function (value) {
            this.preload = value;
        },
        enumerable: true,
        configurable: true
    });
    View.prototype.Cache = function (strategy) {
        if (strategy === void 0) { strategy = CacheStrategy.ViewAndData; }
        if (this.Preload &&
            (strategy === CacheStrategy.ViewAndData || strategy === CacheStrategy.Data)) {
            this.Preload.Execute(function () { });
        }
        var found = sessionStorage.getItem(this.ViewUrl());
        if (!found && (strategy === CacheStrategy.View || strategy === CacheStrategy.ViewAndData)) {
            var that = this;
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, function (arg) {
                that.RequestCompleted(arg, true);
            });
            ajax.Get(this.ViewUrl());
        }
    };
    View.prototype.Show = function (viewInstance) {
        if (this.Preload) {
            this.Preload.Execute(this.postPreloaded.bind(this));
        }
        else {
            this.postPreloaded();
        }
    };
    View.prototype.postPreloaded = function () {
        var found = sessionStorage.getItem(this.ViewUrl());
        if (!found || window["IsDebug"]) {
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this.RequestCompleted.bind(this));
            ajax.Get(this.ViewUrl());
        }
        else {
            this.SetHTML(found);
        }
    };
    View.prototype.RequestCompleted = function (arg, dontSetHTML) {
        if (dontSetHTML === void 0) { dontSetHTML = false; }
        if (arg.Sender.ResponseText) {
            sessionStorage.setItem(this.ViewUrl(), arg.Sender.ResponseText);
            if (!dontSetHTML) {
                this.SetHTML(arg.Sender.ResponseText);
            }
        }
        arg.Sender = null;
    };
    View.prototype.SetHTML = function (html) {
        var _this = this;
        var containter = this.ContainerID().Element();
        if (!Is.NullOrEmpty(containter)) {
            this.cachedElement = "div".CreateElement({ "innerHTML": html });
            var elements = this.cachedElement.Get(function (ele) { return !Is.NullOrEmpty(ele.getAttribute("data-binder")); });
            this.countBindersReported = 0;
            this.countBinders = 0;
            if (elements.length > 0) {
                elements.forEach(function (e) {
                    try {
                        var attribute = e.getAttribute("data-binder");
                        if (attribute) {
                            var fun = new Function("return new " + attribute + "()");
                            e.Binder = fun();
                            e.Binder.AddListener(EventType.Completed, _this.OnBinderComplete.bind(_this));
                            e.Binder.Element = e;
                            _this.countBinders = _this.countBinders + 1;
                        }
                    }
                    catch (e) {
                    }
                });
                elements.forEach(function (e) {
                    if (e.Binder) {
                        try {
                            e.Binder.Execute();
                        }
                        catch (ex) {
                            var exmessage = ex;
                        }
                    }
                });
            }
            else {
                this.MoveStuffFromCacheToReal();
            }
        }
        else {
            this.Dispatch(EventType.Completed);
        }
    };
    View.prototype.OnBinderComplete = function (arg) {
        if (arg.EventType === EventType.Completed) {
            this.countBindersReported = this.countBindersReported + 1;
            if (this.countBinders === this.countBindersReported) {
                this.MoveStuffFromCacheToReal();
            }
        }
    };
    View.prototype.MoveStuffFromCacheToReal = function () {
        var containter = this.ContainerID().Element();
        var boundElements = containter.Get(function (e) { return e.Binder != null; });
        boundElements.forEach(function (e) { return e.Binder.Dispose(); });
        containter.Clear();
        while (this.cachedElement.childNodes.length > 0) {
            var node = this.cachedElement.childNodes[0];
            this.cachedElement.removeChild(node);
            containter.appendChild(node);
        }
        this.Dispatch(EventType.Completed);
    };
    View.prototype.AddListener = function (eventType, eventHandler) {
        var found = this.eventHandlers.First(function (h) { return h.EventType === eventType && h.EventHandler === eventHandler; });
        if (!found) {
            this.eventHandlers.Add(new Listener(eventType, eventHandler));
        }
    };
    View.prototype.RemoveListener = function (eventType, eventHandler) {
        this.eventHandlers.Remove(function (l) { return l.EventType === eventType && eventHandler === eventHandler; });
    };
    View.prototype.RemoveListeners = function (eventType) {
        this.eventHandlers.Remove(function (l) { return l.EventType === eventType; });
    };
    View.prototype.Dispatch = function (eventType) {
        var _this = this;
        var listeners = this.eventHandlers.Where(function (e) { return e.EventType === eventType; });
        listeners.forEach(function (l) { return l.EventHandler(new CustomEventArg(_this, eventType)); });
    };
    return View;
}());
var DataLoaders = (function () {
    function DataLoaders() {
        var dataLoaders = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            dataLoaders[_i - 0] = arguments[_i];
        }
        this.completedCount = 0;
        this._dataLoaders = dataLoaders;
    }
    DataLoaders.prototype.Execute = function (callback) {
        var _this = this;
        this._callback = callback;
        this.completedCount = 0;
        this._dataLoaders.forEach(function (d) { return d.Execute(_this.Completed.bind(_this)); });
    };
    DataLoaders.prototype.Completed = function () {
        this.completedCount++;
        if (this.completedCount == this._dataLoaders.length) {
            this._callback();
        }
    };
    return DataLoaders;
}());
var DataLoader = (function () {
    function DataLoader(dataUrl, dataCallBack, shouldTryLoad, parameters) {
        if (shouldTryLoad === void 0) { shouldTryLoad = null; }
        if (parameters === void 0) { parameters = null; }
        this._parameters = null;
        this._dataCallBack = dataCallBack;
        this._dataUrl = dataUrl;
        this._shouldTryLoad = shouldTryLoad;
    }
    DataLoader.prototype.Execute = function (completed) {
        this._completed = completed;
        if (!this._shouldTryLoad || this._shouldTryLoad()) {
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this._ajaxCompleted.bind(this));
            ajax.Get(this._dataUrl, this._parameters);
        }
        else {
            this._completed();
        }
    };
    DataLoader.prototype._ajaxCompleted = function (arg) {
        this._dataCallBack(arg);
        this._completed();
    };
    return DataLoader;
}());
//would like to have this be a Promise structure
//class GenericPreloader {
//    //this isnt async
//    constructor(executor:(...parameters:any)=>any, callback:
//} 
//# sourceMappingURL=View.js.map