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
        this.eventListeners.Add(new PropertyListener(p, a, h));
    };
    DataObject.prototype.RemovePropertyListeners = function () {
        this.eventListeners.Remove(function (o) { return true; });
    };
    DataObject.prototype.OnPropertyChanged = function (p) {
        var _this = this;
        var l = this.eventListeners.Where(function (l) { return l.PropertyName === p; });
        l.forEach(function (l) { return l.Handler(l.Attribute, _this[p]); });
    };
    DataObject.prototype.AllPropertiesChanged = function () {
        var _this = this;
        this.eventListeners.forEach(function (l) { return l.Handler(l.Attribute, _this[l.PropertyName]); });
    };
    DataObject.prototype.InstigatePropertyChangedListeners = function (p, canCauseDirty) {
        if (canCauseDirty === void 0) { canCauseDirty = true; }
        this.OnPropertyChanged(p);
        if (canCauseDirty && this.ObjectState != ObjectState.Cleaning) {
            this.ObjectState = ObjectState.Dirty;
        }
    };
    DataObject.prototype.AddObjectStateListener = function (h) {
        this.objectListener.Add(h);
    };
    DataObject.prototype.RemoveObjectStateListener = function () {
        this.objectListener.Remove(function (o) { return true; });
    };
    DataObject.prototype.OnObjectStateChanged = function () {
        var _this = this;
        this.objectListener.forEach(function (o) { return o(_this); });
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
//# sourceMappingURL=DataObject.js.map