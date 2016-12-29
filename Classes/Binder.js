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