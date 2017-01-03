//disable the active context or readonly it while the new stuff is coming in?
//Delete not ready
var Binder = (function () {
    function Binder() {
        this.PrimaryKeys = new Array();
        this.eventHandlers = new Array();
        this.DataObjects = new Array();
        this.AutomaticUpdate = true;
        this.AutomaticSelect = true;
        this.DataRowTemplates = new Array();
        this.IsFormBinding = false;
    }
    Binder.prototype.WebApiGetParameters = function () {
        return null;
    };
    Binder.prototype.Dispose = function () {
        var t = this, d = t.DataObject;
        t.PrimaryKeys = null;
        t.WebApi = null;
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
    Binder.prototype.Execute = function (viewInstance) {
        if (viewInstance === void 0) { viewInstance = null; }
        var t = this;
        if (t.AutomaticSelect && !Is.NullOrEmpty(t.WebApi)) {
            var p = t.WebApiGetParameters() ? t.WebApiGetParameters() : viewInstance.Parameters, a = new Ajax(), u = t.WebApi;
            a.AddListener(EventType.Completed, t.OnAjaxComplete.bind(this));
            if (p) {
                u += (u.lastIndexOf("/") + 1 == u.length ? "" : "/");
                u += Is.Array(p) ? p.join("/") : p;
            }
            a.Get(u);
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
                if (!Is.Array(d)) {
                    t.IsFormBinding = true;
                    t.Bind(t.NewObject(d));
                }
                else {
                    d.forEach(function (d) { return t.Add(t.NewObject(d)); });
                }
                t.Dispatch(EventType.Completed);
            }
        }
    };
    //not ready
    Binder.prototype.Delete = function (objectToRemove) {
    };
    Binder.prototype.Add = function (objectToAdd) {
        var t = this;
        t.prepTemplates();
        t.DataRowTemplates.forEach(function (d) {
            var ne = d.CreateElementFromHtml(), be = ne.Get(function (e) { return e.HasDataSet(); });
            be.Add(ne);
            t.DataRowFooter ? t.Element.insertBefore(ne, t.DataRowFooter) : t.Element.appendChild(ne);
            t.DataObjects.Add(objectToAdd);
            t.Bind(objectToAdd, be);
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
        }
    };
    Binder.prototype.objStateChanged = function (o) {
        var t = this;
        if (t.AutomaticUpdate && t.WebApi) {
            var a = new Ajax();
            a.AddListener(EventType.Completed, t.OnUpdateComplete.bind(this));
            a.Put(t.WebApi, o.ServerObject);
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
            var element = e;
            t.setListeners(element, o);
        });
        o.AllPropertiesChanged();
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
    Binder.prototype.setObjPropListener = function (p, a, ele, d) {
        var t = this, fun = function (atr, v) {
            if (Has.Properties(ele, atr)) {
                if (ele.tagName === "INPUT" && ele["type"] === "radio") {
                    var r = ele.parentElement.Get(function (e2) { return e2["name"] === ele["name"] && e2["type"] === "radio"; });
                    r.forEach(function (r) { return r["checked"] = false; });
                    var f = r.First(function (r) { return r["value"] === v.toString(); });
                    f ? f["checked"] = true : null;
                }
                else if (atr === "className") {
                    ele.className = null;
                    ele.className = v;
                }
                else {
                    ele[atr] = v;
                }
            }
            else {
                var s = t.getStyle(atr);
                s ? ele["style"][s] = v : ele[atr] = v;
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
    return Binder;
}());
//# sourceMappingURL=Binder.js.map