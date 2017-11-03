var StorageType;
(function (StorageType) {
    StorageType[StorageType["none"] = 0] = "none";
    StorageType[StorageType["session"] = 1] = "session";
    StorageType[StorageType["local"] = 2] = "local";
})(StorageType || (StorageType = {}));
//may have a type on this deal that we want to new up
//the default would be the DataObject
//hide the array and provide an indexer?
//if we make it not array its going to 
//point out all failures
var DataObjectCacheArray = (function () {
    function DataObjectCacheArray(cachingKey, storageState, newT) {
        if (cachingKey === void 0) { cachingKey = null; }
        if (storageState === void 0) { storageState = null; }
        if (newT === void 0) { newT = null; }
        var _this = this;
        this.Data = new Array();
        this._cachingKey = cachingKey;
        this._storageState = storageState;
        this._newT = newT;
        if (this._cachingKey && this._storageState && this._newT) {
            var rehydrated;
            switch (this._storageState) {
                case StorageType.local:
                    rehydrated = localStorage.getItem(this._cachingKey);
                    break;
                case StorageType.session:
                    rehydrated = sessionStorage.getItem(this._cachingKey);
                    break;
                default:
                    break;
            }
            if (!Is.NullOrEmpty(rehydrated)) {
                var objs = JSON.parse(rehydrated);
                if (Is.Array(objs)) {
                    var arr = objs;
                    arr.forEach(function (o) {
                        _this.Add(_this._newT(o));
                    });
                }
                else {
                    this.Add(this._newT(objs));
                }
            }
        }
    }
    //Delete
    //these would have to be on the prototype cant just add them here
    DataObjectCacheArray.prototype.Add = function (obj) {
        this.Data.push(obj);
    };
    DataObjectCacheArray.prototype.slice = function (i) {
        this.Data.slice(i);
        this.SaveCache();
    };
    DataObjectCacheArray.prototype.indexOf = function (obj, fromIndex) {
        return this.Data.indexOf(obj, fromIndex);
    };
    DataObjectCacheArray.prototype.SaveCache = function () {
        if (this._cachingKey && this._storageState) {
            switch (this._storageState) {
                case StorageType.local:
                    localStorage.setItem(this._cachingKey, JSON.stringify(this.Data.Select(function (a) { return a.ServerObject; })));
                    break;
                case StorageType.session:
                    sessionStorage.setItem(this._cachingKey, JSON.stringify(this.Data.Select(function (a) { return a.ServerObject; })));
                    break;
                default:
                    break;
            }
        }
    };
    DataObjectCacheArray.prototype.forEach = function (callBack) {
        this.Data.forEach(callBack);
    };
    Object.defineProperty(DataObjectCacheArray.prototype, "length", {
        get: function () {
            return this.Data.length;
        },
        enumerable: true,
        configurable: true
    });
    DataObjectCacheArray.prototype.First = function (func) {
        return this.Data.First(func);
    };
    DataObjectCacheArray.prototype.Where = function (func) {
        return this.Data.Where(func);
    };
    return DataObjectCacheArray;
}());
//# sourceMappingURL=DataObjectCacheArray.js.map