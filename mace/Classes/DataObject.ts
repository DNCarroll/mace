class DataObject implements IObjectState {
    public static DefaultAlternatingRowClass: string = null;
    public static DefaultSelectedRowClass: string = null;
    public static DefaultRowClass: string = null;
    constructor(serverObject: any,
        propertiesThatShouldSubscribeToObjectStateChanged: Array<string> = null,
        staticProperties: Array<string> = null) {
        var so = serverObject, t = this;
        t.serverObject = so;
        t.SubscribeToObjectStateChange = propertiesThatShouldSubscribeToObjectStateChanged;
        staticProperties ?
            staticProperties.forEach(s => {
                if (!Has.Properties(so, s)) {
                    so[s] = null;
                }
            }) : null;
        t.objectState = ObjectState.Clean;
        for (var p in so) { t.setProps(p, so); }
    }
    private setProps(p: string, o: any) {
        var t = this,
            g = function () { return o[p]; },
            s = function (v) { t.SetServerProperty(p, v); },
            odp = Object.defineProperty;
        if (t[p] === undefined) {
            odp ? odp(t, p, { 'get': g, 'set': s }) : null;
        }
    }
    SubscribeToObjectStateChange: Array<string>;
    Container: Array<IObjectState>;
    Binder: Binder;
    private alternatingClass: string;
    AlternateOnEvens: boolean = true;
    set AlternatingRowClass(value: string) {
        this.alternatingClass = value;
    }
    get AlternatingRowClass() {
        var t = this, ac = Is.Alive(t.alternatingClass) ? t.alternatingClass : DataObject.DefaultAlternatingRowClass;
        if (Is.Alive(ac)) {
            var i = t.Container.indexOf(this) + 1,
                ie = i % 2 === 0;
            return ie === t.AlternateOnEvens ? ac : null;
        }
        return null;
    }
    defaultRowClass: string = null;
    get DefaultRowClass(): string {
        if (this.AlternatingRowClass) {
            return this.AlternatingRowClass;
        }
        else {
            return this.defaultRowClass ? this.defaultRowClass : DataObject.DefaultRowClass;
        }
    }
    set DefaultRowClass(value: string) {
        this.defaultRowClass = value;
    }
    selectedRowClass: string = null;
    get SelectedRowClass(): string {
        var t = this;
        if (Is.Alive(t.Binder) &&
            t === t.Binder.SelectedObject) {
            var ac = Is.Alive(t.selectedRowClass) ? t.selectedRowClass : DataObject.DefaultSelectedRowClass;
            return ac;
        }
        return t.DefaultRowClass;
    }
    set SelectedRowClass(value: string) {
        this.selectedRowClass = value;
    }
    private changeCount: number = 0;
    private changeQueued: boolean = false;
    private eLstenrs = new Array<PropertyListener>();
    private oLstenrs = new Array<(obj: IObjectState) => void>();
    private objectState: ObjectState = ObjectState.Clean;
    get ObjectState(): ObjectState {
        return this.objectState;
    }
    set ObjectState(value: ObjectState) {
        var t = this;
        t.objectState = value;
        t.OnObjectStateChanged();
    }
    public static IsDataObject(object: any): object is DataObject {
        return 'ObjectState' in object;
    }
    AddPropertyListener(p: string, a: string, h: (attribute: string, value: any) => void) {
        this.eLstenrs.Add(new PropertyListener(p, a, h));
    }
    RemovePropertyListeners() {
        this.eLstenrs.Remove(o => true);
    }
    OnPropertyChanged(p: string) {
        var l = this.eLstenrs.Where(l => l.PropertyName === p);
        l.forEach(l => l.Handler(l.Attribute, this[p]));
    }
    AllPropertiesChanged() {
        this.eLstenrs.forEach(l => l.Handler(l.Attribute, this[l.PropertyName]));
    }
    InstigatePropertyChangedListeners(p: string, canCauseDirty: boolean = true) {
        this.OnPropertyChanged(p);
        if (canCauseDirty && this.ObjectState !== ObjectState.Cleaning) {
            this.ObjectState = ObjectState.Dirty;
        }
    }
    AddObjectStateListener(h: (obj: IObjectState) => void) {
        this.oLstenrs.Add(h);
    }
    RemoveObjectStateListener() {
        this.oLstenrs.Remove(o => true);
    }
    OnObjectStateChanged() {
        var t = this, subs = t.SubscribeToObjectStateChange;
        subs ? subs.forEach(s => t.InstigatePropertyChangedListeners(s, false)) : null;
        t.oLstenrs.forEach(o => o(t));
    }
    OnElementChanged(v: any, p: string) {
        this[p] = v;
    }
    private serverObject: any;
    get ServerObject() {
        return this.serverObject;
    }
    set ServerObject(value: any) {
        this.serverObject = value;
    }
    SetServerProperty(p: string, v: any) {
        var t = this,
            change = v !== t.ServerObject[p];
        t.ServerObject[p] = v;
        if (change) {
            t.InstigatePropertyChangedListeners(p, true);
        }
    }
} 
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