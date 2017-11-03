class DataObject implements IObjectState {
    static DefaultAlternatingRowClass: string = null;
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
        if (!t[p]) {
            odp ? odp(t, p, { 'get': g, 'set': s }) : null;
        }
    }
    SubscribeToObjectStateChange: Array<string>;
    Container: Array<IObjectState>;
    private alternatingClass: string;
    AlternateOnEvens: boolean = true;
    set AlternatingRowClass(value: string) {
        this.alternatingClass = value;
    }
    get AlternatingRowClass() {
        var t = this, ac = t.alternatingClass != null ? t.alternatingClass : DataObject.DefaultAlternatingRowClass;
        if (ac != null) {
            var i = t.Container.indexOf(this) + 1,
                ie = i % 2 == 0;
            return ie == t.AlternateOnEvens ? ac : null;
        }
        return null;
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
        if (canCauseDirty && this.ObjectState != ObjectState.Cleaning) {
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
            change = v != t.ServerObject[p];
        t.ServerObject[p] = v;
        if (change) {
            t.InstigatePropertyChangedListeners(p, true);
        }
    }
}