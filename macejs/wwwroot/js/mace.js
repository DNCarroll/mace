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
    Ajax.prototype.Submit = function (method, url, parameters, asRaw) {
        if (parameters === void 0) { parameters = null; }
        if (asRaw === void 0) { asRaw = false; }
        var t = this;
        t.Progress();
        url = t.getUrl(url);
        t.XHttp = new XMLHttpRequest();
        var x = t.XHttp;
        x.addEventListener("readystatechange", t.xStateChanged.bind(t), false);
        x.open(method, url, true);
        t.setHead();
        try {
            var p = asRaw ? parameters : t.getParameters(parameters);
            Is.NullOrEmpty(p) ? x.send() : x.send(p);
        }
        catch (e) {
            t.Progress(false);
            window.Exception(e);
        }
    };
    Ajax.prototype.xStateChanged = function (e) {
        var t = this, x = t.XHttp, s = x.status;
        if (t.isRequestReady()) {
            t.Progress(false);
            t.Dispatch(s === 200 || s === 204 || s === 201 ? EventType.Completed : EventType.Any);
        }
    };
    Ajax.prototype.getUrl = function (url) {
        var u = url, a = Ajax.Host;
        if (u.indexOf("http") == -1 && a) {
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
        var t = this, x = t.XHttp;
        if (t.ContentType) {
            x.setRequestHeader("content-type", t.ContentType);
        }
        if (t.Header) {
            var h = t.Header();
            if (h) {
                for (var p in h) {
                    x.setRequestHeader(p, h[p]);
                }
            }
        }
        if (Ajax.GlobalHeader) {
            var gh = Ajax.GlobalHeader();
            if (gh) {
                for (var p in gh) {
                    x.setRequestHeader(p, gh[p]);
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
        if (t.isRequestReady() && (s == 200) &&
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
//# sourceMappingURL=Ajax.js.map
var Binder = (function () {
    function Binder(primaryKeys, api, autoUpdate, TypeObject, staticProperties) {
        if (primaryKeys === void 0) { primaryKeys = null; }
        if (api === void 0) { api = null; }
        if (autoUpdate === void 0) { autoUpdate = false; }
        if (TypeObject === void 0) { TypeObject = null; }
        if (staticProperties === void 0) { staticProperties = null; }
        this._api = null;
        this.PrimaryKeys = new Array();
        this.WithProgress = true;
        this.eventHandlers = new Array();
        this.DataObjects = new DataObjectCacheArray();
        this.AutomaticUpdate = true;
        this.AutomaticDelete = true;
        this.AutomaticSelect = true;
        this.DataRowTemplates = new Array();
        this.initialLoad = true;
        this.RunWhenObjectsChange = null;
        var p = primaryKeys, t = this;
        t.StaticProperties = staticProperties;
        t.PrimaryKeys = p ? p : t.PrimaryKeys;
        t.AutomaticUpdate = autoUpdate;
        if (TypeObject) {
            t.NewObject = function (obj) {
                if (DataObject.IsDataObject(obj)) {
                    return obj;
                }
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
        if (DataObject.IsDataObject(obj)) {
            return obj;
        }
        return new DataObject(obj, null, this.StaticProperties);
    };
    Binder.prototype.Dispose = function () {
        var t = this;
        t.PrimaryKeys = null;
        t.Api = null;
        t.DataObjects.forEach(function (o) {
            o.RemoveObjectStateListener();
            o.RemovePropertyListeners();
        });
        t.RemoveListeners();
    };
    Binder.prototype.GetApiForAjax = function (parameters) {
        var a = this.Api();
        if (a) {
            a = a.indexOf("/") === 0 ? a.substring(1) : a;
            var api = a.split("/"), vp = api.Where(function (part) { return part.indexOf("?") > -1; }), p = parameters ? parameters.Where(function (p) { return api.First(function (ap) { return ap === p; }) === null; }) : new Array(), np = new Array();
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
            vp && vp.length === 0 ? p.forEach(function (o) { return np.Add(o); }) : null;
            return (np[0].indexOf("http") == -1 ? "/" : "") + np.join("/");
        }
        return null;
    };
    Binder.prototype.Execute = function (viewInstance) {
        if (viewInstance === void 0) { viewInstance = null; }
        var t = this;
        t.prepTemplates();
        try {
            if (t.DataObjects.length > 0 && t.initialLoad) {
                t.SetUpMore(t.DataObjects);
                t.DataObjects.forEach(function (obj) {
                    t.add(obj, true);
                });
                t.Dispatch(EventType.Completed);
            }
            else if (t.AutomaticSelect && !Is.NullOrEmpty(t.Api)) {
                t.loadFromVI(viewInstance);
            }
            else {
                t.Dispatch(EventType.Completed);
            }
        }
        catch (e) {
            alert("Failed to load data.");
        }
        t.initialLoad = false;
    };
    Binder.prototype.Refresh = function (viewInstance) {
        if (viewInstance === void 0) { viewInstance = null; }
        this.loadFromVI(viewInstance);
    };
    Binder.prototype.loadFromVI = function (vi) {
        var t = this;
        t.prepTemplates();
        vi = !Is.Alive(vi) ? HistoryManager.CurrentViewInstance() : vi;
        if (vi.RefreshBinding) {
            t.DataObjects = new DataObjectCacheArray();
            t.Element.RemoveDataRowElements();
        }
        var a = new Ajax(t.WithProgress, t.DisableElement), url = t.GetApiForAjax(vi.Parameters);
        if (!Is.NullOrEmpty(url)) {
            a.AddListener(EventType.Any, t.OnAjaxComplete.bind(this));
            a.Get(url);
        }
        else {
            t.Dispatch(EventType.Completed);
        }
    };
    Binder.prototype.OnAjaxComplete = function (arg) {
        var t = this, x = arg.Sender.XHttp, s = x.status;
        if (!t.isRedirecting(x)) {
            if (s === 200) {
                var d = arg.Sender.GetRequestData();
                if (d) {
                    this.RouteBinding(d);
                }
            }
            t.Dispatch(EventType.Completed);
        }
    };
    Binder.prototype.RouteBinding = function (data) {
        var t = this, d = data, da = t.DataObjects;
        if (Is.Array(d)) {
            d.forEach(function (d) { return t.add(t.NewObject(d)); });
            if (t.DataObjects.length > 0) {
                t.bindForm(t.DataObjects.Data[0]);
            }
        }
        else if (d) {
            var no = t.NewObject(d);
            da.Data.Add(no);
            t.Bind(no);
        }
        t.SetUpMore(d);
        da.SaveCache();
        t.Dispatch(EventType.Completed);
    };
    Binder.prototype.SetUpMore = function (d) {
        var t = this, tm = t.MoreElement, tms = "none";
        if (tm) {
            tms = t.DataObjects.length % t.MoreThreshold === 0 && d.length > 0 ? "inline" : tms;
            tm.style.display = tms;
        }
    };
    Binder.prototype.Delete = function (sender, ajaxDeleteFunction) {
        if (ajaxDeleteFunction === void 0) { ajaxDeleteFunction = null; }
        var o = sender.DataObject, t = this;
        if (!o) {
            var p = sender.parentElement;
            while (!o) {
                o = p.DataObject;
                p = p.parentElement;
                if (p === t.Element) {
                    break;
                }
            }
        }
        if (o) {
            var a = new Ajax(t.WithProgress, t.DisableElement), f = function () {
                var es = t.Element.Get(function (e) { return e.DataObject === o; }), td = t.DataObjects.Data, i = td.indexOf(o);
                es.forEach(function (e2) { return e2.parentElement.removeChild(e2); });
                //because we dont know what htey are doing with the row they maybe sending them back as changes
                //td.slice(i);
                td.forEach(function (o) { return o.InstigatePropertyChangedListeners("AlternatingRowClass", false); });
            }, afc = function (arg) {
                var err = function () {
                    var x = arg.Sender.XHttp, s = x.status;
                    if (!t.isRedirecting(x)) {
                        if ([204, 404, 200].indexOf(s) > -1) {
                            f();
                        }
                        else {
                            alert("Failed to delete row.");
                        }
                    }
                };
                ajaxDeleteFunction ? ajaxDeleteFunction(arg) : err();
                arg.EventType === EventType.Completed ? f() : null;
            }, af = function () {
                a.AddListener(EventType.Any, afc);
                a.Delete(t.Api(), o.ServerObject);
            };
            t.AutomaticDelete ? af() : f();
        }
    };
    Binder.prototype.InsertBefore = function (obj, beforeIndex) {
        this.add(this.NewObject(obj), false, beforeIndex);
    };
    Binder.prototype.Append = function (obj) {
        this.add(this.NewObject(obj));
    };
    Binder.prototype.PostAndAppend = function (obj) {
        var t = this, o = obj, api = t.Api();
        if (DataObject.IsDataObject(obj)) {
            o = obj.ServerObject;
        }
        if (api) {
            var a = new Ajax(t.WithProgress, t.DisableElement);
            a.AddListener(EventType.Any, t.OnUpdateComplete.bind(this));
            a.Post(api, o);
        }
    };
    Binder.prototype.PostAndInsertBefore = function (obj, childIndex) {
        var _this = this;
        var t = this, o = obj, api = t.Api(), i = childIndex;
        if (DataObject.IsDataObject(obj)) {
            o = obj.ServerObject;
        }
        if (api) {
            var a = new Ajax(t.WithProgress, t.DisableElement);
            a.AddListener(EventType.Any, function (arg) {
                var r = arg.Sender.GetRequestData();
                if (r) {
                    t.add(_this.NewObject(r), false, childIndex);
                }
            });
            a.Post(api, o);
        }
    };
    Binder.prototype.add = function (obj, shouldNotAddItsAlreadyCached, beforeIndex) {
        if (shouldNotAddItsAlreadyCached === void 0) { shouldNotAddItsAlreadyCached = false; }
        if (beforeIndex === void 0) { beforeIndex = -1; }
        var t = this;
        t.prepTemplates();
        if (t.DataRowTemplates.length > 0) {
            t.DataRowTemplates.forEach(function (d) {
                var ne = d.cloneNode(true), be = ne.Get(function (e) { return e.HasDataSet(); }), drf = t.DataRowFooter, pe = t.Element.tagName === "TABLE" ? t.Element.tBodies[0] : t.Element;
                be.Add(ne);
                if (beforeIndex > -1 && beforeIndex < pe.childNodes.length) {
                    drf = pe.children[beforeIndex];
                }
                drf ? pe.insertBefore(ne, drf) : pe.appendChild(ne);
                if (!shouldNotAddItsAlreadyCached) {
                    t.DataObjects.Add(obj);
                }
                obj.Container = t.DataObjects.Data;
                ne.onclick = function () {
                    if (Is.Alive(t.OnSelectedItemChanged)) {
                        t.OnSelectedItemChanged(obj);
                    }
                    t.bindForm(obj);
                    var prev = t.SelectedObject;
                    t.SelectedObject = obj;
                    if (prev) {
                        prev.InstigatePropertyChangedListeners("SelectedRowClass", false);
                    }
                    obj.InstigatePropertyChangedListeners("SelectedRowClass", false);
                };
                t.Bind(obj, be);
            });
        }
        else {
            t.Bind(obj, null);
        }
    };
    Binder.prototype.HookUpForm = function () {
        var t = this;
        if (Is.Alive(t.FormTemplateId)) {
            t.FormTemplate = t.FormTemplateId.Element();
            t.FormContainter = t.FormTemplate.parentElement;
        }
        if (t.DataObjects.length > 0) {
            var o = t.DataObjects.Data[0];
            t.SelectedObject = o;
            o.InstigatePropertyChangedListeners("SelectedRowClass", false);
            t.bindForm(o);
            if (Is.Alive(t.OnSelectedItemChanged)) {
                t.OnSelectedItemChanged(o);
            }
        }
    };
    Binder.prototype.bindForm = function (obj) {
        var t = this;
        if (Is.Alive(t.FormContainter) && Is.Alive(t.FormTemplate)) {
            t.FormContainter.Clear();
            var c = t.FormTemplate.cloneNode(true);
            t.FormContainter.appendChild(c);
            var eles = c.Get(function (e) { return e.HasDataSet(); });
            t.Bind(obj, eles);
        }
    };
    Binder.prototype.prepTemplates = function () {
        var t = this;
        if (t.DataRowTemplates.length === 0) {
            var e = t.Element.tagName === "TABLE" ? t.Element.tBodies[0].children : t.Element.children, r = new Array(), li = 0;
            for (var i = 0; i < e.length; i++) {
                if (e[i].getAttribute("data-template") != null) {
                    r.Add(e[i]);
                    li = i;
                }
            }
            t.DataRowFooter = e[e.length - 1] !== r[r.length - 1] ?
                e[e.length - 1] : null;
            r.forEach(function (r) {
                t.DataRowTemplates.Add(r);
                r.parentElement.removeChild(r);
            });
            var dmk = "data-morekeys", dmt = "data-morethreshold", more = t.Element.First(function (m) { return m.HasDataSet() && m.getAttribute(dmk) != null &&
                m.getAttribute(dmt) != null; });
            if (more) {
                t.MoreElement = more;
                t.MoreKeys = more.getAttribute(dmk).split(";");
                t.MoreThreshold = parseInt(more.getAttribute(dmt));
                more.onclick = function () {
                    t.More();
                };
            }
        }
    };
    Binder.prototype.objStateChanged = function (o) {
        var t = this, r = t.RunWhenObjectsChange;
        r ? r() : null;
        this.AutomaticUpdate ? this.Save(o) : null;
    };
    Binder.prototype.Save = function (obj) {
        if (!Is.Alive(t) || !Is.Alive(t.Api)) {
            var t = this, o = obj, api = t.Api();
            if (api && o.ObjectState === ObjectState.Dirty) {
                var a = new Ajax(t.WithProgress, t.DisableElement);
                a.AddListener(EventType.Any, t.OnUpdateComplete.bind(this));
                o.ObjectState = ObjectState.Cleaning;
                a.Put(api, o.ServerObject);
            }
        }
    };
    Binder.prototype.OnUpdateComplete = function (a) {
        var t = this, x = a.Sender.XHttp, da = t.DataObjects, td = a.Sender.GetRequestData(), rd = Is.Array(td) ? td : [td];
        if (!t.isRedirecting(x)) {
            if (x.status === 200) {
                for (var i = 0; i < rd.length; i++) {
                    var o = da.First(function (d) { return t.isPKMatch(d, rd[i]); });
                    if (o) {
                        t.SetServerObjectValue(o, rd[i]);
                        o.ObjectState = ObjectState.Clean;
                        da && da.length > 0 ? da.SaveCache() : null;
                    }
                    else {
                        t.add(t.NewObject(rd[i]));
                    }
                }
            }
            else {
                alert("Failed to update record.");
            }
        }
    };
    Binder.prototype.SaveDirty = function () {
        var t = this, a = t.Api(), d = t.DataObjects.Data;
        if (a && d && d.length > 0) {
            var c = d.Where(function (o) { return o.ObjectState === ObjectState.Dirty; }).Select(function (o) { return o.ServerObject; }), aj = new Ajax(t.WithProgress, t.DisableElement);
            aj.AddListener(EventType.Any, t.OnUpdateComplete.bind(this));
            aj.Submit("PUT", t.Api() + "/SaveDirty", c);
            d.forEach(function (o) { return o.ObjectState = ObjectState.Cleaning; });
        }
    };
    Binder.prototype.isRedirecting = function (x) {
        var s = x.status, r = x.getResponseHeader('Location');
        if ((s === 401 || s === 407 || s === 403) && r) {
            window.location.href = r;
            return true;
        }
        return false;
    };
    Binder.prototype.SetServerObjectValue = function (d, i) {
        for (var p in i) {
            !this.PrimaryKeys.First(function (k) { return k === p; }) ? d.SetServerProperty(p, i[p]) : null;
        }
    };
    Binder.prototype.isPKMatch = function (d, incoming) {
        var t = this;
        if (t != null && t.PrimaryKeys != null) {
            for (var i = 0; i < t.PrimaryKeys.length; i++) {
                if (d.ServerObject[t.PrimaryKeys[i]] != incoming[t.PrimaryKeys[i]]) {
                    return false;
                }
            }
        }
        return true;
    };
    Binder.prototype.Bind = function (o, eles) {
        if (eles === void 0) { eles = null; }
        var t = this;
        o.Binder = t;
        if (!eles) {
            eles = t.Element.Get(function (e) { return e.HasDataSet(); });
            eles.Add(t.Element);
        }
        o.AddObjectStateListener(t.objStateChanged.bind(this));
        eles.forEach(function (e) {
            e.DataObject = o;
            t.setListeners(e, o);
        });
        o.AllPropertiesChanged();
    };
    Binder.prototype.setListeners = function (ele, d) {
        var ba = ele.GetDataSetAttributes(), t = this;
        if (ele.tagName === "SELECT") {
            var ds = ba.First(function (f) { return f.Attribute === "datasource"; }), dm = ba.First(function (f) { return f.Attribute === "displaymember"; }), vm = ba.First(function (f) { return f.Attribute === "valuemember"; }), select = ele;
            if (ds && select.options.length == 0) {
                var fun = new Function("return " + ds.Property), data = fun();
                select.AddOptions(data, vm ? vm.Property : null, dm ? dm.Property : null);
            }
        }
        var eb = ["onclick", "onchange", "onload", "loaded"];
        var ntwb = ["binder", "datasource", "displaymember", "valuemember"];
        ba.forEach(function (b) {
            if (!eb.First(function (v) { return v === b.Attribute; }) &&
                !ntwb.First(function (v) { return v === b.Attribute; })) {
                var a = t.getAttribute(b.Attribute), tn = ele.tagName;
                t.setObjPropListener(b.Property, a, ele, d);
                if (["INPUT", "SELECT", "TEXTAREA"].indexOf(tn) > -1) {
                    var ea_1 = b.Attribute === "checked" && ele["type"] === "checkbox" ? "checked" :
                        ele["type"] === "radio" && b.Attribute === "checked" ? "value" : b.Attribute;
                    if (ea_1 && ["value", "checked"].indexOf(ea_1) > -1) {
                        if (Is.Alive(ele.onchange)) {
                            var temp;
                            temp = ele.onchange;
                            ele.removeEventListener("change", temp);
                        }
                        var fun_1 = function (evt) {
                            d.OnElementChanged.bind(d)(ele[ea_1], b.Property);
                        };
                        ele.addEventListener("change", fun_1);
                    }
                }
            }
        });
        var eba = ba.Where(function (a) { return eb.First(function (v) { return v === a.Attribute; }) !== null; });
        if (eba && eba.length > 0) {
            eba.forEach(function (a) {
                ele.DataObject = d;
                var body = a.Property;
                if (body) {
                    body = body.lastIndexOf(";") === body.length - 1 ? body : body + ";";
                    var fun = new Function("sender", body);
                    if (a.Attribute === "loaded") {
                        fun(ele);
                    }
                    else {
                        ele[a.Attribute] = function () {
                            fun(ele);
                            return;
                        };
                    }
                }
            });
        }
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
        var _this = this;
        var t = this, fun = function (atr, v) {
            if (Has.Properties(e, atr) && (atr !== "width" && atr !== "height")) {
                if (e.tagName === "INPUT" && e["type"] === "radio" && atr === "checked") {
                    var r = _this.Element.Get(function (e2) { return e2.DataObject === d && e2["type"] === "radio" && e2.dataset.checked === e.dataset.checked; });
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
                if (s) {
                    e.style[s] = v;
                }
                else if (atr === "for") {
                    e.setAttribute("for", v);
                }
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
        var t = this, vi = HistoryManager.CurrentViewInstance(), pbd = t.DataObjects.Data;
        if (pbd && pbd.length > 0) {
            var nvi = new ViewInstance(new Array(), vi.ViewContainer), o = pbd[pbd.length - 1], p = vi.Parameters;
            if (p != null) {
                for (var i = 0; i < p.length; i++) {
                    var v = p[i];
                    if (v === 0 && this._api.indexOf(v) === 0) {
                        continue;
                    }
                    nvi.Parameters.Add(v);
                }
            }
            this.MoreKeys.forEach(function (k) {
                nvi.Parameters.Add(o[k]);
            });
            this.loadFromVI(nvi);
        }
    };
    return Binder;
}());
//# sourceMappingURL=Binder.js.map
var DataObject = (function () {
    function DataObject(serverObject, propertiesThatShouldSubscribeToObjectStateChanged, staticProperties) {
        if (propertiesThatShouldSubscribeToObjectStateChanged === void 0) { propertiesThatShouldSubscribeToObjectStateChanged = null; }
        if (staticProperties === void 0) { staticProperties = null; }
        this.AlternateOnEvens = true;
        this.defaultRowClass = null;
        this.selectedRowClass = null;
        this.changeCount = 0;
        this.changeQueued = false;
        this.eLstenrs = new Array();
        this.oLstenrs = new Array();
        this.objectState = ObjectState.Clean;
        var so = serverObject, t = this;
        t.serverObject = so;
        t.SubscribeToObjectStateChange = propertiesThatShouldSubscribeToObjectStateChanged;
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
        if (t[p] === undefined) {
            odp ? odp(t, p, { 'get': g, 'set': s }) : null;
        }
    };
    Object.defineProperty(DataObject.prototype, "AlternatingRowClass", {
        get: function () {
            var t = this, ac = t.alternatingClass != null ? t.alternatingClass : DataObject.DefaultAlternatingRowClass;
            if (ac != null) {
                var i = t.Container.indexOf(this) + 1, ie = i % 2 == 0;
                return ie === t.AlternateOnEvens ? ac : null;
            }
            return null;
        },
        set: function (value) {
            this.alternatingClass = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataObject.prototype, "DefaultRowClass", {
        get: function () {
            if (this.AlternatingRowClass) {
                return this.AlternatingRowClass;
            }
            else {
                return this.defaultRowClass ? this.defaultRowClass : DataObject.DefaultRowClass;
            }
        },
        set: function (value) {
            this.defaultRowClass = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataObject.prototype, "SelectedRowClass", {
        get: function () {
            var t = this;
            if (Is.Alive(t.Binder) &&
                t === t.Binder.SelectedObject) {
                var t = this, ac = t.selectedRowClass != null ? t.selectedRowClass : DataObject.DefaultSelectedRowClass;
                return ac;
            }
            return t.DefaultRowClass;
        },
        set: function (value) {
            this.selectedRowClass = value;
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
            t.OnObjectStateChanged();
        },
        enumerable: true,
        configurable: true
    });
    DataObject.IsDataObject = function (object) {
        return 'ObjectState' in object;
    };
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
        var t = this, subs = t.SubscribeToObjectStateChange;
        subs ? subs.forEach(function (s) { return t.InstigatePropertyChangedListeners(s, false); }) : null;
        t.oLstenrs.forEach(function (o) { return o(t); });
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
    DataObject.DefaultAlternatingRowClass = null;
    DataObject.DefaultSelectedRowClass = null;
    DataObject.DefaultRowClass = null;
    return DataObject;
}());
//# sourceMappingURL=DataObject.js.map
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
//# sourceMappingURL=IView.js.map
//# sourceMappingURL=IViewContainer.js.map
var HistoryContainer;
(function (HistoryContainer) {
    var History = (function () {
        function History() {
            this.ViewInstances = new Array();
            this.eHandlrs = new Array();
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
            t.Dispatch(EventType.Completed);
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
                t.Dispatch(EventType.Completed);
            }
            else {
                //do nothing?
            }
        };
        History.prototype.ManageRouteInfo = function (viewInstance) {
            var vi = viewInstance, vc = vi.ViewContainer, t = vc.UrlTitle(vi), dt = vc.DocumentTitle(vi), h = history, u = vc.Url(vi);
            if (u !== null && !Is.NullOrEmpty(t) && h && h.pushState) {
                u = this.FormatUrl(!Is.NullOrEmpty(u) ? u.indexOf("/") != 0 ? "/" + u : u : "/");
                h.pushState(null, t, u);
            }
            if (dt) {
                document.title = dt;
            }
        };
        History.prototype.Manual = function (title, url, documentTitle) {
            if (documentTitle === void 0) { documentTitle = null; }
            document.title = documentTitle ? documentTitle : title;
            history.pushState(null, title, url);
        };
        History.prototype.FormatUrl = function (url) {
            url = url.replace(new RegExp("[^A-z0-9_/\\-]"), "g");
            return url;
        };
        History.prototype.AddListener = function (eventType, eventHandler) {
            var t = this, f = t.eHandlrs.First(function (h) { return h.EventType === eventType && h.EventHandler === eventHandler; });
            if (!f) {
                t.eHandlrs.Add(new Listener(eventType, eventHandler));
            }
        };
        History.prototype.RemoveListener = function (eventType, eventHandler) {
            this.eHandlrs.Remove(function (l) { return l.EventType === eventType && eventHandler === eventHandler; });
        };
        History.prototype.RemoveListeners = function (eventType) {
            this.eHandlrs.Remove(function (l) { return l.EventType === eventType; });
        };
        History.prototype.Dispatch = function (eventType) {
            var _this = this;
            var l = this.eHandlrs.Where(function (e) { return e.EventType === eventType; });
            l.forEach(function (l) { return l.EventHandler(new CustomEventArg(_this.CurrentViewInstance().ViewContainer, eventType)); });
        };
        return History;
    }());
    HistoryContainer.History = History;
})(HistoryContainer || (HistoryContainer = {}));
var HistoryManager = new HistoryContainer.History();
//# sourceMappingURL=HistoryManager.js.map
var WindowLoaded = (function () {
    function WindowLoaded(loadedEvent, shouldRunBeforeNavigation) {
        this.LoadedEvent = loadedEvent;
        this.ShouldRunBeforeNavigation = shouldRunBeforeNavigation;
        Initializer.WindowLoaded = this;
    }
    return WindowLoaded;
}());
var Initializer;
(function (Initializer) {
    function Execute(e) {
        if (document.readyState === "complete") {
            loadedWrapper(e);
        }
        else {
            window.onload = function () {
                loadedWrapper(e);
            };
        }
    }
    Initializer.Execute = Execute;
    function loadedWrapper(e) {
        var WL = Initializer.WindowLoaded, wL = windowLoaded;
        if (WL) {
            if (WL.ShouldRunBeforeNavigation) {
                WL.LoadedEvent(e, wL);
            }
            else {
                wL();
                WL.LoadedEvent(e, null);
            }
        }
        else {
            wL();
        }
    }
    function windowLoaded() {
        var w = window;
        setProgressElement();
        Navigate.Url(w.location.pathname.substring(1));
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
//# sourceMappingURL=Initializer.js.map
var Is;
(function (Is) {
    function Array(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }
    Is.Array = Array;
    function NullOrEmpty(value) {
        return value === undefined ||
            value === null ||
            (typeof value === "string" && value.length === 0);
    }
    Is.NullOrEmpty = NullOrEmpty;
    function Number(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
    Is.Number = Number;
    function String(value) {
        return typeof value === "string";
    }
    Is.String = String;
    function Alive(value) {
        return value !== undefined && value !== null;
    }
    Is.Alive = Alive;
    function HTMLElement(o) {
        return Is.Alive(o["tagName"]);
    }
    Is.HTMLElement = HTMLElement;
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
//# sourceMappingURL=Is.js.map
var Navigate;
(function (Navigate) {
    function Spa(type, parameters) {
        if (parameters === void 0) { parameters = null; }
        var p = Is.Array(parameters) ? parameters : new Array();
        if (Is.Alive(parameters) && !Is.Array(parameters)) {
            p.Add(parameters);
        }
        p = p && p.length == 1 && p[0] === "" ? null : p;
        var vc = Reflection.NewObject(type), vi = new ViewInstance(p, vc);
        vc.Show(vi);
        HistoryManager.Add(vi);
    }
    Navigate.Spa = Spa;
    function Url(url) {
        var vp = ViewContainer.VirtualPath;
        url = vp && url.length > 0 ? url.replace(vp, '') : url;
        url = url.length > 0 && url.indexOf("/") === 0 ? url.substr(1) : url;
        var vc = url.length === 0 ? ViewContainers.First(function (vc) { return vc.IsDefault; }) : ViewContainers.Where(function (vc) { return !vc.IsDefault; }).First(function (d) { return d.IsUrlPatternMatch(url); });
        vc = vc == null ? ViewContainers.First(function (d) { return d.IsDefault; }) : vc;
        if (vc) {
            var p = vc.Parameters(url), vi = new ViewInstance(p, vc, url);
            p = vi.Parameters;
            if (p && p.length && !Is.NullOrEmpty(ViewContainer.VirtualPath) && p[0] == ViewContainer.VirtualPath) {
                p.splice(0, 1);
            }
            while (p.length && p.length > 0 && Is.NullOrEmpty(p[0])) {
                p.splice(0, 1);
            }
            vc.Show(vi);
            HistoryManager.Add(vi);
        }
    }
    Navigate.Url = Url;
})(Navigate || (Navigate = {}));
//# sourceMappingURL=Navigate.js.map
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
//# sourceMappingURL=ProgressManager.js.map
Array.prototype.Select = function (keySelector) {
    var r = new Array(), t = this;
    for (var i = 0; i < t.length; i++) {
        r.push(keySelector(t[i]));
    }
    return r;
};
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
//# sourceMappingURL=Array.js.map
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
//# sourceMappingURL=Date.js.map
HTMLElement.prototype.InsertBeforeChild = function (childMatch, obj) {
    var p = this, b = p.Binder;
    var fc = p.First(childMatch);
    if (fc) {
        p = fc.parentElement;
        var i = p.IndexOf(fc);
        if (Is.Alive(i)) {
            p = this;
            p.InsertBefore(obj, i);
        }
    }
};
HTMLElement.prototype.InsertBefore = function (obj, index) {
    var p = this, b = p.Binder;
    if (Is.Alive(b)) {
        b.InsertBefore(obj, index);
    }
};
HTMLElement.prototype.Append = function (obj) {
    var p = this, b = p.Binder;
    if (Is.Alive(b)) {
        b.Append(obj);
    }
};
HTMLElement.prototype.PostAndAppend = function (obj) {
    var p = this, b = p.Binder;
    if (Is.Alive(b)) {
        b.PostAndAppend(obj);
    }
};
HTMLElement.prototype.PostAndInsertBeforeChild = function (childMatch, obj) {
    var p = this, b = p.Binder;
    var fc = p.First(childMatch);
    if (fc) {
        p = fc.parentElement;
        var i = p.IndexOf(fc);
        if (Is.Alive(i)) {
            p = this;
            p.PostAndInsertBefore(obj, i);
            return;
        }
    }
    p = this;
    p.PostAndAppend(obj);
};
HTMLElement.prototype.PostAndInsertBefore = function (obj, index) {
    var p = this, b = p.Binder;
    if (Is.Alive(b)) {
        b.PostAndInsertBefore(obj, index);
    }
};
HTMLElement.prototype.IndexOf = function (child) {
    var p = this, c = p.children;
    var i = c.length - 1;
    for (; i >= 0; i--) {
        if (child == c[i]) {
            return i;
        }
    }
    return undefined;
};
HTMLElement.prototype.Bind = function (obj, refresh) {
    if (refresh === void 0) { refresh = false; }
    if (refresh) {
        this.RemoveDataRowElements();
    }
    var binder = this.Binder;
    if (binder) {
        if (obj instanceof ViewInstance) {
            binder.Refresh(obj);
        }
        else if (obj instanceof Array) {
            var arr = obj;
            for (var i = 0; i < arr.length; i++) {
                var tempObj = arr[i];
                binder.Append(tempObj instanceof DataObject ? tempObj : new DataObject(tempObj));
            }
        }
        else if (obj) {
            binder.Append(obj instanceof DataObject ? obj : new DataObject(obj));
        }
    }
};
HTMLElement.prototype.RemoveDataRowElements = function () {
    var t = this;
    var dr = t.Get(function (e) { return e.getAttribute("data-template") != null; });
    dr.forEach(function (r) { return r.parentElement.removeChild(r); });
};
HTMLElement.prototype.SaveDirty = function () {
    var t = this, p = Is.Alive(t.Binder) ? t : t.Ancestor(function (p) { return Is.Alive(p.Binder); });
    if (p && p.Binder) {
        p.Binder.SaveDirty();
    }
};
HTMLElement.prototype.Save = function () {
    var t = this, p = t.Ancestor(function (p) { return p.Binder != null; });
    if (p && p.Binder) {
        p.Binder.Save(t.DataObject);
    }
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
HTMLElement.prototype.Delete = function () {
    var t = this, p = t.Ancestor(function (p) { return p.Binder != null; });
    if (p && p.Binder) {
        p.Binder.Delete(this, null);
    }
};
HTMLElement.prototype.Ancestor = function (func) {
    var p = this.parentElement;
    while (!func(p)) {
        p = p.parentElement;
    }
    return p;
};
//# sourceMappingURL=HTMLElement.js.map
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
//# sourceMappingURL=HTMLSelectElement.js.map
String.prototype.RemoveSpecialCharacters = function (replaceWithCharacter) {
    var s = this, p = null, r = "", rc = !Is.Alive(replaceWithCharacter) ? "-" : replaceWithCharacter;
    for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        var m = c.match(/\w/);
        if ((c === rc && p !== rc) || (m && m.length > 0)) {
            r += c;
            p = c;
        }
        else if (c === " " && p !== rc) {
            p = rc;
            r += p;
        }
    }
    return r;
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
//# sourceMappingURL=String.js.map
Window.prototype.Exception = function (parameters) {
    if (Is.Array(parameters)) {
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
        alert(parameters.toString());
    }
};
//# sourceMappingURL=Window.js.map