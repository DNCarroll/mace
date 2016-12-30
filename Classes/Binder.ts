//disable the active context or readonly it while the new stuff is coming in?
//Delete not ready
abstract class Binder implements IBinder {
    PrimaryKeys: Array<string> = new Array<string>();
    WebApi: string;
    WebApiGetParameters(): any {
        return null;
    }
    Element: HTMLElement;
    private eventHandlers = new Array<Listener<IBinder>>();
    DataObject: IObjectState;
    DataObjects: Array<IObjectState> = new Array<IObjectState>();
    AssociatedElementIDs: Array<string> = new Array<string>();    
    AutomaticallyUpdatesToWebApi: boolean = true;
    AutomaticallySelectsFromWebApi: boolean = true;
    DataRowTemplates = new Array<string>();
    DataRowFooter :HTMLElement;
    IsFormBinding: boolean = false;
    abstract NewObject(rawObj: any): IObjectState;  
    Dispose() {
        this.PrimaryKeys = null;
        this.WebApi = null;
        this.AssociatedElementIDs = null;
        if (this.DataObject) {
            this.DataObject.RemoveObjectStateListener();
            this.DataObject.RemovePropertyListeners();
        }
        this.DataObjects.forEach(d => {
            d.RemoveObjectStateListener();
            d.RemovePropertyListeners();
        });
        this.RemoveListeners();
    }
    Execute(viewInstance: ViewInstance = null) {
        if (this.AutomaticallySelectsFromWebApi && !Is.NullOrEmpty(this.WebApi)) {
            var parameters = this.WebApiGetParameters() ? this.WebApiGetParameters() : viewInstance.Parameters;
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this.OnAjaxComplete.bind(this));
            var url = this.WebApi;
            if (parameters) {
                url += (url.lastIndexOf("/") + 1 == url.length ? "" : "/");
                url += Is.Array(parameters) ? parameters.join("/") : parameters;
            }
            ajax.Get(url);
        }
        else {
            this.Dispatch(EventType.Completed);
        }
    }    
    OnAjaxComplete(arg: CustomEventArg<Ajax>) {  
        if (arg.EventType === EventType.Completed) {
            var data = arg.Sender.GetRequestData();
            if (data) {
                if (!Is.Array(data)) {
                    this.IsFormBinding = true;        
                    this.BindToDataObject(this.NewObject(data));
                }
                else {                
                    (<Array<any>>data).forEach(d => this.Add(this.NewObject(d)));
                }
                this.Dispatch(EventType.Completed);
            }
        }
    }
    //not ready
    Delete(objectToRemove: IObjectState) {
        
    }   
    Add(objectToAdd: IObjectState) {
        this.prepDataRowTemplates();  
        var that = this;
        this.DataRowTemplates.forEach(t => {
            var newEle = t.CreateElementFromHtml();
            var boundEle = newEle.Get(e => e.HasDataSet());
            boundEle.Add(newEle);
            that.DataRowFooter ? that.Element.insertBefore(newEle, that.DataRowFooter) : that.Element.appendChild(newEle);
            that.DataObjects.Add(objectToAdd);
            that.BindToDataObject(objectToAdd, boundEle);
        });
    }    
    private prepDataRowTemplates() {
        if (this.DataRowTemplates.length == 0) {            
            var eles = this.Element.children;
            var rows = new Array<HTMLElement>();
            var lastIndex = 0;
            for (var i = 0; i < eles.length; i++) {
                if (eles[i].getAttribute("data-template") != null) {
                    rows.Add(eles[i]);
                    lastIndex = i;
                }
            }          
            if (eles[eles.length - 1] != rows[rows.length - 1]) {
                this.DataRowFooter = <HTMLElement>eles[eles.length - 1];
            }
            rows.forEach(r => {
                this.DataRowTemplates.Add(r.outerHTML);
                r.Remove();
            });
        }
    }
    private onObjectStateChanged(obj: IObjectState) {
        if (this.AutomaticallyUpdatesToWebApi && this.WebApi) {
            var jx = new Ajax();
            jx.AddListener(EventType.Completed, this.OnUpdateComplete.bind(this));
            jx.Put(this.WebApi, obj.ServerObject);
            obj.ObjectState = ObjectState.Clean;
        }
    }
    OnUpdateComplete(arg: CustomEventArg<Ajax>) {
        var income = <any>arg.Sender.GetRequestData();
        var obj = this.DataObject ? this.DataObject : this.DataObjects.First(d => this.IsPrimaryKeymatch(d, income));
        obj ? this.SetServerObjectValue(obj, income) : null;
    }
    SetServerObjectValue(data: IObjectState, income: any) {
        for (var p in income) {
            if (!this.PrimaryKeys.First(k => k === p)) {
                data.SetServerProperty(p, income[p]);
            }
        }
    }
    IsPrimaryKeymatch(data: IObjectState, income: any): boolean {
        for (var i = 0; i < this.PrimaryKeys.length; i++) {
            if (data.ServerObject[this.PrimaryKeys[i]] != income[this.PrimaryKeys[i]]) {
                return false;
            }
        }
        return true;
    }
    BindToDataObject(obj: IObjectState, elesToBind: Array<HTMLElement> = null) {   
        if (!elesToBind) {
            elesToBind = this.Element.Get(e => e.HasDataSet());
            elesToBind.Add(this.Element);
        }
        if (this.IsFormBinding) {
            this.DataObject = obj;            
        }
        obj.AddObjectStateListener(this.onObjectStateChanged.bind(this));
        elesToBind.forEach(e => {
            let element = e;
            this.setListeners(element, obj);
        });        
        obj.AllPropertiesChanged();
    }
    private setListeners(ele: HTMLElement, obj: IObjectState) {
        var attrs = ele.GetDataSetAttributes();
        if (ele.tagName === "SELECT") {            
            var dsource = attrs.First(f => f.Attribute == "datasource");
            var dMemb = attrs.First(f => f.Attribute == "displaymember");
            var vMemb = attrs.First(f => f.Attribute == "valuemember");
            if (dsource) {
                var fun = new Function("return " + dsource.Property);
                var data = fun();
                (<HTMLSelectElement>ele).AddOptions(data, vMemb ? vMemb.Property : null, dMemb ? dMemb.Property : null);
            }
        }
        var nonBindAttr = ["binder", "datasource", "displaymember", "valuemember"];
        attrs.forEach(b => {
            if (!nonBindAttr.First(v => v === b.Attribute)) {
                var attr = this.getAttribute(b.Attribute);
                this.setObjectPropertyListener(b.Property, attr, ele, obj);
                var eleAttr = b.Attribute === "checked" && ele["type"] === "checkbox" ? "checked" : b.Attribute === "value" ? "value" : null;
                if (eleAttr) {
                    var fun = (evt) => {
                        obj.OnElementChanged.bind(obj)(ele[eleAttr], b.Property)
                    };
                    ele.addEventListener("change", fun);
                }
            }
        });
    }    
    getAttribute(attr: string) {
        attr = attr.toLowerCase();
        switch (attr) {
            case "class":
            case "classname":
                return "className";
            case "innerhtml":
                return "innerHTML";
            case "readonly":
                return "readOnly";
            default:                
                return attr;
        }
    }
    private setObjectPropertyListener(property: string, attr: string, ele: HTMLElement, obj: IObjectState) {
        var objectPropertyChangedForElement = (attribute: string, value: any) => {
            if (Has.Properties(ele, attribute)){
                if (ele.tagName === "INPUT" && ele["type"] === "radio") {
                    var radios = ele.parentElement.Get(e2 => e2["name"] === ele["name"] && e2["type"] === "radio");
                    radios.forEach(r => r["checked"] = false);
                    var first = radios.First(r => r["value"] === value.toString());
                    first["checked"] = true;
                }
                else if (attribute === "className") {
                    ele.className = null;
                    ele.className = value;
                }
                else {
                    ele[attribute] = value;
                }
            }
            else {
                var style = this.getStyle(attribute);
                style ? ele["style"][style] = value : ele[attribute] = value;
            }
        };
        obj.AddPropertyListener(property, attr, objectPropertyChangedForElement);
    }

    getStyle(value: string):string {
        for (var prop in document.body.style) {
            if (prop.toLowerCase() === value.toLowerCase()) {
                return prop;
            }
        }
        return null;
    }
    
    private selectedObject: IObjectState;
    get SelectedObject() {
        return this.selectedObject;
    }
    set SelectedObject(value) {        
        this.selectedObject = value;
    }    

    AddListener(eType: EventType, eHandler: (eventArg: ICustomEventArg<IBinder>) => void) {
        var found = this.eventHandlers.First(h => h.EventType === eType && h.EventHandler === eHandler);
        if (!found) {
            this.eventHandlers.Add(new Listener(eType, eHandler));
        }
    }
    RemoveListener(eType: EventType, eHandler: (eventArg: ICustomEventArg<IBinder>) => void) {
        this.eventHandlers.Remove(l => l.EventType === eType && eHandler === eHandler);
    }
    RemoveListeners(eType: EventType = EventType.Any) {        
        this.eventHandlers.Remove(l => eType === EventType.Any || l.EventType === eType);
    }
    Dispatch(eType: EventType) {
        var listeners = this.eventHandlers.Where(e => e.EventType === eType);
        listeners.forEach(l => l.EventHandler(new CustomEventArg<IBinder>(this, eType)));
    }
}