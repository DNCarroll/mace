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
    DataObject.prototype.AddPropertyListener = function (prop, attr, handler) {
        this.eventListeners.Add(new PropertyListener(prop, attr, handler));
    };
    DataObject.prototype.RemovePropertyListeners = function () {
        this.eventListeners.Remove(function (o) { return true; });
    };
    DataObject.prototype.OnPropertyChanged = function (prop) {
        var _this = this;
        var listeners = this.eventListeners.Where(function (l) { return l.PropertyName === prop; });
        listeners.forEach(function (l) { return l.Handler(l.Attribute, _this[prop]); });
    };
    DataObject.prototype.AllPropertiesChanged = function () {
        var _this = this;
        this.eventListeners.forEach(function (l) { return l.Handler(l.Attribute, _this[l.PropertyName]); });
    };
    DataObject.prototype.InstigatePropertyChangedListeners = function (prop, canCauseDirty) {
        if (canCauseDirty === void 0) { canCauseDirty = true; }
        this.OnPropertyChanged(prop);
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
    DataObject.prototype.OnElementChanged = function (value, prop) {
        this[prop] = value;
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
    DataObject.prototype.SetServerProperty = function (prop, value) {
        var change = value != this.ServerObject[prop];
        this.ServerObject[prop] = value;
        if (change) {
            this.InstigatePropertyChangedListeners(prop, true);
        }
    };
    return DataObject;
}());
//# sourceMappingURL=DataObject.js.map