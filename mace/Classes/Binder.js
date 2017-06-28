//disable the active context or readonly it while the new stuff is coming in?
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
        this.DataObjects = new Array();
        this.AutomaticUpdate = true;
        this.AutomaticSelect = true;
        this.DataRowTemplates = new Array();
        this.IsFormBinding = false;
        this.RunWhenObjectsChange = null;
        var p = primaryKeys, t = this;
        t.StaticProperties = staticProperties;
        t.PrimaryKeys = p ? p : t.PrimaryKeys;
        t.AutomaticUpdate = autoUpdate;
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
        return new DataObject(obj, null, this.StaticProperties);
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
        }
        vp && vp.length === 0 ? p.forEach(function (o) { return np.Add(o); }) : null;
        return "/" + np.join("/");
    };
    Binder.prototype.Execute = function (viewInstance) {
        if (viewInstance === void 0) { viewInstance = null; }
        var t = this;
        if (t.AutomaticSelect && !Is.NullOrEmpty(t.Api)) {
            var a = new Ajax(t.WithProgress, t.DisableElement), url = t.GetApiForAjax(viewInstance.Parameters);
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
                    if (Is.Array(d)) {
                        d.forEach(function (d) { return t.Add(t.NewObject(d)); });
                        var tm = t.MoreElement, tms = "none";
                        if (tm) {
                            tms = t.DataObjects.length % t.MoreThreshold === 0 && d.length > 0 ? "inline" : tms;
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
            else {
                alert("Failed to retrieve data from web site.");
            }
        }
    };
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
                    //needs testing
                    var x = a.Sender.XHttp, s = x.status;
                    if (!t.isRedirecting(x)) {
                        s === 500 ?
                            alert("Server error contact web site administrators.") :
                            s !== 204 ?
                                alert("Failed to delete row.") : null;
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
            //casting here may be an issue
            var ne = d.cloneNode(true), be = ne.Get(function (e) { return e.HasDataSet(); }), drf = t.DataRowFooter, pe = t.Element.tagName === "TABLE" ? t.Element.tBodies[0] : t.Element;
            be.Add(ne);
            drf ? pe.insertBefore(ne, drf) : pe.appendChild(ne);
            t.DataObjects.Add(obj);
            obj.Container = t.DataObjects;
            t.Bind(obj, be);
        });
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
                t.MoreElement.onclick = function () {
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
        if (api && o.ObjectState === ObjectState.Dirty) {
            var a = new Ajax(t.WithProgress, t.DisableElement);
            a.AddListener(EventType.Any, t.OnUpdateComplete.bind(this));
            o.ObjectState = ObjectState.Cleaning;
            a.Put(api, o.ServerObject);
        }
    };
    Binder.prototype.OnUpdateComplete = function (a) {
        var t = this, x = a.Sender.XHttp, td = a.Sender.GetRequestData(), rd = Is.Array(td) ? td : [td];
        if (!t.isRedirecting(x)) {
            if (x.status === 200) {
                for (var i = 0; i < rd.length; i++) {
                    var o = t.DataObject ? t.DataObject : t.DataObjects.First(function (d) { return t.isPKMatch(d, rd[i]); });
                    if (o) {
                        t.SetServerObjectValue(o, rd[i]);
                        o.ObjectState = ObjectState.Clean;
                    }
                }
            }
            else {
                alert("Failed to update record.");
            }
        }
    };
    Binder.prototype.SaveDirty = function () {
        var t = this, a = t.Api(), d = t.DataObjects ? t.DataObjects : [t.DataObject];
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
            var ds = ba.First(function (f) { return f.Attribute === "datasource"; }), dm = ba.First(function (f) { return f.Attribute === "displaymember"; }), vm = ba.First(function (f) { return f.Attribute === "valuemember"; });
            if (ds) {
                var fun = new Function("return " + ds.Property), data = fun();
                ele.AddOptions(data, vm ? vm.Property : null, dm ? dm.Property : null);
            }
        }
        var nba = ["binder", "datasource", "displaymember", "valuemember"];
        ba.forEach(function (b) {
            if (!nba.First(function (v) { return v === b.Attribute; })) {
                var a = t.getAttribute(b.Attribute), tn = ele.tagName;
                t.setObjPropListener(b.Property, a, ele, d);
                if (["INPUT", "SELECT", "TEXTAREA"].indexOf(tn) > -1) {
                    var ea_1 = b.Attribute === "checked" && ele["type"] === "checkbox" ? "checked" : b.Attribute;
                    if (ea_1) {
                        var fun_1 = function (evt) {
                            d.OnElementChanged.bind(d)(ele[ea_1], b.Property);
                        };
                        ele.addEventListener("change", fun_1);
                    }
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
                    if (v === 0 && this._api.indexOf(v) === 0) {
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
//# sourceMappingURL=Binder.js.map