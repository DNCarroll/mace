﻿//state management isnt working right yet with regards to the put and the complete of the ajax call
abstract class DataObject implements IObjectState {    
    constructor(serverObject: any, staticProperties: Array<string> = null) {
        var so = serverObject;
        this.serverObject = so;
        staticProperties ?
            staticProperties.forEach(s => {
                if (!Has.Properties(so, s)) {
                    so[s] = null;
                }
            }) : null;
        this.objectState = ObjectState.Clean;
    }
    Container: Array<IObjectState>;
    private alternatingClass: string;
    AlternateOnEvens: boolean = true;
    set AlternatingClass(value: string) {
        this.alternatingClass = value;
    }
    get AlternatingClass() {
        if (this.alternatingClass != null) {
            var index = this.Container.indexOf(this) + 1;
            var isEven = index % 2 == 0;
            return isEven == this.AlternateOnEvens ? this.alternatingClass : null;
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
        if (value === ObjectState.Dirty) {
            t.OnObjectStateChanged();
        }
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
        this.oLstenrs.forEach(o => o(this));
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
            this.InstigatePropertyChangedListeners(p, true);
        }
    }
}
class DynamicDataObject extends DataObject {
    constructor(serverObject: any, staticProperties:Array<string> = null) {
        var so = serverObject;
        super(so, staticProperties);        
        for (var p in so) { this.setProps(p, so); }
    }
    private setProps(p: string, o: any) {
        var t = this,
            g = function () { return o[p]; },
            s = function (v) { t.SetServerProperty(p, v); },
            odp = Object.defineProperty;
        odp ? odp(t, p, { 'get': g, 'set': s }) : null;
    }
}
