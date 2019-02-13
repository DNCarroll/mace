var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Binder = /** @class */ (function () {
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
        this.FormTemplates = new Array();
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
            return (np[0].indexOf("http") === -1 ? "/" : "") + np.join("/");
        }
        return null;
    };
    Binder.prototype.Execute = function (viewInstance) {
        if (viewInstance === void 0) { viewInstance = null; }
        var t = this;
        t.prepTemplates();
        try {
            if (t.DataObjects.length > 0 && t.initialLoad) {
                t.SetUpMore(t.DataObjects.Data);
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
        var vi = viewInstance ? viewInstance : HistoryManager.CurrentViewInstance();
        vi.RefreshBinding = true;
        this.loadFromVI(viewInstance);
    };
    Binder.prototype.loadFromVI = function (vi) {
        var t = this;
        t.prepTemplates();
        vi = !Is.Alive(vi) ? HistoryManager.CurrentViewInstance() : vi;
        if (vi.RefreshBinding) {
            t.DataObjects = new DataObjectCacheArray();
            t.Element.ClearBoundElements();
        }
        var a = new Ajax(t.WithProgress, t.DisableElement), url = t.GetApiForAjax(vi.Parameters);
        if (!Is.NullOrEmpty(url)) {
            url.Get(t.OnAjaxComplete.bind(this));
        }
        else {
            t.Dispatch(EventType.Completed);
        }
    };
    Binder.prototype.OnAjaxComplete = function (arg) {
        var t = this, x = arg.Sender.XHttp, s = x.status;
        if (!t.isRedirecting(x)) {
            var cd = true;
            if (s === 200) {
                var d = arg.Sender.GetRequestData();
                if (d) {
                    cd = false;
                    t.RouteBinding(d);
                }
            }
            if (cd) {
                t.Dispatch(EventType.Completed);
            }
        }
    };
    Binder.prototype.RouteBinding = function (data) {
        var t = this, d = data, da = t.DataObjects;
        if (Is.Array(d)) {
            d.forEach(function (d) { return t.add(t.NewObject(d)); });
            if (t.DataObjects.length > 0) {
                t.ResetSelectedObject();
            }
        }
        else if (d) {
            var no = t.NewObject(d);
            da.Data.Add(no);
            t.Bind(no);
        }
        t.SetUpMore(d);
        da.SaveCache();
        var vi = HistoryManager.CurrentViewInstance();
        if (vi && vi.RefreshBinding) {
            t.ResetSelectedObject();
            vi.RefreshBinding = false;
        }
        t.Dispatch(EventType.Completed);
        if (this.ElementBoundEvent) {
            this.ElementBoundEvent(this.Element);
        }
    };
    Binder.prototype.SetUpMore = function (d) {
        var t = this, tm = t.MoreElement, tms = "none";
        if (tm) {
            tms = d.length > 0 && d.length % t.MoreThreshold === 0 ? "inline" : tms;
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
            var f = function () {
                var es = t.Element.Get(function (e) { return e.DataObject === o; }), td = t.DataObjects.Data, i = td.indexOf(o);
                es.forEach(function (e2) { return e2.parentElement.removeChild(e2); });
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
                t.Api().Delete(afc, o.ServerObject);
            };
            t.AutomaticDelete ? af() : f();
        }
    };
    Binder.prototype.InsertBefore = function (obj, beforeIndex) {
        this.add(this.NewObject(obj), false, beforeIndex);
    };
    Binder.prototype.Append = function (obj) {
        var _this = this;
        if (Is.Array(obj)) {
            var arr = obj;
            arr.forEach(function (o) { return _this.add(o); });
        }
        else {
            this.add(this.NewObject(obj));
        }
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
        var t = this, drt = t.DataRowTemplates;
        t.prepTemplates();
        if (drt.length > 0) {
            drt.forEach(function (d) {
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
                    t.SelectedObject = obj;
                };
                t.Bind(obj, be);
                if (beforeIndex > -1) {
                    t.SelectedObject = obj;
                }
            });
        }
        else {
            t.Bind(obj, null);
            t.SelectedObject = obj;
        }
    };
    Binder.prototype.ResetSelectedObject = function () {
        this.SelectedObject = this.selectedObject;
    };
    Binder.prototype.prepTemplates = function () {
        var t = this, drt = t.DataRowTemplates;
        if (drt.length === 0) {
            var e = t.Element.tagName === "TABLE" ? t.Element.tBodies[0].children : t.Element.children, r = new Array(), li = 0;
            for (var i = 0; i < e.length; i++) {
                if (Is.Alive(e[i].getAttribute("data-template"))) {
                    r.Add(e[i]);
                    li = i;
                }
            }
            t.DataRowFooter = e[e.length - 1] !== r[r.length - 1] ?
                e[e.length - 1] : null;
            r.forEach(function (r) {
                drt.Add(r);
                r.parentElement.removeChild(r);
            });
            var dmk = "data-morekeys", dmt = "data-morethreshold", more = t.Element.First(function (m) { return m.HasDataSet() && Is.Alive(m.getAttribute(dmk)) &&
                Is.Alive(m.getAttribute(dmt)); });
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
        var t = this, o = obj, api = t.Api();
        if (Is.Alive(api) && o.ObjectState === ObjectState.Dirty) {
            var a = new Ajax(t.WithProgress, t.DisableElement);
            a.AddListener(EventType.Any, t.OnUpdateComplete.bind(this));
            o.ObjectState = ObjectState.Cleaning;
            a.Put(api, o.ServerObject);
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
        var t = this, a = t.Api(), d = t.DataObjects.Data.Where(function (o) { return o.ObjectState === ObjectState.Dirty; });
        if (a && d && d.length > 0) {
            var c = d.Select(function (o) { return o.ServerObject; }), aj = new Ajax(t.WithProgress, t.DisableElement);
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
        if (Is.Alive(t) && Is.Alive(t.PrimaryKeys)) {
            for (var i = 0; i < t.PrimaryKeys.length; i++) {
                if (d.ServerObject[t.PrimaryKeys[i]] !== incoming[t.PrimaryKeys[i]]) {
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
            if (ds && select.options.length === 0) {
                var fun = new Function("return " + ds.Property), data = fun();
                select.AddOptions(data, vm ? vm.Property : null, dm ? dm.Property : null);
            }
        }
        var eb = ["onclick", "onchange", "onload", "loaded"];
        var ntwb = ["binder", "datasource", "displaymember", "valuemember"];
        ba.forEach(function (b) {
            if (!Autofill.IsAutoFill(ele, d) &&
                !eb.First(function (v) { return v === b.Attribute; }) &&
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
        var t = this, fun = function (atr, v) {
            if (Has.Properties(e, atr) && (atr !== "width" && atr !== "height")) {
                if (e.tagName === "INPUT" && e["type"] === "radio" && atr === "checked") {
                    //var r = this.Element.Get(e2 => e2.DataObject === d && e2["type"] === "radio" && e2.dataset.checked === e.dataset.checked);
                    //r.forEach(r => r["checked"] = false);
                    //var f = r.First(r => r["value"] === v.toString());
                    //f ? f["checked"] = true : null;
                    e["checked"] = e["value"] === v.toString();
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
            var t = this, ftids = t.FormTemplateIds, fts = t.FormTemplates, dad = t.DataObjects.Data, v = value;
            v = !Is.Alive(v) && dad && dad.length > 0 ? dad[0] : v;
            if (v) {
                var prev = t.SelectedObject;
                if (prev) {
                    prev.InstigatePropertyChangedListeners("SelectedRowClass", false);
                }
                if (fts.length === 0 && Is.Alive(ftids) && ftids.length > 0) {
                    ftids.forEach(function (ft) {
                        var fte = ft.Element();
                        if (fte) {
                            var nt = {
                                Template: fte,
                                Container: fte.parentElement
                            };
                            fts.Add(nt);
                        }
                    });
                }
                t.selectedObject = v;
                t.selectedObject.InstigatePropertyChangedListeners("SelectedRowClass", false);
                if (Is.Alive(t.OnSelectedItemChanged)) {
                    t.OnSelectedItemChanged(t.selectedObject);
                }
                fts.forEach(function (ft) {
                    ft.Container.Clear();
                    var c = ft.Template.cloneNode(true);
                    ft.Container.appendChild(c);
                    var eles = c.Get(function (e) { return e.HasDataSet(); });
                    t.Bind(t.selectedObject, eles);
                });
            }
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
            if (Is.Alive(p)) {
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
var BinderWithBoundEvent = /** @class */ (function (_super) {
    __extends(BinderWithBoundEvent, _super);
    function BinderWithBoundEvent(pks, api, elementBoundEvent, TypeObject, autoUpdate) {
        if (elementBoundEvent === void 0) { elementBoundEvent = null; }
        if (TypeObject === void 0) { TypeObject = null; }
        if (autoUpdate === void 0) { autoUpdate = false; }
        var _this = _super.call(this, pks, api, autoUpdate, TypeObject) || this;
        var t = _this;
        t.ElementBoundEvent = elementBoundEvent;
        return _this;
    }
    return BinderWithBoundEvent;
}(Binder));
//# sourceMappingURL=Binder.js.map