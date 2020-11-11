var DataObject = /** @class */ (function () {
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
            var t = this, ac = Is.Alive(t.alternatingClass) ? t.alternatingClass : DataObject.DefaultAlternatingRowClass;
            if (Is.Alive(ac)) {
                var i = t.Container.indexOf(this) + 1, ie = i % 2 === 0;
                return ie === t.AlternateOnEvens ? ac : null;
            }
            return null;
        },
        set: function (value) {
            this.alternatingClass = value;
        },
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataObject.prototype, "SelectedRowClass", {
        get: function () {
            var t = this;
            if (Is.Alive(t.Binder) &&
                t === t.Binder.SelectedObject) {
                var ac = Is.Alive(t.selectedRowClass) ? t.selectedRowClass : DataObject.DefaultSelectedRowClass;
                return ac;
            }
            return t.DefaultRowClass;
        },
        set: function (value) {
            this.selectedRowClass = value;
        },
        enumerable: false,
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
        enumerable: false,
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
        if (canCauseDirty && this.ObjectState !== ObjectState.Cleaning) {
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
        enumerable: false,
        configurable: true
    });
    DataObject.prototype.SetServerProperty = function (p, v) {
        var t = this, change = v !== t.ServerObject[p];
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