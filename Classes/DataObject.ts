//state management isnt working right yet with regards to the put and the complete of the ajax call
abstract class DataObject implements IObjectState {
    constructor(serverObject: any = null) {
        this.serverObject = serverObject;
        this.objectState = ObjectState.Clean;
    }
    private changeCount: number = 0;
    private changeQueued: boolean = false;
    private eventListeners = new Array<PropertyListener>();
    private objectListener = new Array<(obj: IObjectState) => void>();
    private objectState: ObjectState = ObjectState.Clean;
    get ObjectState(): ObjectState {
        return this.objectState;
    }
    set ObjectState(value: ObjectState) {
        var causeChangedEvent = value != this.objectState;
        this.objectState = value;
        if (value === ObjectState.Dirty) {
            this.OnObjectStateChanged();
        }
    }
    AddPropertyListener(prop: string, attr: string, handler: (attribute: string, value: any) => void) {
        this.eventListeners.Add(new PropertyListener(prop, attr, handler));
    }
    RemovePropertyListeners() {
        this.eventListeners.Remove(o => true);
    }
    OnPropertyChanged(prop: string) {
        var listeners = this.eventListeners.Where(l => l.PropertyName === prop);
        listeners.forEach(l => l.Handler(l.Attribute, this[prop]));
    }
    AllPropertiesChanged() {
        this.eventListeners.forEach(l => l.Handler(l.Attribute, this[l.PropertyName]));
    }
    InstigatePropertyChangedListeners(prop: string, canCauseDirty: boolean = true) {
        this.OnPropertyChanged(prop);
        if (canCauseDirty && this.ObjectState != ObjectState.Cleaning) {
            this.ObjectState = ObjectState.Dirty;
        }
    }
    AddObjectStateListener(handler: (obj: IObjectState) => void) {
        this.objectListener.Add(handler);
    }
    RemoveObjectStateListener() {
        this.objectListener.Remove(o => true);
    }
    OnObjectStateChanged() {
        this.objectListener.forEach(o => o(this));
    }
    OnElementChanged(value: any, prop: string) {
        this[prop] = value;
    }
    private serverObject: any;
    get ServerObject() {
        return this.serverObject;
    }
    set ServerObject(value: any) {
        this.serverObject = value;
    }
    SetServerProperty(prop: string, value: any) {
        var change = value != this.ServerObject[prop];
        this.ServerObject[prop] = value;
        if (change) {
            this.InstigatePropertyChangedListeners(prop, true);
        }
    }
}
