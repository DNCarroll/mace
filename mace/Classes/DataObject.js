var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
        var so = serverObject;
        this.serverObject = so;
        staticProperties ?
            staticProperties.forEach(function (s) {
                if (!Has.Properties(so, s)) {
                    so[s] = null;
                }
            }) : null;
        this.objectState = ObjectState.Clean;
    }
    Object.defineProperty(DataObject.prototype, "AlternatingClass", {
        get: function () {
            if (this.alternatingClass != null) {
                var index = this.Container.indexOf(this) + 1;
                var isEven = index % 2 == 0;
                return isEven == this.AlternateOnEvens ? this.alternatingClass : null;
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
            this.InstigatePropertyChangedListeners(p, true);
        }
    };
    return DataObject;
}());
var DynamicDataObject = (function (_super) {
    __extends(DynamicDataObject, _super);
    function DynamicDataObject(serverObject, staticProperties) {
        if (staticProperties === void 0) { staticProperties = null; }
        var so = serverObject;
        _super.call(this, so, staticProperties);
        for (var p in so) {
            this.setProps(p, so);
        }
    }
    DynamicDataObject.prototype.setProps = function (p, o) {
        var t = this, g = function () { return o[p]; }, s = function (v) { t.SetServerProperty(p, v); }, odp = Object.defineProperty;
        odp ? odp(t, p, { 'get': g, 'set': s }) : null;
    };
    return DynamicDataObject;
}(DataObject));
//# sourceMappingURL=DataObject.js.map