var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Ajax = (function () {
    function Ajax(withProgress, disableElement) {
        if (withProgress === void 0) { withProgress = false; }
        if (disableElement === void 0) { disableElement = null; }
        this.DisableElement = null;
        this.WithProgress = false;
        this.UseAsDateUTC = false;
        this.ContentType = "application/json; charset=utf-8";
        this.eventHandlers = new Array();
        this.WithProgress = withProgress;
        this.DisableElement = disableElement;
    }
    Object.defineProperty(Ajax.prototype, "ResponseText", {
        get: function () {
            return this.XHttp.responseText;
        },
        enumerable: true,
        configurable: true
    });
    Ajax.prototype.Submit = function (method, url, parameters) {
        if (parameters === void 0) { parameters = null; }
        var t = this;
        t.Progress();
        url = t.getUrl(url);
        t.XHttp = new XMLHttpRequest();
        var x = t.XHttp;
        x.addEventListener("readystatechange", t.xStateChanged.bind(t), false);
        x.open(method, url, true);
        x.setRequestHeader("content-type", t.ContentType);
        t.setHead();
        try {
            x.send(t.getParameters(parameters));
        }
        catch (e) {
            t.Progress(false);
            window.Exception(e);
        }
    };
    Ajax.prototype.xStateChanged = function (e) {
        var t = this, x = t.XHttp;
        if (t.isRequestReady()) {
            t.Progress(false);
            t.Dispatch(x.status === 200 || x.status === 204 ? EventType.Completed : EventType.Error);
        }
    };
    Ajax.prototype.getUrl = function (url) {
        var u = url, a = Ajax.Host;
        if (u.indexOf("http") == -1 && !Is.NullOrEmpty(a)) {
            u = a + (u.indexOf("/") == 0 ? u : "/" + u);
        }
        return u;
    };
    Ajax.prototype.isRequestReady = function () {
        var x = this.XHttp;
        return x && x.readyState == 4;
    };
    Ajax.prototype.Progress = function (show) {
        if (show === void 0) { show = true; }
        if (this.WithProgress) {
            var pm = ProgressManager;
            show ? pm.Show() : pm.Hide();
            var de = this.DisableElement, d = "disabled", f = function (e) {
                show ? e.setAttribute(d, d) : e.removeAttribute(d);
            };
            if (de) {
                if (Is.Array(de)) {
                    for (var i = 0; i < de.length; i++) {
                        f(de[i]);
                    }
                }
                else {
                    f(de);
                }
            }
        }
    };
    Ajax.prototype.setHead = function () {
        var t = this;
        if (t.Header) {
            var h = t.Header();
            if (h) {
                for (var p in h) {
                    t.XHttp.setRequestHeader(p, h[p]);
                }
            }
        }
    };
    Ajax.prototype.getParameters = function (parameters) {
        var r = "", p = parameters;
        if (p && this.ContentType === "application/json; charset=utf-8") {
            r = JSON.stringify(p).replace(/\\\"__type\\\"\:\\\"[\w+\.?]+\\\"\,/g, "")
                .replace(/\"__type\"\:\"[\w+\.?]+\"\,/g, "")
                .replace(/<script/ig, "")
                .replace(/script>/ig, "");
        }
        return r;
    };
    Ajax.prototype.GetRequestData = function () {
        var r = null, t = this, x = this.XHttp, s = x.status;
        if (t.isRequestReady() && (s == 200 || s == 204) &&
            !Is.NullOrEmpty(x.responseText)) {
            r = x.responseText;
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
    Ajax.prototype.convertProperties = function (obj) {
        var km, t = this;
        if (Is.Array(obj)) {
            for (var i = 0; i < obj.length; i++) {
                var o = obj[i];
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
        else if (obj && typeof obj === 'object') {
            km = t.getKeyMap(obj);
            t.setValues(obj, km);
            for (var p in obj) {
                t.convertProperties(obj[p]);
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
            var k = keyMap[j].Key, t = keyMap[j].Type, v = obj[k];
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
    Ajax.prototype.Get = function (url, prmtrs) {
        if (prmtrs === void 0) { prmtrs = null; }
        this.Submit("GET", url, prmtrs);
    };
    Ajax.prototype.Put = function (url, prmtrs) {
        if (prmtrs === void 0) { prmtrs = null; }
        this.Submit("PUT", url, prmtrs);
    };
    Ajax.prototype.Post = function (url, prmtrs) {
        if (prmtrs === void 0) { prmtrs = null; }
        this.Submit("POST", url, prmtrs);
    };
    Ajax.prototype.Delete = function (url, prmtrs) {
        if (prmtrs === void 0) { prmtrs = null; }
        this.Submit("DELETE", url, prmtrs);
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
        var l = this.eventHandlers.Where(function (e) { return e.EventType === eventType || e.EventType === EventType.Any; });
        l.forEach(function (l) { return l.EventHandler(new CustomEventArg(_this, eventType)); });
    };
    return Ajax;
}());
//disable the active context or readonly it while the new stuff is coming in?
var Binder = (function () {
    function Binder(primaryKeys, api, TypeObject, staticProperties) {
        if (primaryKeys === void 0) { primaryKeys = null; }
        if (api === void 0) { api = null; }
        if (TypeObject === void 0) { TypeObject = null; }
        if (staticProperties === void 0) { staticProperties = null; }
        this._api = null;
        this.PrimaryKeys = new Array();
        this.WithProgress = true;
        this.eventHandlers = new Array();
        this.DataObjects = new Array();
        this.AutomaticUpdate = true;
        this.AutomaticSelect = true;
        this.DataRowTemplates = new Array();
        this.IsFormBinding = false;
        var p = primaryKeys, t = this;
        t.StaticProperties = staticProperties;
        t.PrimaryKeys = p ? p : t.PrimaryKeys;
        if (TypeObject) {
            t.NewObject = function (obj) {
                return new TypeObject(obj);
            };
        }
        t._api = api;
    }
    Binder.prototype.ApiPrefix = function () {
        return "/Api/";
    };
    Binder.prototype.Api = function () {
        var t = this;
        if (!t._api) {
            var r = Reflection, n = r.GetName(t.constructor);
            n = n.replace("Binder", "");
            t._api = t.ApiPrefix() + n;
        }
        return t._api;
    };
    Binder.prototype.NewObject = function (obj) {
        return new DataObject(obj, this.StaticProperties);
    };
    Binder.prototype.Dispose = function () {
        var t = this, d = t.DataObject;
        t.PrimaryKeys = null;
        t.Api = null;
        if (d) {
            d.RemoveObjectStateListener();
            d.RemovePropertyListeners();
        }
        t.DataObjects.forEach(function (o) {
            o.RemoveObjectStateListener();
            o.RemovePropertyListeners();
        });
        t.RemoveListeners();
    };
    Binder.prototype.GetApiForAjax = function (parameters) {
        var a = this.Api();
        if (a) {
            a = a.indexOf("/") == 0 ? a.substring(1) : a;
            var api = a.split("/"), vp = api.Where(function (part) { return part.indexOf("?") > -1; }), p = parameters ? parameters.Where(function (p) { return api.First(function (ap) { return ap == p; }) == null; }) : new Array(), np = new Array();
            var pos = 0;
            for (var i = 0; i < api.length; i++) {
                var ta = api[i];
                if (ta.indexOf("?") > -1) {
                    if (p.length > pos) {
                        np.Add(p[pos]);
                    }
                    pos++;
                }
                else {
                    np.Add(ta);
                }
            }
        }
        if (vp && vp.length == 0) {
            p.forEach(function (o) { return np.Add(o); });
        }
        return "/" + np.join("/");
    };
    Binder.prototype.Execute = function (viewInstance) {
        if (viewInstance === void 0) { viewInstance = null; }
        var t = this;
        if (t.AutomaticSelect && !Is.NullOrEmpty(t.Api)) {
            var a = new Ajax(t.WithProgress, t.DisableElement), url = t.GetApiForAjax(viewInstance.Parameters);
            a.AddListener(EventType.Completed, t.OnAjaxComplete.bind(this));
            a.Get(url);
        }
        else {
            t.Dispatch(EventType.Completed);
        }
    };
    Binder.prototype.OnAjaxComplete = function (arg) {
        var t = this;
        if (arg.EventType === EventType.Completed) {
            var d = arg.Sender.GetRequestData();
            if (d) {
                if (Is.Array(d)) {
                    d.forEach(function (d) { return t.Add(t.NewObject(d)); });
                    var tm = t.MoreElement, tms = "none";
                    if (tm) {
                        tms = t.DataObjects.length % t.MoreThreshold == 0 && d.length > 0 ? "inline" : tms;
                        tm.style.display = tms;
                    }
                }
                else if (d) {
                    t.IsFormBinding = true;
                    t.Bind(t.NewObject(d));
                }
                t.Dispatch(EventType.Completed);
            }
        }
    };
    //delete row return a certain type of response?
    //200, 202, 204
    Binder.prototype.Delete = function (sender, ajaxDeleteFunction) {
        if (ajaxDeleteFunction === void 0) { ajaxDeleteFunction = null; }
        var o = sender.DataObject, t = this;
        if (!o) {
            var p = sender.parentElement;
            while (!o || p !== t.Element) {
                o = p.DataObject;
                p = p.parentElement;
            }
        }
        if (o) {
            var a = new Ajax(t.WithProgress, t.DisableElement), f = function () {
                var es = t.Element.Get(function (e) { return e.DataObject === o; }), td = t.DataObjects, i = td.indexOf(o);
                es.forEach(function (e2) { return e2.parentElement.removeChild(e2); });
                td.splice(i);
                td.forEach(function (o) { return o.InstigatePropertyChangedListeners("AlternatingRowClass", false); });
            }, afc = function (a) {
                var err = function () {
                    if (a.EventType === EventType.Error) {
                        throw "Failed to delete row.";
                    }
                };
                ajaxDeleteFunction ? ajaxDeleteFunction(a) : err();
                a.EventType === EventType.Completed ? f() : null;
            }, af = function () {
                a.AddListener(EventType.Any, afc);
                a.Delete(t.Api(), o);
            };
            t.AutomaticUpdate ? af() : f();
        }
    };
    Binder.prototype.Add = function (obj) {
        var t = this;
        t.prepTemplates();
        t.DataRowTemplates.forEach(function (d) {
            var ne = d.CreateElementFromHtml(), be = ne.Get(function (e) { return e.HasDataSet(); }), drf = t.DataRowFooter;
            be.Add(ne);
            drf ? t.Element.insertBefore(ne, drf) : t.Element.appendChild(ne);
            t.DataObjects.Add(obj);
            obj.Container = t.DataObjects;
            t.Bind(obj, be);
        });
    };
    Binder.prototype.prepTemplates = function () {
        var t = this;
        if (t.DataRowTemplates.length == 0) {
            var e = t.Element.children, r = new Array(), li = 0;
            for (var i = 0; i < e.length; i++) {
                if (e[i].getAttribute("data-template") != null) {
                    r.Add(e[i]);
                    li = i;
                }
            }
            if (e[e.length - 1] != r[r.length - 1]) {
                t.DataRowFooter = e[e.length - 1];
            }
            r.forEach(function (r) {
                t.DataRowTemplates.Add(r.outerHTML);
                r.parentElement.removeChild(r);
            });
            var dmk = "data-morekeys", dmt = "data-morethreshold", more = t.Element.First(function (m) { return m.HasDataSet() && m.getAttribute(dmk) != null &&
                m.getAttribute(dmt) != null; });
            if (more) {
                t.MoreElement = more;
                t.MoreKeys = more.getAttribute(dmk).split(";");
                t.MoreThreshold = parseInt(more.getAttribute(dmt));
                t.MoreElement.onclick = function () {
                    t.More();
                };
            }
        }
    };
    Binder.prototype.objStateChanged = function (o) {
        var t = this;
        if (t.AutomaticUpdate && t.Api) {
            var a = new Ajax(t.WithProgress, t.DisableElement);
            a.AddListener(EventType.Completed, t.OnUpdateComplete.bind(this));
            a.Put(t.Api(), o.ServerObject);
            o.ObjectState = ObjectState.Clean;
        }
    };
    Binder.prototype.OnUpdateComplete = function (a) {
        var t = this, i = a.Sender.GetRequestData(), o = t.DataObject ? t.DataObject : t.DataObjects.First(function (d) { return t.isPKMatch(d, i); });
        o ? t.SetServerObjectValue(o, i) : null;
    };
    Binder.prototype.SetServerObjectValue = function (d, i) {
        for (var p in i) {
            if (!this.PrimaryKeys.First(function (k) { return k === p; })) {
                d.SetServerProperty(p, i[p]);
            }
        }
    };
    Binder.prototype.isPKMatch = function (d, incoming) {
        var t = this;
        for (var i = 0; i < t.PrimaryKeys.length; i++) {
            if (d.ServerObject[t.PrimaryKeys[i]] != incoming[t.PrimaryKeys[i]]) {
                return false;
            }
        }
        return true;
    };
    Binder.prototype.Bind = function (o, eles) {
        if (eles === void 0) { eles = null; }
        var t = this;
        if (!eles) {
            eles = t.Element.Get(function (e) { return e.HasDataSet(); });
            eles.Add(t.Element);
        }
        if (t.IsFormBinding) {
            t.DataObject = o;
        }
        o.AddObjectStateListener(t.objStateChanged.bind(this));
        eles.forEach(function (e) {
            e.DataObject = o;
            t.setListeners(e, o);
        });
        o.AllPropertiesChanged();
        //is there a more element        
    };
    Binder.prototype.setListeners = function (ele, d) {
        var ba = ele.GetDataSetAttributes(), t = this;
        if (ele.tagName === "SELECT") {
            var ds = ba.First(function (f) { return f.Attribute == "datasource"; }), dm = ba.First(function (f) { return f.Attribute == "displaymember"; }), vm = ba.First(function (f) { return f.Attribute == "valuemember"; });
            if (ds) {
                var fun = new Function("return " + ds.Property), data = fun();
                ele.AddOptions(data, vm ? vm.Property : null, dm ? dm.Property : null);
            }
        }
        var nba = ["binder", "datasource", "displaymember", "valuemember"];
        ba.forEach(function (b) {
            if (!nba.First(function (v) { return v === b.Attribute; })) {
                var a = t.getAttribute(b.Attribute);
                t.setObjPropListener(b.Property, a, ele, d);
                var ea_1 = b.Attribute === "checked" && ele["type"] === "checkbox" ? "checked" : b.Attribute === "value" ? "value" : null;
                if (ea_1) {
                    var fun_1 = function (evt) {
                        d.OnElementChanged.bind(d)(ele[ea_1], b.Property);
                    };
                    ele.addEventListener("change", fun_1);
                }
            }
        });
    };
    Binder.prototype.getAttribute = function (a) {
        a = a.toLowerCase();
        switch (a) {
            case "class":
            case "classname":
                return "className";
            case "innerhtml":
                return "innerHTML";
            case "readonly":
                return "readOnly";
            default:
                return a;
        }
    };
    Binder.prototype.setObjPropListener = function (p, a, e, d) {
        var t = this, fun = function (atr, v) {
            if (Has.Properties(e, atr)) {
                if (e.tagName === "INPUT" && e["type"] === "radio") {
                    var r = e.parentElement.Get(function (e2) { return e2["name"] === e["name"] && e2["type"] === "radio"; });
                    r.forEach(function (r) { return r["checked"] = false; });
                    var f = r.First(function (r) { return r["value"] === v.toString(); });
                    f ? f["checked"] = true : null;
                }
                else if (atr === "className") {
                    e.className = null;
                    e.className = v;
                }
                else {
                    e[atr] = v;
                }
            }
            else {
                var s = t.getStyle(atr);
                s ? e["style"][s] = v : e[atr] = v;
            }
        };
        d.AddPropertyListener(p, a, fun);
    };
    Binder.prototype.getStyle = function (v) {
        for (var p in document.body.style) {
            if (p.toLowerCase() === v.toLowerCase()) {
                return p;
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
    Binder.prototype.AddListener = function (et, eh) {
        var f = this.eventHandlers.First(function (h) { return h.EventType === et && h.EventHandler === eh; });
        if (!f) {
            this.eventHandlers.Add(new Listener(et, eh));
        }
    };
    Binder.prototype.RemoveListener = function (et, eh) {
        this.eventHandlers.Remove(function (l) { return l.EventType === et && eh === eh; });
    };
    Binder.prototype.RemoveListeners = function (et) {
        if (et === void 0) { et = EventType.Any; }
        this.eventHandlers.Remove(function (l) { return et === EventType.Any || l.EventType === et; });
    };
    Binder.prototype.Dispatch = function (et) {
        var _this = this;
        var l = this.eventHandlers.Where(function (e) { return e.EventType === et; });
        l.forEach(function (l) { return l.EventHandler(new CustomEventArg(_this, et)); });
    };
    Binder.prototype.More = function () {
        var pb = this.Element.Binder, vi = HistoryManager.CurrentViewInstance(), pbd = pb.DataObjects;
        if (pbd && pbd.length > 0) {
            var nvi = new ViewInstance(new Array(), vi.ViewContainer), o = pbd[pbd.length - 1], p = vi.Parameters;
            if (p != null) {
                for (var i = 0; i < p.length; i++) {
                    var v = p[i];
                    if (v == 0 && this._api.indexOf(v) == 0) {
                        continue;
                    }
                    nvi.Parameters.Add(v);
                }
            }
            this.MoreKeys.forEach(function (k) {
                nvi.Parameters.Add(o[k]);
            });
            pb.Execute(nvi);
        }
    };
    return Binder;
}());
//state management isnt working right yet with regards to the put and the complete of the ajax call
var DataObject = (function () {
    function DataObject(serverObject, staticProperties) {
        if (staticProperties === void 0) { staticProperties = null; }
        this.AlternateOnEvens = true;
        this.changeCount = 0;
        this.changeQueued = false;
        this.eLstenrs = new Array();
        this.oLstenrs = new Array();
        this.objectState = ObjectState.Clean;
        var so = serverObject, t = this;
        t.serverObject = so;
        staticProperties ?
            staticProperties.forEach(function (s) {
                if (!Has.Properties(so, s)) {
                    so[s] = null;
                }
            }) : null;
        t.objectState = ObjectState.Clean;
        for (var p in so) {
            t.setProps(p, so);
        }
    }
    DataObject.prototype.setProps = function (p, o) {
        var t = this, g = function () { return o[p]; }, s = function (v) { t.SetServerProperty(p, v); }, odp = Object.defineProperty;
        if (!t[p]) {
            odp ? odp(t, p, { 'get': g, 'set': s }) : null;
        }
    };
    Object.defineProperty(DataObject.prototype, "AlternatingRowClass", {
        get: function () {
            var t = this, ac = t.alternatingClass != null ? t.alternatingClass : DataObject.DefaultAlternatingRowClass;
            if (ac != null) {
                var i = t.Container.indexOf(this) + 1, ie = i % 2 == 0;
                return ie == t.AlternateOnEvens ? ac : null;
            }
            return null;
        },
        set: function (value) {
            this.alternatingClass = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataObject.prototype, "ObjectState", {
        get: function () {
            return this.objectState;
        },
        set: function (value) {
            var t = this;
            t.objectState = value;
            if (value === ObjectState.Dirty) {
                t.OnObjectStateChanged();
            }
        },
        enumerable: true,
        configurable: true
    });
    DataObject.prototype.AddPropertyListener = function (p, a, h) {
        this.eLstenrs.Add(new PropertyListener(p, a, h));
    };
    DataObject.prototype.RemovePropertyListeners = function () {
        this.eLstenrs.Remove(function (o) { return true; });
    };
    DataObject.prototype.OnPropertyChanged = function (p) {
        var _this = this;
        var l = this.eLstenrs.Where(function (l) { return l.PropertyName === p; });
        l.forEach(function (l) { return l.Handler(l.Attribute, _this[p]); });
    };
    DataObject.prototype.AllPropertiesChanged = function () {
        var _this = this;
        this.eLstenrs.forEach(function (l) { return l.Handler(l.Attribute, _this[l.PropertyName]); });
    };
    DataObject.prototype.InstigatePropertyChangedListeners = function (p, canCauseDirty) {
        if (canCauseDirty === void 0) { canCauseDirty = true; }
        this.OnPropertyChanged(p);
        if (canCauseDirty && this.ObjectState != ObjectState.Cleaning) {
            this.ObjectState = ObjectState.Dirty;
        }
    };
    DataObject.prototype.AddObjectStateListener = function (h) {
        this.oLstenrs.Add(h);
    };
    DataObject.prototype.RemoveObjectStateListener = function () {
        this.oLstenrs.Remove(function (o) { return true; });
    };
    DataObject.prototype.OnObjectStateChanged = function () {
        var _this = this;
        this.oLstenrs.forEach(function (o) { return o(_this); });
    };
    DataObject.prototype.OnElementChanged = function (v, p) {
        this[p] = v;
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
    DataObject.prototype.SetServerProperty = function (p, v) {
        var t = this, change = v != t.ServerObject[p];
        t.ServerObject[p] = v;
        if (change) {
            t.InstigatePropertyChangedListeners(p, true);
        }
    };
    return DataObject;
}());
DataObject.DefaultAlternatingRowClass = null;
var CacheStrategy;
(function (CacheStrategy) {
    CacheStrategy[CacheStrategy["None"] = 0] = "None";
    CacheStrategy[CacheStrategy["ViewAndPreload"] = 1] = "ViewAndPreload";
    CacheStrategy[CacheStrategy["View"] = 2] = "View";
    CacheStrategy[CacheStrategy["Preload"] = 3] = "Preload";
})(CacheStrategy || (CacheStrategy = {}));
var View = (function () {
    function View(cacheStrategy, containerId, viewPath) {
        if (cacheStrategy === void 0) { cacheStrategy = CacheStrategy.View; }
        if (containerId === void 0) { containerId = "content"; }
        if (viewPath === void 0) { viewPath = null; }
        this.CacheStrategy = CacheStrategy.None;
        this._containerID = null;
        this.eHandlrs = new Array();
        this.binders = new Array();
        this.preload = null;
        this.url = viewPath;
        this._containerID = containerId;
        this.CacheStrategy = cacheStrategy;
    }
    View.prototype.Prefix = function () {
        return "/Views/";
    };
    View.prototype.Url = function () {
        if (!this.url) {
            var n = Reflection.GetName(this.constructor).replace("View", "");
            this.url = this.Prefix() + n + ".html";
        }
        return this.url;
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
        t.binders = new Array();
        t.binders.forEach(function (b) { return b.RemoveListeners(EventType.Any); });
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
            if (ele.length > 0) {
                ele.forEach(function (e) {
                    try {
                        var a = e.getAttribute("data-binder");
                        if (a) {
                            var fun = new Function("return new " + a + (a.indexOf("Binder(") == 0 ? "" : "()"));
                            e.Binder = fun();
                            e.Binder.AddListener(EventType.Completed, t.OnBinderComplete.bind(_this));
                            e.Binder.Element = e;
                            t.binders.Add(e.Binder);
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
        var _this = this;
        var t = this;
        if (a.EventType === EventType.Completed) {
            t.countBindersReported = t.countBindersReported + 1;
            if (t.binders.length === t.countBindersReported) {
                t.MoveStuffFromCacheToReal();
                t.binders.forEach(function (b) {
                    b.RemoveListener(EventType.Completed, t.OnBinderComplete.bind(_this));
                });
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
            dataLoaders[_i] = arguments[_i];
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
var ViewContainers = new Array();
var ViewContainer = (function () {
    function ViewContainer() {
        this.Views = new Array();
        this.IsDefault = false;
        var n = Reflection.GetName(this.constructor);
        this.UrlBase = n.replace("ViewContainer", "");
        this.UrlBase = this.UrlBase.replace("Container", "");
        ViewContainers.push(this);
    }
    ViewContainer.prototype.Show = function (route) {
        var rp = route.Parameters, t = this;
        if (rp.length == 1 && t.IsDefault) {
            route.Parameters = new Array();
        }
        t.NumberViewsShown = 0;
        ProgressManager.Show();
        t.Views.forEach(function (s) {
            s.AddListener(EventType.Completed, t.ViewLoadCompleted.bind(t));
            s.Show(route);
        });
    };
    ViewContainer.prototype.IsUrlPatternMatch = function (url) {
        if (!Is.NullOrEmpty(url)) {
            var p = this.UrlPattern(), up = (url.indexOf("/") == 0 ? url.substr(1) : url).split("/")[0];
            if (p) {
                var regex = new RegExp(p, 'i');
                return up.match(regex) ? true : false;
            }
        }
        return false;
    };
    ViewContainer.prototype.ViewLoadCompleted = function (a) {
        if (a.EventType === EventType.Completed) {
            this.NumberViewsShown = this.NumberViewsShown + 1;
        }
        if (this.NumberViewsShown === this.Views.length) {
            ProgressManager.Hide();
        }
    };
    ViewContainer.prototype.Url = function (route) {
        var rp = route.Parameters, t = this;
        if (rp) {
            if (rp.length == 1 && t.IsDefault) {
                rp = new Array();
            }
            if (rp.length > 0) {
                var p = rp[0] == t.UrlBase ?
                    rp.slice(1).join("/") :
                    rp.join("/");
                return t.UrlBase + (p.length > 0 ? "/" + p : "");
            }
        }
        return t.UrlBase;
    };
    ViewContainer.prototype.DocumentTitle = function (route) {
        return this.UrlBase;
    };
    ViewContainer.prototype.UrlPattern = function () {
        return this.UrlBase;
    };
    ViewContainer.prototype.UrlTitle = function (route) {
        return this.UrlBase;
    };
    return ViewContainer;
}());
var SingleViewContainer = (function (_super) {
    __extends(SingleViewContainer, _super);
    function SingleViewContainer(cacheStrategy, containerId, isDefault) {
        if (cacheStrategy === void 0) { cacheStrategy = CacheStrategy.View; }
        if (containerId === void 0) { containerId = "content"; }
        if (isDefault === void 0) { isDefault = false; }
        var _this = _super.call(this) || this;
        var t = _this;
        t.IsDefault = isDefault;
        t.Views.push(new View(cacheStrategy, containerId, "/Views/" + t.UrlBase + ".html"));
        return _this;
    }
    return SingleViewContainer;
}(ViewContainer));
var ViewInstance = (function () {
    function ViewInstance(parameters, viewContainer) {
        this.Parameters = parameters;
        this.ViewContainer = viewContainer;
    }
    return ViewInstance;
}());
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
var HistoryContainer;
(function (HistoryContainer) {
    var History = (function () {
        function History() {
            this.ViewInstances = new Array();
        }
        History.prototype.CurrentViewInstance = function () {
            var vi = this.ViewInstances;
            return vi != null && vi.length > 0 ? vi[vi.length - 1] : null;
        };
        History.prototype.BackEvent = function (e) {
            HistoryManager.Back();
        };
        History.prototype.Add = function (viewInstance) {
            var vi = viewInstance, t = this;
            t.ViewInstances.Add(vi);
            t.ManageRouteInfo(vi);
        };
        History.prototype.Back = function () {
            var t = this, vi = t.ViewInstances;
            if (vi.length > 1) {
                vi.splice(vi.length - 1, 1);
            }
            if (vi.length > 0) {
                var i = vi[vi.length - 1], f = i.ViewContainer;
                f.Show(i);
                t.ManageRouteInfo(i);
            }
            else {
            }
        };
        History.prototype.ManageRouteInfo = function (viewInstance) {
            var vi = viewInstance, vc = vi.ViewContainer, t = vc.UrlTitle(vi), dt = vc.DocumentTitle(vi), h = history, u = vc.Url(vi);
            if (u && !Is.NullOrEmpty(t) && h && h.pushState) {
                u = this.FormatUrl(!Is.NullOrEmpty(u) ? u.indexOf("/") != 0 ? "/" + u : u : "/");
                h.pushState(null, t, u);
            }
            if (dt) {
                document.title = dt;
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
var Initializer;
(function (Initializer) {
    function Execute(e) {
        var w = window;
        if (document.readyState === "complete") {
            windowLoaded();
            Initializer.WindowLoaded ? Initializer.WindowLoaded(e) : null;
        }
        else {
            w.onload = function () {
                windowLoaded();
                Initializer.WindowLoaded ? Initializer.WindowLoaded(e) : null;
            };
        }
    }
    Initializer.Execute = Execute;
    function windowLoaded() {
        var w = window;
        setProgressElement();
        w.ShowByUrl(w.location.pathname.substring(1));
        w.addEventListener("popstate", HistoryManager.BackEvent);
    }
    function setProgressElement() {
        var pg = document.getElementById("progress");
        if (pg != null) {
            ProgressManager.ProgressElement = pg;
        }
    }
})(Initializer || (Initializer = {}));
var Reflection;
(function (Reflection) {
    function GetName(o, ignoreThese) {
        if (ignoreThese === void 0) { ignoreThese = new Array(); }
        var r = o && o.toString ? o.toString() : null;
        if (!Is.NullOrEmpty(r)) {
            var p = "^function\\s(\\w+)\\(\\)", m = r.match(p);
            if (m && !ignoreThese.First(function (i) { return i === m[1]; })) {
                return m[1];
            }
        }
        return null;
    }
    Reflection.GetName = GetName;
    function NewObject(type) {
        return new type();
    }
    Reflection.NewObject = NewObject;
})(Reflection || (Reflection = {}));
Initializer.Execute();
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
        var p = properties;
        for (var i = 0; i < p.length; i++) {
            if (inObject[p[i]] === undefined) {
                return false;
            }
        }
        return true;
    }
    Has.Properties = Properties;
})(Has || (Has = {}));
var ProgressManager;
(function (ProgressManager) {
    ProgressManager.ProgressElement = null;
    function Show() {
        var pe = ProgressManager.ProgressElement;
        if (pe) {
            pe.style.display = "inline";
        }
    }
    ProgressManager.Show = Show;
    function Hide() {
        var pe = ProgressManager.ProgressElement;
        if (pe) {
            pe.style.display = "none";
        }
    }
    ProgressManager.Hide = Hide;
})(ProgressManager || (ProgressManager = {}));
Array.prototype.Add = function () {
    var objectOrObjects = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objectOrObjects[_i] = arguments[_i];
    }
    var o = objectOrObjects;
    if (!Is.Array(o)) {
        o = [o];
    }
    for (var i = 0; i < o.length; i++) {
        this.push(o[i]);
    }
};
Array.prototype.First = function (func) {
    var t = this, l = t.length;
    if (func) {
        for (var i = 0; i < l; i++) {
            if (func(t[i])) {
                return t[i];
            }
        }
    }
    else if (l > 0) {
        return t[0];
    }
    return null;
};
Array.prototype.Last = function (func) {
    var t = this, l = t.length;
    if (func) {
        var p = l - 1;
        while (p > 0) {
            if (func(t[p])) {
                return t[p];
            }
            p--;
        }
    }
    if (l > 0) {
        return t[l - 1];
    }
    return null;
};
Array.prototype.Remove = function (func) {
    var t = this;
    if (func) {
        var p = t.length - 1;
        while (p > 0) {
            if (func(t[p])) {
                t.splice(p, 1);
            }
            p--;
        }
    }
    return t;
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
Date.prototype.Add = function (y, m, d, h, mm, s) {
    y = y ? y : 0;
    m = m ? m : 0;
    d = d ? d : 0;
    h = h ? h : 0;
    mm = mm ? mm : 0;
    s = s ? s : 0;
    var t = this;
    return new Date(t.getFullYear() + y, t.getMonth() + m, t.getDate() + d, t.getHours() + h, t.getMinutes() + mm, t.getSeconds() + s, t.getMilliseconds());
};
Date.prototype.ToyyyymmddHHMMss = function () {
    var f = function (v) {
        return (v <= 9 ? '0' : '') + v.toString();
    };
    var d = f(this.getDate()), m = f(this.getMonth() + 1), y = this.getFullYear(), h = f(this.getHours()), M = f(this.getMinutes()), s = f(this.getSeconds());
    return '' + y + '-' + m + '-' + d + ' ' + h + ":" + M + ":" + s;
};
HTMLElement.prototype.Get = function (func, notRecursive, nodes) {
    var n = nodes == null ? new Array() : nodes;
    var chs = this.children;
    for (var i = 0; i < chs.length; i++) {
        var c = chs[i];
        if (c.nodeType == 1 && c.tagName.toLowerCase() != "svg") {
            if (func(c)) {
                n.push(c);
            }
            if (!notRecursive && c.Get) {
                c.Get(func, notRecursive, n);
            }
        }
    }
    return n;
};
HTMLElement.prototype.First = function (func) {
    var chs = this.children;
    for (var i = 0; i < chs.length; i++) {
        var c = chs[i];
        if (c.nodeType == 1 && c.tagName.toLowerCase() != "svg") {
            if (func(c)) {
                return c;
            }
        }
    }
    for (var i = 0; i < chs.length; i++) {
        var c = chs[i];
        if (c.nodeType == 1 && c.tagName.toLowerCase() != "svg") {
            if (c.First) {
                var f = c.First(func);
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
    var t = this, op = objectProperties;
    if (op) {
        for (var p in op) {
            if (p != "cls" && p != "className") {
                if (p.IsStyle()) {
                    t.style[p] = op[p];
                }
                else if (p === "style") {
                    if (op.style.cssText) {
                        t.style.cssText = op.style.cssText;
                    }
                }
                else {
                    t[p] = op[p];
                }
            }
            else {
                t.className = null;
                t.className = op[p];
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
HTMLElement.prototype.DeleteFromServer = function () {
    var p = this.parentElement;
    while (!p.Binder) {
        p = p.parentElement;
        if (p === document.body) {
            break;
        }
    }
    if (p && p.Binder) {
        p.Binder.Delete(this);
    }
};
HTMLElement.prototype.Ancestor = function (func) {
    var p = this.parentElement;
    while (!func(p)) {
        p = p.parentElement;
    }
    return p;
};
HTMLSelectElement.prototype.AddOptions = function (arrayOrObject, valueProperty, displayProperty, selectedValue) {
    var s = this, sv = selectedValue, aoo = arrayOrObject, ao = function (d, v) {
        var o = new Option(d, v);
        s["options"][s.options.length] = o;
        if (sv && v === sv) {
            o.selected = true;
        }
    };
    if (Is.Array(aoo)) {
        var ta = aoo, dp = displayProperty, vp = valueProperty;
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
String.prototype.Trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.Element = function () {
    return document.getElementById(this.toString());
};
String.prototype.CreateElement = function (objectProperties) {
    var o = document.createElement(this), op = objectProperties;
    if (op) {
        o.Set(op);
    }
    return o;
};
String.prototype.CreateElementFromHtml = function () {
    var d = "div".CreateElement({ innerHTML: this }), dcs = d.children;
    while (dcs.length > 0) {
        var c = dcs[dcs.length - 1];
        return c;
    }
};
String.prototype.IsStyle = function () {
    for (var p in document.body.style) {
        return p.toLowerCase() === this.toLowerCase();
    }
    return false;
};
Window.prototype.Exception = function () {
    var parameters = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        parameters[_i] = arguments[_i];
    }
    if (parameters.length == 1) {
        var o = {};
        for (var i = 0; i < parameters.length; i++) {
            o["parameter" + i] = parameters[i];
        }
        alert(JSON.stringify(o));
    }
    else if (parameters.length > 1) {
        alert(JSON.stringify(parameters[0]));
    }
    else {
        alert("Unknown error");
    }
};
Window.prototype.Show = function (type) {
    var parameters = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        parameters[_i - 1] = arguments[_i];
    }
    var vc = Reflection.NewObject(type), vi = new ViewInstance(parameters, vc);
    vc.Show(vi);
    HistoryManager.Add(vi);
};
Window.prototype.ShowByUrl = function (url) {
    var vc = ViewContainers.First(function (d) { return d.IsUrlPatternMatch(url); });
    vc = vc == null ? ViewContainers.First(function (d) { return d.IsDefault; }) : vc;
    if (vc) {
        var p = url.split("/"), vi = new ViewInstance(p, vc);
        vc.Show(vi);
        HistoryManager.Add(vi);
    }
};
//# sourceMappingURL=mace.js.map