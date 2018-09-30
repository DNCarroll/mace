var StorageType;
(function (StorageType) {
    StorageType[StorageType["none"] = 0] = "none";
    StorageType[StorageType["session"] = 1] = "session";
    StorageType[StorageType["local"] = 2] = "local";
})(StorageType || (StorageType = {}));
var DataObjectCacheArray = (function () {
    function DataObjectCacheArray(cachingKey, storageState, newT) {
        if (cachingKey === void 0) { cachingKey = null; }
        if (storageState === void 0) { storageState = null; }
        if (newT === void 0) { newT = null; }
        this.Data = new Array();
        var t = this;
        t._cachingKey = cachingKey;
        t._storageState = storageState;
        t._newT = newT;
        if (t._cachingKey && t._storageState && t._newT) {
            var rehydrated;
            switch (t._storageState) {
                case StorageType.local:
                    rehydrated = localStorage.getItem(t._cachingKey);
                    break;
                case StorageType.session:
                    rehydrated = sessionStorage.getItem(t._cachingKey);
                    break;
                default:
                    break;
            }
            if (!Is.NullOrEmpty(rehydrated)) {
                var objs = JSON.parse(rehydrated);
                if (Is.Array(objs)) {
                    var arr = objs;
                    arr.forEach(function (o) {
                        t.Add(t._newT(o));
                    });
                }
                else {
                    t.Add(t._newT(objs));
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
        var t = this, ck = t._cachingKey, ss = t._storageState;
        if (ck && ss) {
            switch (ss) {
                case StorageType.local:
                    localStorage.setItem(ck, JSON.stringify(t.Data.Select(function (a) { return a.ServerObject; })));
                    break;
                case StorageType.session:
                    sessionStorage.setItem(ck, JSON.stringify(t.Data.Select(function (a) { return a.ServerObject; })));
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