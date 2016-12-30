//a promise type too?
var Ajax = (function () {
    function Ajax() {
        this.DisableElement = null;
        this.ManipulateProgressElement = false;
        this.UseAsDateUTC = true;
        this.ContentType = "application/json; charset=utf-8";
        this.eventHandlers = new Array();
    }
    Object.defineProperty(Ajax.prototype, "ResponseText", {
        get: function () {
            return this.XMLHttpRequest.responseText;
        },
        enumerable: true,
        configurable: true
    });
    Ajax.prototype.Submit = function (method, url, parameters) {
        if (parameters === void 0) { parameters = null; }
        this.showProgress();
        url = this.getUrl(url);
        this.XMLHttpRequest = new XMLHttpRequest();
        var ajax = this;
        var xhttpr = this.XMLHttpRequest;
        xhttpr.addEventListener("readystatechange", ajax.onReaderStateChange.bind(ajax), false);
        xhttpr.open(method, url, true);
        xhttpr.setRequestHeader("content-type", navigator && /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent) ? "application/json;q=0.9" : this.ContentType);
        this.setCustomHeader();
        try {
            var newParameters = this.getParameters(parameters);
            xhttpr.send(newParameters);
        }
        catch (e) {
            this.HideProgress();
            window.Exception(e);
        }
    };
    Ajax.prototype.onReaderStateChange = function (e) {
        if (this.isRequestReady()) {
            this.HideProgress();
            this.Dispatch(EventType.Completed);
        }
    };
    Ajax.prototype.showProgress = function () {
        this.showHideProgress(true);
    };
    Ajax.prototype.getUrl = function (url) {
        if (url.indexOf("http") == -1 && !Is.NullOrEmpty(Ajax.Host)) {
            url = Ajax.Host + (url.indexOf("/") == 0 ? url : "/" + url);
        }
        return url;
    };
    Ajax.prototype.isRequestReady = function () {
        return this.XMLHttpRequest && this.XMLHttpRequest.readyState == 4;
    };
    Ajax.prototype.HideProgress = function () {
        this.showHideProgress(false);
    };
    Ajax.prototype.showHideProgress = function (show) {
        if (this.ManipulateProgressElement) {
            show ? ProgressManager.Show() : ProgressManager.Hide();
            if (this.DisableElement) {
                if (Is.Array(this.DisableElement)) {
                    for (var i = 0; i < this.DisableElement.length; i++) {
                        show ? this.DisableElement[i].setAttribute("disabled", "disabled") : this.DisableElement[i].removeAttribute("disabled");
                    }
                }
                else {
                    show ? this.DisableElement.setAttribute("disabled", "disabled") : this.DisableElement.removeAttribute("disabled");
                }
            }
        }
    };
    Ajax.prototype.setCustomHeader = function () {
        if (this.Header) {
            var header = this.Header();
            if (header) {
                for (var prop in header) {
                    this.XMLHttpRequest.setRequestHeader(prop, header[prop]);
                }
            }
        }
    };
    Ajax.prototype.getParameters = function (parameters) {
        var ret = "";
        if (parameters && this.ContentType == "application/json; charset=utf-8") {
            ret = JSON.stringify(parameters);
            ret = ret.replace(/\\\"__type\\\"\:\\\"[\w+\.?]+\\\"\,/g, "");
            ret = ret.replace(/\"__type\"\:\"[\w+\.?]+\"\,/g, "");
            ret = ret.replace(/<script/ig, "");
            ret = ret.replace(/script>/ig, "");
        }
        return ret;
    };
    Ajax.prototype.GetRequestData = function () {
        var ret = null;
        var x = this.XMLHttpRequest;
        if (this.isRequestReady() && (x.status == 200 || x.status == 204) &&
            !Is.NullOrEmpty(x.responseText)) {
            ret = x.responseText;
            try {
                ret = JSON.parse(ret);
                if (ret.d) {
                    ret = ret.d;
                }
                this.convertProperties(ret);
            }
            catch (e) {
                ret = null;
                window.Exception(e);
            }
        }
        return ret;
    };
    Ajax.prototype.convertProperties = function (object) {
        var keyMap;
        if (Is.Array(object)) {
            for (var i = 0; i < object.length; i++) {
                var obj = object[i];
                if (obj) {
                    try {
                        keyMap = keyMap ? keyMap : this.getKeyMap(obj);
                    }
                    catch (e) {
                        window.Exception(e);
                    }
                    this.setValues(obj, keyMap);
                }
                for (var prop in obj) {
                    this.convertProperties(obj[prop]);
                }
            }
        }
        else if (object && typeof object === 'object') {
            var keyMap = this.getKeyMap(object);
            this.setValues(object, keyMap);
            for (var prop in object) {
                this.convertProperties(object[prop]);
            }
        }
    };
    Ajax.prototype.getKeyMap = function (obj) {
        var keyMap = new Array();
        for (var prop in obj) {
            var val = obj[prop];
            if (val && Is.String(val)) {
                val = val.Trim();
                if (val.indexOf("/Date(") == 0 || val.indexOf("Date(") == 0) {
                    keyMap.push({ Key: prop, Type: "Date" });
                }
                else if (val.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/i)) {
                    keyMap.push({ Key: prop, Type: "UTCDate" });
                }
                else if (val.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g)) {
                    keyMap.push({ Key: prop, Type: "ZDate" });
                }
            }
        }
        return keyMap;
    };
    Ajax.prototype.setValues = function (obj, keyMap) {
        for (var j = 0; j < keyMap.length; j++) {
            var key = keyMap[j].Key;
            var type = keyMap[j].Type;
            var val = obj[key];
            switch (type) {
                case "Date":
                    if (val) {
                        val = parseInt(val.substring(6).replace(")/", ""));
                        if (val > -62135575200000) {
                            val = new Date(val);
                            obj[key] = val;
                        }
                        else {
                            delete obj[key];
                        }
                    }
                    else {
                        obj[key] = new Date();
                    }
                    break;
                case "UTCDate":
                case "ZDate":
                    var tempDate = new Date(val);
                    if (this.UseAsDateUTC) {
                        tempDate = new Date(tempDate.getUTCFullYear(), tempDate.getUTCMonth(), tempDate.getUTCDate());
                    }
                    else if (window["chrome"]) {
                        var offset = new Date().getTimezoneOffset();
                        tempDate = tempDate.Add(0, 0, 0, 0, offset);
                    }
                    obj[key] = tempDate;
                    break;
                default:
                    break;
            }
        }
    };
    Ajax.prototype.Get = function (url, parameters) {
        if (parameters === void 0) { parameters = null; }
        this.Submit("GET", url, parameters);
    };
    Ajax.prototype.Put = function (url, parameters) {
        if (parameters === void 0) { parameters = null; }
        this.Submit("PUT", url, parameters);
    };
    Ajax.prototype.AddListener = function (eventType, eventHandler) {
        this.eventHandlers.Add(new Listener(eventType, eventHandler));
    };
    Ajax.prototype.RemoveListener = function (eventType, eventHandler) {
        this.eventHandlers.Remove(function (l) { return l.EventType === eventType && eventHandler === eventHandler; });
    };
    Ajax.prototype.RemoveListeners = function (eventType) {
        this.eventHandlers.Remove(function (l) { return l.EventType === eventType; });
    };
    Ajax.prototype.Dispatch = function (eventType) {
        var _this = this;
        var listeners = this.eventHandlers.Where(function (e) { return e.EventType === eventType; });
        listeners.forEach(function (l) { return l.EventHandler(new CustomEventArg(_this, eventType)); });
    };
    return Ajax;
}());
//# sourceMappingURL=Ajax.js.map
//disable the active context or readonly it while the new stuff is coming in?
//Delete not ready
var Binder = (function () {
    function Binder() {
        this.PrimaryKeys = new Array();
        this.eventHandlers = new Array();
        this.DataObjects = new Array();
        this.AssociatedElementIDs = new Array();
        this.AutomaticallyUpdatesToWebApi = true;
        this.AutomaticallySelectsFromWebApi = true;
        this.DataRowTemplates = new Array();
        this.IsFormBinding = false;
    }
    Binder.prototype.WebApiGetParameters = function () {
        return null;
    };
    Binder.prototype.Dispose = function () {
        this.PrimaryKeys = null;
        this.WebApi = null;
        this.AssociatedElementIDs = null;
        if (this.DataObject) {
            this.DataObject.RemoveObjectStateListener();
            this.DataObject.RemovePropertyListeners();
        }
        this.DataObjects.forEach(function (d) {
            d.RemoveObjectStateListener();
            d.RemovePropertyListeners();
        });
        this.RemoveListeners();
    };
    Binder.prototype.Execute = function (viewInstance) {
        if (viewInstance === void 0) { viewInstance = null; }
        if (this.AutomaticallySelectsFromWebApi && !Is.NullOrEmpty(this.WebApi)) {
            var parameters = this.WebApiGetParameters() ? this.WebApiGetParameters() : viewInstance.Parameters;
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this.OnAjaxComplete.bind(this));
            var url = this.WebApi;
            if (parameters) {
                url += (url.lastIndexOf("/") + 1 == url.length ? "" : "/");
                url += Is.Array(parameters) ? parameters.join("/") : parameters;
            }
            ajax.Get(url);
        }
        else {
            this.Dispatch(EventType.Completed);
        }
    };
    Binder.prototype.OnAjaxComplete = function (arg) {
        var _this = this;
        if (arg.EventType === EventType.Completed) {
            var data = arg.Sender.GetRequestData();
            if (data) {
                if (!Is.Array(data)) {
                    this.IsFormBinding = true;
                    this.BindToDataObject(this.NewObject(data));
                }
                else {
                    data.forEach(function (d) { return _this.Add(_this.NewObject(d)); });
                }
                this.Dispatch(EventType.Completed);
            }
        }
    };
    //not ready
    Binder.prototype.Delete = function (objectToRemove) {
    };
    Binder.prototype.Add = function (objectToAdd) {
        this.prepDataRowTemplates();
        var that = this;
        this.DataRowTemplates.forEach(function (t) {
            var newEle = t.CreateElementFromHtml();
            var boundEle = newEle.Get(function (e) { return e.HasDataSet(); });
            boundEle.Add(newEle);
            that.DataRowFooter ? that.Element.insertBefore(newEle, that.DataRowFooter) : that.Element.appendChild(newEle);
            that.DataObjects.Add(objectToAdd);
            that.BindToDataObject(objectToAdd, boundEle);
        });
    };
    Binder.prototype.prepDataRowTemplates = function () {
        var _this = this;
        if (this.DataRowTemplates.length == 0) {
            var eles = this.Element.children;
            var rows = new Array();
            var lastIndex = 0;
            for (var i = 0; i < eles.length; i++) {
                if (eles[i].getAttribute("data-template") != null) {
                    rows.Add(eles[i]);
                    lastIndex = i;
                }
            }
            if (eles[eles.length - 1] != rows[rows.length - 1]) {
                this.DataRowFooter = eles[eles.length - 1];
            }
            rows.forEach(function (r) {
                _this.DataRowTemplates.Add(r.outerHTML);
                r.Remove();
            });
        }
    };
    Binder.prototype.onObjectStateChanged = function (obj) {
        if (this.AutomaticallyUpdatesToWebApi && this.WebApi) {
            var jx = new Ajax();
            jx.AddListener(EventType.Completed, this.OnUpdateComplete.bind(this));
            jx.Put(this.WebApi, obj.ServerObject);
            obj.ObjectState = ObjectState.Clean;
        }
    };
    Binder.prototype.OnUpdateComplete = function (arg) {
        var _this = this;
        var income = arg.Sender.GetRequestData();
        var obj = this.DataObject ? this.DataObject : this.DataObjects.First(function (d) { return _this.IsPrimaryKeymatch(d, income); });
        obj ? this.SetServerObjectValue(obj, income) : null;
    };
    Binder.prototype.SetServerObjectValue = function (data, income) {
        for (var p in income) {
            if (!this.PrimaryKeys.First(function (k) { return k === p; })) {
                data.SetServerProperty(p, income[p]);
            }
        }
    };
    Binder.prototype.IsPrimaryKeymatch = function (data, income) {
        for (var i = 0; i < this.PrimaryKeys.length; i++) {
            if (data.ServerObject[this.PrimaryKeys[i]] != income[this.PrimaryKeys[i]]) {
                return false;
            }
        }
        return true;
    };
    Binder.prototype.BindToDataObject = function (obj, elesToBind) {
        var _this = this;
        if (elesToBind === void 0) { elesToBind = null; }
        if (!elesToBind) {
            elesToBind = this.Element.Get(function (e) { return e.HasDataSet(); });
            elesToBind.Add(this.Element);
        }
        if (this.IsFormBinding) {
            this.DataObject = obj;
        }
        obj.AddObjectStateListener(this.onObjectStateChanged.bind(this));
        elesToBind.forEach(function (e) {
            var element = e;
            _this.setListeners(element, obj);
        });
        obj.AllPropertiesChanged();
    };
    Binder.prototype.setListeners = function (ele, obj) {
        var _this = this;
        var attrs = ele.GetDataSetAttributes();
        if (ele.tagName === "SELECT") {
            var dsource = attrs.First(function (f) { return f.Attribute == "datasource"; });
            var dMemb = attrs.First(function (f) { return f.Attribute == "displaymember"; });
            var vMemb = attrs.First(function (f) { return f.Attribute == "valuemember"; });
            if (dsource) {
                var fun = new Function("return " + dsource.Property);
                var data = fun();
                ele.AddOptions(data, vMemb ? vMemb.Property : null, dMemb ? dMemb.Property : null);
            }
        }
        var nonBindAttr = ["binder", "datasource", "displaymember", "valuemember"];
        attrs.forEach(function (b) {
            if (!nonBindAttr.First(function (v) { return v === b.Attribute; })) {
                var attr = _this.getAttribute(b.Attribute);
                _this.setObjectPropertyListener(b.Property, attr, ele, obj);
                var eleAttr = b.Attribute === "checked" && ele["type"] === "checkbox" ? "checked" : b.Attribute === "value" ? "value" : null;
                if (eleAttr) {
                    var fun = function (evt) {
                        obj.OnElementChanged.bind(obj)(ele[eleAttr], b.Property);
                    };
                    ele.addEventListener("change", fun);
                }
            }
        });
    };
    Binder.prototype.getAttribute = function (attr) {
        attr = attr.toLowerCase();
        switch (attr) {
            case "class":
            case "classname":
                return "className";
            case "innerhtml":
                return "innerHTML";
            case "readonly":
                return "readOnly";
            default:
                return attr;
        }
    };
    Binder.prototype.setObjectPropertyListener = function (property, attr, ele, obj) {
        var _this = this;
        var objectPropertyChangedForElement = function (attribute, value) {
            if (Has.Properties(ele, attribute)) {
                if (ele.tagName === "INPUT" && ele["type"] === "radio") {
                    var radios = ele.parentElement.Get(function (e2) { return e2["name"] === ele["name"] && e2["type"] === "radio"; });
                    radios.forEach(function (r) { return r["checked"] = false; });
                    var first = radios.First(function (r) { return r["value"] === value.toString(); });
                    first["checked"] = true;
                }
                else if (attribute === "className") {
                    ele.className = null;
                    ele.className = value;
                }
                else {
                    ele[attribute] = value;
                }
            }
            else {
                var style = _this.getStyle(attribute);
                style ? ele["style"][style] = value : ele[attribute] = value;
            }
        };
        obj.AddPropertyListener(property, attr, objectPropertyChangedForElement);
    };
    Binder.prototype.getStyle = function (value) {
        for (var prop in document.body.style) {
            if (prop.toLowerCase() === value.toLowerCase()) {
                return prop;
            }
        }
        return null;
    };
    Object.defineProperty(Binder.prototype, "SelectedObject", {
        get: function () {
            return this.selectedObject;
        },
        set: function (value) {
            this.selectedObject = value;
        },
        enumerable: true,
        configurable: true
    });
    Binder.prototype.AddListener = function (eType, eHandler) {
        var found = this.eventHandlers.First(function (h) { return h.EventType === eType && h.EventHandler === eHandler; });
        if (!found) {
            this.eventHandlers.Add(new Listener(eType, eHandler));
        }
    };
    Binder.prototype.RemoveListener = function (eType, eHandler) {
        this.eventHandlers.Remove(function (l) { return l.EventType === eType && eHandler === eHandler; });
    };
    Binder.prototype.RemoveListeners = function (eType) {
        if (eType === void 0) { eType = EventType.Any; }
        this.eventHandlers.Remove(function (l) { return eType === EventType.Any || l.EventType === eType; });
    };
    Binder.prototype.Dispatch = function (eType) {
        var _this = this;
        var listeners = this.eventHandlers.Where(function (e) { return e.EventType === eType; });
        listeners.forEach(function (l) { return l.EventHandler(new CustomEventArg(_this, eType)); });
    };
    return Binder;
}());
//# sourceMappingURL=Binder.js.map
//state management isnt working right yet with regards to the put and the complete of the ajax call
var DataObject = (function () {
    function DataObject(serverObject) {
        if (serverObject === void 0) { serverObject = null; }
        this.changeCount = 0;
        this.changeQueued = false;
        this.eventListeners = new Array();
        this.objectListener = new Array();
        this.objectState = ObjectState.Clean;
        this.serverObject = serverObject;
        this.objectState = ObjectState.Clean;
    }
    Object.defineProperty(DataObject.prototype, "ObjectState", {
        get: function () {
            return this.objectState;
        },
        set: function (value) {
            var causeChangedEvent = value != this.objectState;
            this.objectState = value;
            if (value === ObjectState.Dirty) {
                this.OnObjectStateChanged();
            }
        },
        enumerable: true,
        configurable: true
    });
    DataObject.prototype.AddPropertyListener = function (prop, attr, handler) {
        this.eventListeners.Add(new PropertyListener(prop, attr, handler));
    };
    DataObject.prototype.RemovePropertyListeners = function () {
        this.eventListeners.Remove(function (o) { return true; });
    };
    DataObject.prototype.OnPropertyChanged = function (prop) {
        var _this = this;
        var listeners = this.eventListeners.Where(function (l) { return l.PropertyName === prop; });
        listeners.forEach(function (l) { return l.Handler(l.Attribute, _this[prop]); });
    };
    DataObject.prototype.AllPropertiesChanged = function () {
        var _this = this;
        this.eventListeners.forEach(function (l) { return l.Handler(l.Attribute, _this[l.PropertyName]); });
    };
    DataObject.prototype.InstigatePropertyChangedListeners = function (prop, canCauseDirty) {
        if (canCauseDirty === void 0) { canCauseDirty = true; }
        this.OnPropertyChanged(prop);
        if (canCauseDirty && this.ObjectState != ObjectState.Cleaning) {
            this.ObjectState = ObjectState.Dirty;
        }
    };
    DataObject.prototype.AddObjectStateListener = function (handler) {
        this.objectListener.Add(handler);
    };
    DataObject.prototype.RemoveObjectStateListener = function () {
        this.objectListener.Remove(function (o) { return true; });
    };
    DataObject.prototype.OnObjectStateChanged = function () {
        var _this = this;
        this.objectListener.forEach(function (o) { return o(_this); });
    };
    DataObject.prototype.OnElementChanged = function (value, prop) {
        this[prop] = value;
    };
    Object.defineProperty(DataObject.prototype, "ServerObject", {
        get: function () {
            return this.serverObject;
        },
        set: function (value) {
            this.serverObject = value;
        },
        enumerable: true,
        configurable: true
    });
    DataObject.prototype.SetServerProperty = function (prop, value) {
        var change = value != this.ServerObject[prop];
        this.ServerObject[prop] = value;
        if (change) {
            this.InstigatePropertyChangedListeners(prop, true);
        }
    };
    return DataObject;
}());
//# sourceMappingURL=DataObject.js.map
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
    View.prototype.Show = function (inst) {
        this.ViewInstance = inst;
        this.Preload ? this.Preload.Execute(this.postPreloaded.bind(this)) : this.postPreloaded();
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
                        window.Exception(e);
                    }
                });
                elements.forEach(function (e) {
                    if (e.Binder) {
                        try {
                            e.Binder.Execute(_this.ViewInstance);
                        }
                        catch (ex) {
                            window.Exception(e);
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
    View.prototype.AddListener = function (eType, eHandler) {
        var found = this.eventHandlers.First(function (h) { return h.EventType === eType && h.EventHandler === eHandler; });
        if (!found) {
            this.eventHandlers.Add(new Listener(eType, eHandler));
        }
    };
    View.prototype.RemoveListener = function (eType, eHandler) {
        this.eventHandlers.Remove(function (l) { return l.EventType === eType && eHandler === eHandler; });
    };
    View.prototype.RemoveListeners = function (eType) {
        this.eventHandlers.Remove(function (l) { return l.EventType === eType; });
    };
    View.prototype.Dispatch = function (eType) {
        var _this = this;
        var listeners = this.eventHandlers.Where(function (e) { return e.EventType === eType; });
        listeners.forEach(function (l) { return l.EventHandler(new CustomEventArg(_this, eType)); });
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
        if (this.completedCount === this._dataLoaders.length) {
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
//# sourceMappingURL=View.js.map
var ViewContainers = new Array();
var ViewContainer = (function () {
    function ViewContainer() {
        this.Views = new Array();
        this.IsDefault = false;
    }
    ViewContainer.prototype.Show = function (route) {
        var _this = this;
        this.NumberViewsShown = 0;
        ProgressManager.Show();
        this.Views.forEach(function (s) {
            s.AddListener(EventType.Completed, _this.ViewLoadCompleted.bind(_this));
            s.Show(route);
        });
    };
    ViewContainer.prototype.IsUrlPatternMatch = function (url) {
        var pattern = this.UrlPattern();
        if (pattern) {
            var regex = new RegExp(pattern, 'i');
            return url.match(regex) ? true : false;
        }
        return false;
    };
    ViewContainer.prototype.ViewLoadCompleted = function (arg) {
        if (arg.EventType === EventType.Completed) {
            this.NumberViewsShown = this.NumberViewsShown + 1;
        }
        if (this.NumberViewsShown === this.Views.length) {
            ProgressManager.Hide();
        }
    };
    return ViewContainer;
}());
//# sourceMappingURL=ViewContainer.js.map
var ViewInstance = (function () {
    function ViewInstance(parameters, viewContainer) {
        this.Parameters = parameters;
        this.ViewContainer = viewContainer;
    }
    return ViewInstance;
}());
//# sourceMappingURL=ViewInstance.js.map
var EventType;
(function (EventType) {
    EventType[EventType["Any"] = 0] = "Any";
    EventType[EventType["Completed"] = 1] = "Completed";
    EventType[EventType["Error"] = 2] = "Error";
    EventType[EventType["Aborted"] = 3] = "Aborted";
    EventType[EventType["Message"] = 4] = "Message";
})(EventType || (EventType = {}));
var CustomEventArg = (function () {
    function CustomEventArg(sender, eventType) {
        this.Cancel = false;
        this.Sender = sender;
        this.EventType = eventType;
    }
    return CustomEventArg;
}());
var Listener = (function () {
    function Listener(eventType, eventHandler) {
        this.EventType = eventType;
        this.EventHandler = eventHandler;
    }
    return Listener;
}());
var PropertyListener = (function () {
    function PropertyListener(propertyName, attribute, handler) {
        this.PropertyName = propertyName;
        this.Attribute = attribute;
        this.Handler = handler;
    }
    return PropertyListener;
}());
var ObjectState;
(function (ObjectState) {
    ObjectState[ObjectState["Dirty"] = 0] = "Dirty";
    ObjectState[ObjectState["Cleaning"] = 1] = "Cleaning";
    ObjectState[ObjectState["Clean"] = 2] = "Clean";
})(ObjectState || (ObjectState = {}));
//# sourceMappingURL=CustomEvent.js.map
var HistoryContainer;
(function (HistoryContainer) {
    var History = (function () {
        function History() {
            this.ViewInstances = new Array();
        }
        History.prototype.CurrentRoute = function () {
            if (this.ViewInstances != null && this.ViewInstances.length > 0) {
                return this.ViewInstances[this.ViewInstances.length - 1];
            }
            return null;
        };
        History.prototype.BackEvent = function (e) {
            HistoryManager.Back();
        };
        History.prototype.Add = function (viewInstance) {
            this.ViewInstances.Add(viewInstance);
            this.ManageRouteInfo(viewInstance);
        };
        History.prototype.Back = function () {
            if (this.ViewInstances.length > 1) {
                this.ViewInstances.splice(this.ViewInstances.length - 1, 1);
            }
            if (this.ViewInstances.length > 0) {
                var viewInfo = this.ViewInstances[this.ViewInstances.length - 1];
                var found = viewInfo.ViewContainer;
                found.Show(viewInfo);
                this.ManageRouteInfo(viewInfo);
            }
            else {
            }
        };
        History.prototype.ManageRouteInfo = function (inst) {
            var title = inst.ViewContainer.UrlTitle(inst);
            var documentTitle = inst.ViewContainer.DocumentTitle(inst);
            var url = inst.ViewContainer.Url(inst);
            if (url && !Is.NullOrEmpty(title) && history && history.pushState) {
                url = this.FormatUrl(!Is.NullOrEmpty(url) ? url.indexOf("/") != 0 ? "/" + url : url : "/");
                history.pushState(null, title, url);
            }
            if (documentTitle) {
                document.title = documentTitle;
            }
        };
        History.prototype.FormatUrl = function (url) {
            url = url.replace(/[^A-z0-9/]/g, "");
            return url;
        };
        return History;
    }());
    HistoryContainer.History = History;
})(HistoryContainer || (HistoryContainer = {}));
var HistoryManager = new HistoryContainer.History();
//# sourceMappingURL=HistoryManager.js.map
var Initializer;
(function (Initializer) {
    function WindowLoad(e) {
        if (document.readyState === "complete") {
            windowLoaded();
        }
        else {
            if (window.onload) {
                var curronload = window.onload;
                var newonload = function () {
                    curronload(e);
                    windowLoaded();
                };
                window.onload = newonload;
            }
            else {
                window.onload = function () {
                    windowLoaded();
                };
            }
        }
    }
    Initializer.WindowLoad = WindowLoad;
    function windowLoaded() {
        addViewContainers();
        setProgressElement();
        window.ShowByUrl(window.location.pathname.substring(1));
        window.addEventListener("popstate", HistoryManager.BackEvent);
    }
    function addViewContainers() {
        var ignoreThese = ignoreThese();
        for (var obj in window) {
            var name = getNameToTest(getStringOf(window[obj]), ignoreThese);
            if (!Is.NullOrEmpty(name)) {
                try {
                    var newObj = (new Function("return new " + name + "();"))();
                    if (Has.Properties(newObj, "IsDefault", "Views", "Show", "Url", "UrlPattern", "UrlTitle", "IsUrlPatternMatch")) {
                        ViewContainers.Add(newObj);
                    }
                }
                catch (e) {
                    window.Exception(e);
                }
            }
        }
    }
    function getNameToTest(rawFun, ignoreThese) {
        if (!Is.NullOrEmpty(rawFun)) {
            var pattern = "^function\\s(\\w+)\\(\\)";
            var match = rawFun.match(pattern);
            if (match && !ignoreThese.First(function (i) { return i === match[1]; })) {
                return match[1];
            }
        }
        return null;
    }
    function getStringOf(obj) {
        return obj && obj.toString ? obj.toString() : null;
    }
    function setProgressElement() {
        var pg = document.getElementById("progress");
        if (pg != null && Ajax) {
            ProgressManager.ProgressElement = pg;
        }
    }
    function ignoreThese() {
        return ["Ajax", "ViewContainer", "View", "ViewInstance", "Listener", "PropertyListener", "ObjectState",
            "HistoryManager", "Is", "Initializer", "Binder", "DataObject", "EventType", "CustomEventArg"];
    }
})(Initializer || (Initializer = {}));
Initializer.WindowLoad();
//# sourceMappingURL=Initializer.js.map
var Is;
(function (Is) {
    function Array(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }
    Is.Array = Array;
    function NullOrEmpty(value) {
        return value == null || (value.length && value.length === 0);
    }
    Is.NullOrEmpty = NullOrEmpty;
    function String(value) {
        return typeof value === 'string';
    }
    Is.String = String;
})(Is || (Is = {}));
var Has;
(function (Has) {
    function Properties(inObject) {
        var properties = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            properties[_i - 1] = arguments[_i];
        }
        var ret = true;
        try {
            for (var i = 0; i < properties.length; i++) {
                var value = inObject[properties[i]];
                if (inObject[properties[i]] === undefined) {
                    ret = false;
                    break;
                }
            }
        }
        catch (e) {
            if (window.Exception) {
                window.Exception(e);
            }
        }
        return ret;
    }
    Has.Properties = Properties;
})(Has || (Has = {}));
//# sourceMappingURL=Is.js.map
var ProgressManager;
(function (ProgressManager) {
    ProgressManager.ProgressElement = null;
    function Show() {
        if (ProgressManager.ProgressElement) {
            ProgressManager.ProgressElement.style.display = "inline";
        }
    }
    ProgressManager.Show = Show;
    function Hide() {
        if (ProgressManager.ProgressElement) {
            ProgressManager.ProgressElement.style.display = "none";
        }
    }
    ProgressManager.Hide = Hide;
})(ProgressManager || (ProgressManager = {}));
//# sourceMappingURL=ProgressManager.js.map
Array.prototype.Add = function (objectOrObjects) {
    if (!Is.Array(objectOrObjects)) {
        objectOrObjects = [objectOrObjects];
    }
    for (var i = 0; i < objectOrObjects.length; i++) {
        this.push(objectOrObjects[i]);
    }
};
Array.prototype.First = function (func) {
    if (func) {
        for (var i = 0; i < this.length; i++) {
            if (func(this[i])) {
                return this[i];
            }
        }
    }
    return this.length > 0 ? this[0] : null;
};
Array.prototype.Last = function (func) {
    if (func) {
        var pos = this.length - 1;
        while (pos > 0) {
            if (func(this[pos])) {
                return this[pos];
            }
            pos--;
        }
    }
    return this.length > 0 ? this[this.length - 1] : null;
};
Array.prototype.Remove = function (func) {
    if (func && this.length > 0) {
        var pos = this.length - 1;
        while (pos > 0) {
            if (func(this[pos])) {
                this.splice(pos, 1);
            }
            pos--;
        }
    }
    return this;
};
Array.prototype.Where = function (func) {
    var matches = new Array();
    for (var i = 0; i < this.length; i++) {
        if (func(this[i])) {
            matches.push(this[i]);
        }
    }
    return matches;
};
//# sourceMappingURL=Array.js.map
Date.prototype.Add = function (years, months, days, hours, minutes, seconds) {
    years = years ? years : 0;
    months = months ? months : 0;
    days = days ? days : 0;
    hours = hours ? hours : 0;
    minutes = minutes ? minutes : 0;
    seconds = seconds ? seconds : 0;
    return new Date(this.getFullYear() + years, this.getMonth() + months, this.getDate() + days, this.getHours() + hours, this.getMinutes() + minutes, this.getSeconds() + seconds, this.getMilliseconds());
};
//# sourceMappingURL=Date.js.map
HTMLElement.prototype.Get = function (predicate, notRecursive, nodes) {
    if (nodes == null) {
        nodes = new Array();
    }
    var that = this;
    var children = that.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType == 1
            && children[i].tagName.toLowerCase() != "svg") {
            var child = children[i];
            var fmatch = predicate(child);
            if (fmatch) {
                nodes.push(child);
            }
            if (!notRecursive && child.Get) {
                child.Get(predicate, notRecursive, nodes);
            }
        }
    }
    return nodes;
};
HTMLElement.prototype.First = function (predicate) {
    var that = this;
    var children = that.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType == 1
            && children[i].tagName.toLowerCase() != "svg") {
            var child = children[i];
            if (predicate(child)) {
                return child;
            }
        }
    }
    var found = null;
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType == 1 && children[i].tagName.toLowerCase() != "svg") {
            var c = children[i];
            if (c.First) {
                found = c.First(predicate);
                if (found) {
                    return found;
                }
            }
        }
    }
    return null;
};
HTMLElement.prototype.Parent = function (predicate) {
    var el = this;
    while (el && el.parentNode) {
        el = el.parentNode;
        if (predicate(el)) {
            return el;
        }
    }
    return null;
};
HTMLElement.prototype.Clear = function (predicate, notRecursive) {
    var that = this;
    var children = that.childNodes;
    if (!predicate) {
        while (children.length > 0) {
            that.removeChild(children[0]);
        }
    }
    else {
        var pos = children.length - 1;
        while (pos > 0) {
            if (children[pos].nodeType === 1) {
                var child = children[pos];
                if (predicate(child)) {
                    that.removeChild(child);
                }
                else if (!notRecursive && child.Clear) {
                    child.Clear(predicate, notRecursive);
                }
            }
            else {
                that.removeChild(children[pos]);
            }
            pos--;
        }
    }
};
HTMLElement.prototype.Remove = function () {
    this.parentNode.removeChild(this);
};
HTMLElement.prototype.AddListener = function (eventName, method) {
    this.addEventListener ? this.addEventListener(eventName, method) : this.attachEvent(eventName, method);
};
HTMLElement.prototype.Set = function (objectProperties) {
    var that = this;
    if (objectProperties) {
        for (var prop in objectProperties) {
            if (prop !== "cls" && prop !== "className") {
                if (prop.IsStyle()) {
                    that.style[prop] = objectProperties[prop];
                }
                else if (prop === "style") {
                    if (objectProperties.style.cssText) {
                        that.style.cssText = objectProperties.style.cssText;
                    }
                }
                else {
                    that[prop] = objectProperties[prop];
                }
            }
            else {
                that.className = null;
                that.className = objectProperties[prop];
            }
        }
    }
    return that;
};
HTMLElement.prototype.HasDataSet = function () {
    if (this["dataset"]) {
        var dataset = this["dataset"];
        for (var prop in dataset) {
            return true;
        }
    }
    return false;
};
HTMLElement.prototype.GetDataSetAttributes = function () {
    var ret = new Array();
    if (this["dataset"]) {
        var dataset = this["dataset"];
        for (var prop in dataset) {
            ret.Add({ Attribute: prop, Property: dataset[prop] });
        }
    }
    return ret;
};
//# sourceMappingURL=HTMLElement.js.map
HTMLSelectElement.prototype.AddOptions = function (arrayOrObject, valueProperty, displayProperty, selectedValue) {
    var select = this;
    var addOption = function (display, value) {
        var option = new Option(display, value);
        select["options"][select.options.length] = option;
        if (selectedValue && value === selectedValue) {
            option.selected = true;
        }
    };
    if (Is.Array(arrayOrObject)) {
        var temp = arrayOrObject;
        if (displayProperty && valueProperty) {
            temp.forEach(function (t) {
                addOption(t[displayProperty], t[valueProperty]);
            });
        }
        else if (temp.length > 1 && Is.String(temp[0])) {
            temp.forEach(function (t) {
                addOption(t, t);
            });
        }
    }
    else if (arrayOrObject) {
        for (var prop in arrayOrObject) {
            if (!(arrayOrObject[prop] && {}.toString.call(arrayOrObject[prop]) === '[object Function]')) {
                addOption(arrayOrObject[prop], arrayOrObject[prop]);
            }
        }
    }
    return select;
};
//# sourceMappingURL=HTMLSelectElement.js.map
String.prototype.Trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.Element = function () {
    var o = document.getElementById(this.toString());
    return o ? o : null;
};
String.prototype.CreateElement = function (eleAttrs) {
    var o = document.createElement(this);
    if (eleAttrs) {
        o.Set(eleAttrs);
    }
    return o;
};
String.prototype.CreateElementFromHtml = function () {
    var ret = new Array();
    var div = "div".CreateElement({ innerHTML: this });
    while (div.children.length > 0) {
        var child = div.children[div.children.length - 1];
        return child;
    }
};
String.prototype.IsStyle = function () {
    for (var prop in document.body.style) {
        if (prop.toLowerCase() === this.toLowerCase()) {
            return true;
        }
    }
    return false;
};
//# sourceMappingURL=String.js.map
Window.prototype.Exception = function () {
    var parameters = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        parameters[_i - 0] = arguments[_i];
    }
    if (parameters.length == 1) {
        var obj = {};
        for (var i = 0; i < parameters.length; i++) {
            obj["parameter" + i] = parameters[i];
        }
        alert(JSON.stringify(obj));
    }
    else if (parameters.length > 1) {
        alert(JSON.stringify(parameters[0]));
    }
    else {
        alert("Unknown error");
    }
};
Window.prototype.Show = function (type, webApiParameters) {
    var vc = new type();
    var vi = new ViewInstance(webApiParameters, vc);
    vc.Show(vi);
    HistoryManager.Add(vi);
};
Window.prototype.ShowByUrl = function (url) {
    var vi = ViewContainers.First(function (d) { return d.IsUrlPatternMatch(url); });
    vi = vi == null ? ViewContainers.First(function (d) { return d.IsDefault; }) : vi;
    if (vi) {
        var p = url.split("/");
        var viewInstance = new ViewInstance(p, vi);
        vi.Show(viewInstance);
        HistoryManager.Add(viewInstance);
    }
};
//# sourceMappingURL=Window.js.map