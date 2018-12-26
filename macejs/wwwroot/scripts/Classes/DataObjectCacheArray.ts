enum StorageType {
    none,
    session,
    local
}
class DataObjectCacheArray<T extends IObjectState>
{
    constructor(cachingKey: string = null, storageState: StorageType = null, newT: (obj: any) => T = null) {
        var t = this;
        t._cachingKey = cachingKey;
        t._storageState = storageState;
        t._newT = newT;
        if (t._cachingKey && t._storageState && t._newT) {
            var gim = t._storageState === StorageType.local ? localStorage.getItem : sessionStorage.getItem;
            var reHy = gim(t._cachingKey);
            if (!Is.NullOrEmpty(reHy)) {
                var objs = JSON.parse(reHy);
                if (Is.Array(objs)) {
                    var arr = <Array<any>>objs;
                    arr.forEach(o => {
                        t.Add(t._newT(o));
                    });
                }
                else {
                    t.Add(t._newT(objs));
                }
            }
        }
    }
    Data: Array<T> = new Array<T>();
    _cachingKey: string;
    _storageState: StorageType;
    _newT: (obj: any) => T;    
    Add(obj: T) {
        this.Data.push(obj);
    }
    slice(i: number) {
        this.Data.slice(i);
        this.SaveCache();
    }
    indexOf(obj: T, fromIndex?: number): number {
        return this.Data.indexOf(obj, fromIndex);
    }
    SaveCache() {
        var t = this, ck = t._cachingKey, ss = t._storageState;
        if (ck && ss) {
            var sim = ss === StorageType.local ? localStorage.setItem : sessionStorage.setItem;
            sim(ck, JSON.stringify(t.Data.Select(a => a.ServerObject)));
        }
    }
    forEach(callBack: (value: T, index: number, array: T[]) => void) {
        this.Data.forEach(callBack);
    }
    get length(): number {
        return this.Data.length;
    }
    First(func?: (obj: T) => boolean): T {
        return this.Data.First(func);
    }
    Where(func?: (obj: T) => boolean): Array<T> {
        return this.Data.Where(func);
    }
} 