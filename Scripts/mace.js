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
        var t = this;
        t.showProgress();
        url = t.getUrl(url);
        t.XMLHttpRequest = new XMLHttpRequest();
        var x = t.XMLHttpRequest;
        x.addEventListener("readystatechange", t.onReaderStateChange.bind(t), false);
        x.open(method, url, true);
        x.setRequestHeader("content-type", t.ContentType);
        t.setCustomHeader();
        try {
            x.send(t.getParameters(parameters));
        }
        catch (e) {
            t.HideProgress();
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
            var de = this.DisableElement, d = "disabled";
            if (de) {
                if (Is.Array(de)) {
                    for (var i = 0; i < de.length; i++) {
                        show ? de[i].setAttribute(d, d) : de[i].removeAttribute(d);
                    }
                }
                else {
                    show ? de.setAttribute(d, d) : de.removeAttribute(d);
                }
            }
        }
    };
    Ajax.prototype.setCustomHeader = function () {
        var t = this;
        if (t.Header) {
            var h = t.Header();
            if (h) {
                for (var prop in h) {
                    t.XMLHttpRequest.setRequestHeader(prop, h[prop]);
                }
            }
        }
    };
    Ajax.prototype.getParameters = function (parameters) {
        var r = "";
        if (parameters && this.ContentType == "application/json; charset=utf-8") {
            r = JSON.stringify(parameters);
            r = r.replace(/\\\"__type\\\"\:\\\"[\w+\.?]+\\\"\,/g, "");
            r = r.replace(/\"__type\"\:\"[\w+\.?]+\"\,/g, "");
            r = r.replace(/<script/ig, "");
            r = r.replace(/script>/ig, "");
        }
        return r;
    };
    Ajax.prototype.GetRequestData = function () {
        var r = null, t = this;
        if (t.isRequestReady() && (t.XMLHttpRequest.status == 200 || t.XMLHttpRequest.status == 204) &&
            !Is.NullOrEmpty(t.XMLHttpRequest.responseText)) {
            r = t.XMLHttpRequest.responseText;
            try {
                r = JSON.parse(r);
                if (r.d) {
                    r = r.d;
                }
                t.convertProperties(r);
            }
            catch (e) {
                r = null;
                window.Exception(e);
            }
        }
        return r;
    };
    Ajax.prototype.convertProperties = function (object) {
        var km, t = this;
        if (Is.Array(object)) {
            for (var i = 0; i < object.length; i++) {
                var o = object[i];
                if (o) {
                    try {
                        km = km ? km : t.getKeyMap(o);
                    }
                    catch (e) {
                        window.Exception(e);
                    }
                    t.setValues(o, km);
                }
                for (var p in o) {
                    t.convertProperties(o[p]);
                }
            }
        }
        else if (object && typeof object === 'object') {
            km = t.getKeyMap(object);
            t.setValues(object, km);
            for (var p in object) {
                t.convertProperties(object[p]);
            }
        }
    };
    Ajax.prototype.getKeyMap = function (obj) {
        var km = new Array();
        for (var p in obj) {
            var v = obj[p];
            if (v && typeof v === 'string') {
                v = v.Trim();
                if (v.indexOf("/Date(") == 0 || v.indexOf("Date(") == 0) {
                    km.push({ Key: p, Type: "Date" });
                }
                else if (v.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/i)) {
                    km.push({ Key: p, Type: "UTCDate" });
                }
                else if (v.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g)) {
                    km.push({ Key: p, Type: "ZDate" });
                }
            }
        }
        return km;
    };
    Ajax.prototype.setValues = function (obj, keyMap) {
        for (var j = 0; j < keyMap.length; j++) {
            var k = keyMap[j].Key;
            var t = keyMap[j].Type;
            var v = obj[k];
            switch (t) {
                case "Date":
                    if (v) {
                        v = parseInt(v.substring(6).replace(")/", ""));
                        if (v > -62135575200000) {
                            v = new Date(v);
                            obj[k] = v;
                        }
                        else {
                            delete obj[k];
                        }
                    }
                    else {
                        obj[k] = new Date();
                    }
                    break;
                case "UTCDate":
                case "ZDate":
                    var t_1 = new Date(v);
                    if (this.UseAsDateUTC) {
                        t_1 = new Date(t_1.getUTCFullYear(), t_1.getUTCMonth(), t_1.getUTCDate());
                    }
                    else if (window["chrome"]) {
                        var os = new Date().getTimezoneOffset();
                        t_1 = t_1.Add(0, 0, 0, 0, os);
                    }
                    obj[k] = t_1;
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
            var newElement = t.CreateElementFromHtml();
            var boundElements = newElement.Get(function (e) { return e.HasDataSet(); });
            boundElements.Add(newElement);
            that.DataRowFooter ? that.Element.insertBefore(newElement, that.DataRowFooter) : that.Element.appendChild(newElement);
            that.DataObjects.Add(objectToAdd);
            that.BindToDataObject(objectToAdd, boundElements);
        });
    };
    Binder.prototype.prepDataRowTemplates = function () {
        var _this = this;
        if (this.DataRowTemplates.length == 0) {
            var elements = this.Element.children;
            var rows = new Array();
            var lastIndex = 0;
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].getAttribute("data-template") != null) {
                    rows.Add(elements[i]);
                    lastIndex = i;
                }
            }
            if (elements[elements.length - 1] != rows[rows.length - 1]) {
                this.DataRowFooter = elements[elements.length - 1];
            }
            rows.forEach(function (r) {
                _this.DataRowTemplates.Add(r.outerHTML);
                r.parentElement.removeChild(r);
            });
        }
    };
    Binder.prototype.onObjectStateChanged = function (obj) {
        if (this.AutomaticallyUpdatesToWebApi && this.WebApi) {
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this.OnUpdateComplete.bind(this));
            ajax.Put(this.WebApi, obj.ServerObject);
            obj.ObjectState = ObjectState.Clean;
        }
    };
    Binder.prototype.OnUpdateComplete = function (arg) {
        var _this = this;
        var incoming = arg.Sender.GetRequestData();
        var obj = this.DataObject ? this.DataObject : this.DataObjects.First(function (d) { return _this.IsPrimaryKeymatch(d, incoming); });
        obj ? this.SetServerObjectValue(obj, incoming) : null;
    };
    Binder.prototype.SetServerObjectValue = function (data, incoming) {
        for (var p in incoming) {
            if (!this.PrimaryKeys.First(function (k) { return k === p; })) {
                data.SetServerProperty(p, incoming[p]);
            }
        }
    };
    Binder.prototype.IsPrimaryKeymatch = function (data, incoming) {
        for (var i = 0; i < this.PrimaryKeys.length; i++) {
            if (data.ServerObject[this.PrimaryKeys[i]] != incoming[this.PrimaryKeys[i]]) {
                return false;
            }
        }
        return true;
    };
    Binder.prototype.BindToDataObject = function (dataObject, elementsToBind) {
        var _this = this;
        if (elementsToBind === void 0) { elementsToBind = null; }
        if (!elementsToBind) {
            elementsToBind = this.Element.Get(function (e) { return e.HasDataSet(); });
            elementsToBind.Add(this.Element);
        }
        if (this.IsFormBinding) {
            this.DataObject = dataObject;
        }
        dataObject.AddObjectStateListener(this.onObjectStateChanged.bind(this));
        elementsToBind.forEach(function (e) {
            var element = e;
            _this.setListeners(element, dataObject);
        });
        dataObject.AllPropertiesChanged();
    };
    Binder.prototype.setListeners = function (element, dataObject) {
        var _this = this;
        var boundAttributes = element.GetDataSetAttributes();
        if (element.tagName === "SELECT") {
            var datasource = boundAttributes.First(function (f) { return f.Attribute == "datasource"; });
            var displayMember = boundAttributes.First(function (f) { return f.Attribute == "displaymember"; });
            var valueMember = boundAttributes.First(function (f) { return f.Attribute == "valuemember"; });
            if (datasource) {
                var fun = new Function("return " + datasource.Property);
                var data = fun();
                element.AddOptions(data, valueMember ? valueMember.Property : null, displayMember ? displayMember.Property : null);
            }
        }
        var nonbindingAttributes = ["binder", "datasource", "displaymember", "valuemember"];
        boundAttributes.forEach(function (b) {
            if (!nonbindingAttributes.First(function (v) { return v === b.Attribute; })) {
                var attribute = _this.getAttribute(b.Attribute);
                _this.setObjectPropertyListener(b.Property, attribute, element, dataObject);
                var elementAttribute = b.Attribute === "checked" && element["type"] === "checkbox" ? "checked" : b.Attribute === "value" ? "value" : null;
                if (elementAttribute) {
                    var fun = function (evt) {
                        dataObject.OnElementChanged.bind(dataObject)(element[elementAttribute], b.Property);
                    };
                    element.addEventListener("change", fun);
                }
            }
        });
    };
    Binder.prototype.getAttribute = function (attribute) {
        attribute = attribute.toLowerCase();
        switch (attribute) {
            case "class":
            case "classname":
                return "className";
            case "innerhtml":
                return "innerHTML";
            case "readonly":
                return "readOnly";
            default:
                return attribute;
        }
    };
    Binder.prototype.setObjectPropertyListener = function (property, attribute, element, dataObject) {
        var _this = this;
        var objectPropertyChangedForElement = function (attribute, value) {
            if (Has.Properties(element, attribute)) {
                if (element.tagName === "INPUT" && element["type"] === "radio") {
                    var radios = element.parentElement.Get(function (e2) { return e2["name"] === element["name"] && e2["type"] === "radio"; });
                    radios.forEach(function (r) { return r["checked"] = false; });
                    var first = radios.First(function (r) { return r["value"] === value.toString(); });
                    first["checked"] = true;
                }
                else if (attribute === "className") {
                    element.className = null;
                    element.className = value;
                }
                else {
                    element[attribute] = value;
                }
            }
            else {
                var style = _this.getStyle(attribute);
                style ? element["style"][style] = value : element[attribute] = value;
            }
        };
        dataObject.AddPropertyListener(property, attribute, objectPropertyChangedForElement);
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
    Binder.prototype.AddListener = function (eventType, eventHandler) {
        var found = this.eventHandlers.First(function (h) { return h.EventType === eventType && h.EventHandler === eventHandler; });
        if (!found) {
            this.eventHandlers.Add(new Listener(eventType, eventHandler));
        }
    };
    Binder.prototype.RemoveListener = function (eventType, eventHandler) {
        this.eventHandlers.Remove(function (l) { return l.EventType === eventType && eventHandler === eventHandler; });
    };
    Binder.prototype.RemoveListeners = function (eventType) {
        if (eventType === void 0) { eventType = EventType.Any; }
        this.eventHandlers.Remove(function (l) { return eventType === EventType.Any || l.EventType === eventType; });
    };
    Binder.prototype.Dispatch = function (eventType) {
        var _this = this;
        var listeners = this.eventHandlers.Where(function (e) { return e.EventType === eventType; });
        listeners.forEach(function (l) { return l.EventHandler(new CustomEventArg(_this, eventType)); });
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
    DataObject.prototype.AddPropertyListener = function (propertyName, attribute, handler) {
        this.eventListeners.Add(new PropertyListener(propertyName, attribute, handler));
    };
    DataObject.prototype.RemovePropertyListeners = function () {
        this.eventListeners.Remove(function (o) { return true; });
    };
    DataObject.prototype.OnPropertyChanged = function (propertyName) {
        var _this = this;
        var listeners = this.eventListeners.Where(function (l) { return l.PropertyName === propertyName; });
        listeners.forEach(function (l) { return l.Handler(l.Attribute, _this[propertyName]); });
    };
    DataObject.prototype.AllPropertiesChanged = function () {
        var _this = this;
        this.eventListeners.forEach(function (l) { return l.Handler(l.Attribute, _this[l.PropertyName]); });
    };
    DataObject.prototype.InstigatePropertyChangedListeners = function (propertyName, canCauseDirty) {
        if (canCauseDirty === void 0) { canCauseDirty = true; }
        this.OnPropertyChanged(propertyName);
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
    DataObject.prototype.OnElementChanged = function (value, propertyName) {
        this[propertyName] = value;
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
    DataObject.prototype.SetServerProperty = function (propertyName, value) {
        var change = value != this.ServerObject[propertyName];
        this.ServerObject[propertyName] = value;
        if (change) {
            this.InstigatePropertyChangedListeners(propertyName, true);
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
    View.prototype.Show = function (viewInstance) {
        this.ViewInstance = viewInstance;
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
        History.prototype.ManageRouteInfo = function (viewInstance) {
            var title = viewInstance.ViewContainer.UrlTitle(viewInstance);
            var documentTitle = viewInstance.ViewContainer.DocumentTitle(viewInstance);
            var url = viewInstance.ViewContainer.Url(viewInstance);
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
        var ignoreThese = ignoreTheseNames();
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
    function getNameToTest(rawFunction, ignoreThese) {
        if (!Is.NullOrEmpty(rawFunction)) {
            var pattern = "^function\\s(\\w+)\\(\\)";
            var match = rawFunction.match(pattern);
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
    function ignoreTheseNames() {
        return ["Ajax", "ViewContainer", "View", "ViewInstance",
            "HistoryManager", "Is", "Initializer", "ViewContainers",
            "ActionEvent", "DataBinding", "ActionType", "AutoSuggest", "Binding",
            "KeyPress", "Thing", "What"];
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
})(Is || (Is = {}));
var Has;
(function (Has) {
    function Properties(inObject) {
        var properties = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            properties[_i - 1] = arguments[_i];
        }
        for (var i = 0; i < properties.length; i++) {
            if (inObject[properties[i]] === undefined) {
                return false;
            }
        }
        return true;
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
Array.prototype.Add = function () {
    var objectOrObjects = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objectOrObjects[_i - 0] = arguments[_i];
    }
    if (!Is.Array(objectOrObjects)) {
        objectOrObjects = [objectOrObjects];
    }
    for (var i = 0; i < objectOrObjects.length; i++) {
        this.push(objectOrObjects[i]);
    }
};
Array.prototype.First = function (func) {
    var l = this.length;
    if (func) {
        for (var i = 0; i < l; i++) {
            if (func(this[i])) {
                return this[i];
            }
        }
    }
    else if (l > 0) {
        return this[0];
    }
    return null;
};
Array.prototype.Last = function (func) {
    var l = this.length;
    if (func) {
        var p = l - 1;
        while (p > 0) {
            if (func(this[p])) {
                return this[p];
            }
            p--;
        }
    }
    if (l > 0) {
        return this[l - 1];
    }
    return null;
};
Array.prototype.Remove = function (func) {
    if (func) {
        var p = this.length - 1;
        while (p > 0) {
            var match = func(this[p]);
            if (match) {
                this.splice(p, 1);
            }
            p--;
        }
    }
    return this;
};
Array.prototype.Where = function (func) {
    var m = new Array();
    for (var i = 0; i < this.length; i++) {
        var c = this[i];
        if (func(c)) {
            m.push(c);
        }
    }
    return m;
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
HTMLElement.prototype.Get = function (func, notRecursive, nodes) {
    nodes == null ? nodes = new Array() : null;
    var chs = this.children;
    for (var i = 0; i < chs.length; i++) {
        if (chs[i].nodeType == 1
            && chs[i].tagName.toLowerCase() != "svg") {
            var c = chs[i];
            if (func(c)) {
                nodes.push(c);
            }
            if (!notRecursive && c.Get) {
                c.Get(func, notRecursive, nodes);
            }
        }
    }
    return nodes;
};
HTMLElement.prototype.First = function (predicate) {
    var chs = this.children;
    for (var i = 0; i < chs.length; i++) {
        if (chs[i].nodeType == 1 && chs[i].tagName.toLowerCase() != "svg") {
            var c = chs[i];
            if (predicate(c)) {
                return c;
            }
        }
    }
    for (var i = 0; i < chs.length; i++) {
        if (chs[i].nodeType == 1 && chs[i].tagName.toLowerCase() != "svg") {
            var c = chs[i];
            if (c.First) {
                var f = c.First(predicate);
                if (f) {
                    return f;
                }
            }
        }
    }
    return null;
};
HTMLElement.prototype.Clear = function () {
    var t = this;
    var chs = t.childNodes;
    while (chs.length > 0) {
        t.removeChild(chs[0]);
    }
};
HTMLElement.prototype.AddListener = function (eventName, method) {
    this.addEventListener ? this.addEventListener(eventName, method) : this.attachEvent(eventName, method);
};
HTMLElement.prototype.Set = function (objectProperties) {
    var t = this;
    if (objectProperties) {
        for (var p in objectProperties) {
            if (p != "cls" && p != "className") {
                if (p.IsStyle()) {
                    t.style[p] = objectProperties[p];
                }
                else if (p === "style") {
                    if (objectProperties.style.cssText) {
                        t.style.cssText = objectProperties.style.cssText;
                    }
                }
                else {
                    t[p] = objectProperties[p];
                }
            }
            else {
                t.className = null;
                t.className = objectProperties[p];
            }
        }
    }
    return t;
};
HTMLElement.prototype.HasDataSet = function () {
    var d = this["dataset"];
    if (d) {
        for (var p in d) {
            return true;
        }
    }
    return false;
};
HTMLElement.prototype.GetDataSetAttributes = function () {
    var r = new Array();
    var d = this["dataset"];
    if (d) {
        for (var p in d) {
            r.Add({ Attribute: p, Property: d[p] });
        }
    }
    return r;
};
//# sourceMappingURL=HTMLElement.js.map
HTMLSelectElement.prototype.AddOptions = function (arrayOrObject, valueProperty, displayProperty, selectedValue) {
    var s = this;
    var aoo = arrayOrObject;
    var ao = function (d, v) {
        var o = new Option(d, v);
        s["options"][s.options.length] = o;
        if (selectedValue && v === selectedValue) {
            o.selected = true;
        }
    };
    if (Is.Array(aoo)) {
        var ta = aoo;
        var dp = displayProperty;
        var vp = valueProperty;
        if (dp && vp) {
            ta.forEach(function (t) {
                ao(t[dp], t[vp]);
            });
        }
        else if (ta.length > 1 && typeof ta[0] === 'string') {
            ta.forEach(function (t) {
                ao(t, t);
            });
        }
    }
    else if (aoo) {
        for (var p in aoo) {
            if (!(aoo[p] && {}.toString.call(aoo[p]) === '[object Function]')) {
                ao(aoo[p], aoo[p]);
            }
        }
    }
    return s;
};
//# sourceMappingURL=HTMLSelectElement.js.map
String.prototype.Trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.Element = function () {
    var o = document.getElementById(this.toString());
    return o ? o : null;
};
String.prototype.CreateElement = function (objectProperties) {
    var o = document.createElement(this);
    if (objectProperties) {
        o.Set(objectProperties);
    }
    return o;
};
String.prototype.CreateElementFromHtml = function () {
    var d = "div".CreateElement({ innerHTML: this });
    var dcs = d.children;
    while (dcs.length > 0) {
        var c = dcs[dcs.length - 1];
        return c;
    }
};
String.prototype.IsStyle = function () {
    for (var p in document.body.style) {
        if (p.toLowerCase() === this.toLowerCase()) {
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
Window.prototype.Show = function (type, parameters) {
    var vc = new type();
    var vi = new ViewInstance(parameters, vc);
    vc.Show(vi);
    HistoryManager.Add(vi);
};
Window.prototype.ShowByUrl = function (url) {
    var vc = ViewContainers.First(function (d) { return d.IsUrlPatternMatch(url); });
    vc = vc == null ? ViewContainers.First(function (d) { return d.IsDefault; }) : vc;
    if (vc) {
        var p = url.split("/");
        var vi = new ViewInstance(p, vc);
        vc.Show(vi);
        HistoryManager.Add(vi);
    }
};
//# sourceMappingURL=Window.js.map