var CacheStrategy;
(function (CacheStrategy) {
    CacheStrategy[CacheStrategy["None"] = 0] = "None";
    CacheStrategy[CacheStrategy["ViewAndPreload"] = 1] = "ViewAndPreload";
    CacheStrategy[CacheStrategy["View"] = 2] = "View";
    CacheStrategy[CacheStrategy["Preload"] = 3] = "Preload";
})(CacheStrategy || (CacheStrategy = {}));
var View = (function () {
    function View(cacheStrategy, containerId, viewPath) {
        if (cacheStrategy === void 0) { cacheStrategy = CacheStrategy.None; }
        if (containerId === void 0) { containerId = null; }
        if (viewPath === void 0) { viewPath = null; }
        this.CacheStrategy = CacheStrategy.None;
        this._containerID = null;
        this.eHandlrs = new Array();
        this.preload = null;
        this._viewPath = viewPath;
        this._containerID = containerId;
        this.CacheStrategy = cacheStrategy;
    }
    View.prototype.Prefix = function () {
        return "/Views/";
    };
    View.prototype.Url = function () {
        if (!this._viewPath) {
            var r = Reflection, n = r.GetName(this.constructor);
            this._viewPath = this.Prefix() + n + ".html";
        }
        return this._viewPath;
    };
    ;
    View.prototype.ContainerID = function () { return this._containerID; };
    ;
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
        if (strategy === void 0) { strategy = CacheStrategy.ViewAndPreload; }
        var t = this;
        if (t.Preload &&
            (strategy === CacheStrategy.ViewAndPreload || strategy === CacheStrategy.Preload)) {
            t.Preload.Execute(function () { });
        }
        var f = sessionStorage.getItem(t.Url());
        if (!f && (strategy === CacheStrategy.View || strategy === CacheStrategy.ViewAndPreload)) {
            var a = new Ajax();
            a.AddListener(EventType.Completed, function (arg) {
                t.RequestCompleted(arg, true);
            });
            a.Get(t.Url());
        }
    };
    View.prototype.Show = function (viewInstance) {
        var t = this;
        t.ViewInstance = viewInstance;
        t.Preload ? t.Preload.Execute(t.postPreloaded.bind(this)) : t.postPreloaded();
    };
    View.prototype.postPreloaded = function () {
        var t = this, f = sessionStorage.getItem(t.Url());
        if (!f || window["IsDebug"]) {
            var a = new Ajax();
            a.AddListener(EventType.Completed, t.RequestCompleted.bind(this));
            a.Get(t.Url());
        }
        else {
            t.SetHTML(f);
        }
    };
    View.prototype.RequestCompleted = function (a, dontSetHTML) {
        if (dontSetHTML === void 0) { dontSetHTML = false; }
        if (a.Sender.ResponseText) {
            sessionStorage.setItem(this.Url(), a.Sender.ResponseText);
            if (!dontSetHTML) {
                this.SetHTML(a.Sender.ResponseText);
            }
        }
        a.Sender = null;
    };
    View.prototype.SetHTML = function (html) {
        var _this = this;
        var t = this, c = t.ContainerID().Element();
        if (!Is.NullOrEmpty(c)) {
            t.cached = "div".CreateElement({ "innerHTML": html });
            var ele = t.cached.Get(function (ele) { return !Is.NullOrEmpty(ele.getAttribute("data-binder")); });
            t.countBindersReported = 0;
            t.countBinders = 0;
            if (ele.length > 0) {
                ele.forEach(function (e) {
                    try {
                        var a = e.getAttribute("data-binder");
                        if (a) {
                            var fun = new Function("return new " + a + (a.indexOf("Binder(") == 0 ? "" : "()"));
                            e.Binder = fun();
                            e.Binder.AddListener(EventType.Completed, t.OnBinderComplete.bind(_this));
                            e.Binder.Element = e;
                            t.countBinders = t.countBinders + 1;
                        }
                    }
                    catch (e) {
                        window.Exception(e);
                    }
                });
                ele.forEach(function (e) {
                    if (e.Binder) {
                        try {
                            e.Binder.Execute(t.ViewInstance);
                        }
                        catch (ex) {
                            window.Exception(e);
                        }
                    }
                });
            }
            else {
                t.MoveStuffFromCacheToReal();
            }
        }
        else {
            t.Dispatch(EventType.Completed);
        }
    };
    View.prototype.OnBinderComplete = function (a) {
        var t = this;
        if (a.EventType === EventType.Completed) {
            t.countBindersReported = t.countBindersReported + 1;
            if (t.countBinders === t.countBindersReported) {
                t.MoveStuffFromCacheToReal();
            }
        }
    };
    View.prototype.MoveStuffFromCacheToReal = function () {
        var t = this, c = t.ContainerID().Element();
        var be = c.Get(function (e) { return e.Binder != null; });
        be.forEach(function (e) { return e.Binder.Dispose(); });
        c.Clear();
        while (t.cached.childNodes.length > 0) {
            var n = t.cached.childNodes[0];
            t.cached.removeChild(n);
            c.appendChild(n);
        }
        t.Dispatch(EventType.Completed);
    };
    View.prototype.AddListener = function (eventType, eventHandler) {
        var t = this, f = t.eHandlrs.First(function (h) { return h.EventType === eventType && h.EventHandler === eventHandler; });
        if (!f) {
            t.eHandlrs.Add(new Listener(eventType, eventHandler));
        }
    };
    View.prototype.RemoveListener = function (eventType, eventHandler) {
        this.eHandlrs.Remove(function (l) { return l.EventType === eventType && eventHandler === eventHandler; });
    };
    View.prototype.RemoveListeners = function (eventType) {
        this.eHandlrs.Remove(function (l) { return l.EventType === eventType; });
    };
    View.prototype.Dispatch = function (eventType) {
        var _this = this;
        var l = this.eHandlrs.Where(function (e) { return e.EventType === eventType; });
        l.forEach(function (l) { return l.EventHandler(new CustomEventArg(_this, eventType)); });
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
        var t = this;
        t._callback = callback;
        t.completedCount = 0;
        t._dataLoaders.forEach(function (d) { return d.Execute(t.Completed.bind(_this)); });
    };
    DataLoaders.prototype.Completed = function () {
        var t = this;
        t.completedCount++;
        if (t.completedCount === t._dataLoaders.length) {
            t._callback();
        }
    };
    return DataLoaders;
}());
var DataLoader = (function () {
    function DataLoader(dataUrl, dataCallBack, shouldTryLoad, parameters) {
        if (shouldTryLoad === void 0) { shouldTryLoad = null; }
        if (parameters === void 0) { parameters = null; }
        this._parameters = null;
        var t = this;
        t._dataCallBack = dataCallBack;
        t._dataUrl = dataUrl;
        t._shouldTryLoad = shouldTryLoad;
    }
    DataLoader.prototype.Execute = function (completed) {
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
    };
    DataLoader.prototype._ajaxCompleted = function (arg) {
        this._dataCallBack(arg);
        this._completed();
    };
    return DataLoader;
}());
//# sourceMappingURL=View.js.map