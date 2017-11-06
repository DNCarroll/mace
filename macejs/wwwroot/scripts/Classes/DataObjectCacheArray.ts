enum StorageType {
    none,
    session,
    local
}
//may have a type on this deal that we want to new up
//the default would be the DataObject
//hide the array and provide an indexer?
//if we make it not array its going to 
//point out all failures
class DataObjectCacheArray<T extends IObjectState>
{
    constructor(cachingKey: string = null, storageState: StorageType = null, newT: (obj: any) => T = null) {
        this._cachingKey = cachingKey;
        this._storageState = storageState;
        this._newT = newT;
        if (this._cachingKey && this._storageState && this._newT) {
            var rehydrated: string;
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
                    var arr = <Array<any>>objs;
                    arr.forEach(o => {
                        this.Add(this._newT(o));
                    });
                }
                else {
                    this.Add(this._newT(objs));
                }
            }
        }
    }
    Data: Array<T> = new Array<T>();
    _cachingKey: string;
    _storageState: StorageType;
    _newT: (obj: any) => T;
    //Delete
    //these would have to be on the prototype cant just add them here
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
        if (this._cachingKey && this._storageState) {
            switch (this._storageState) {
                case StorageType.local:
                    localStorage.setItem(this._cachingKey, JSON.stringify(this.Data.Select(a => a.ServerObject)));
                    break;
                case StorageType.session:
                    sessionStorage.setItem(this._cachingKey, JSON.stringify(this.Data.Select(a => a.ServerObject)));
                    break;
                default:
                    break;
            }
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