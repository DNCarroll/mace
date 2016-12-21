﻿//disable the active context or readonly it while the new stuff is coming in?
//OnUpdateComplete not ready
//Delete not ready

abstract class Binder implements IBinder {
    PrimaryKeys: Array<string> = new Array<string>();
    WebApi: string;
    WebApiGetParameters(): any {
        var ret = HistoryManager.CurrentRoute().Parameters;        
        return ret && ret.length == 1 ? ret[0] : ret;
    }
    Element: HTMLElement;
    private eventHandlers = new Array<Listener<IBinder>>();
    DataObject: IObjectState;
    DataObjects: Array<IObjectState> = new Array<IObjectState>();
    AssociatedElementIDs: Array<string> = new Array<string>();    
    AutomaticallyUpdatesToWebApi: boolean = false;
    AutomaticallySelectsFromWebApi: boolean = false;
    DataRowTemplates = new Array<string>();
    DataRowFooter :HTMLElement;
    IsFormBinding: boolean = true;
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
    Execute() {
        if (this.AutomaticallySelectsFromWebApi && !Is.NullOrEmpty(this.WebApi)) {
            var parameters = this.WebApiGetParameters();
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this.OnAjaxComplete.bind(this));
            var url = this.WebApi;
            url += (url.lastIndexOf("/") + 1 == url.length ? "" : "/") + (Is.Array(parameters) ? parameters.join("/") : parameters);
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
    //not ready need to figure out the elements associated with this data element
    //namely the base element that insigated the 
    Delete(objectToRemove: IObjectState) {
    }    
    Add(objectToAdd: IObjectState) {
        this.prepDataRowTemplates();  
        this.DataRowTemplates.forEach(t => {
            var newElement = t.CreateElementFromHtml();
            var boundElements = newElement.Get(e => e.HasDataSet());
            boundElements.Add(newElement);
            this.DataRowFooter ? this.Element.insertBefore(newElement, this.DataRowFooter) : this.Element.appendChild(newElement);            
            this.DataObjects.Add(objectToAdd);
            this.BindToDataObject(objectToAdd, boundElements);
        });
    }    
    private prepDataRowTemplates() {
        if (this.DataRowTemplates.length == 0) {            
            var elements = this.Element.Get(e => true);
            var rows = elements.Where(e => e.getAttribute("data-template") != null);            
            if (elements[elements.length - 1] != rows[rows.length - 1]) {
                this.DataRowFooter = elements[elements.indexOf(rows[rows.length - 1]) + 1];
            }
            rows.forEach(r => {
                this.DataRowTemplates.Add(r.outerHTML);
                r.Remove();
            });
        }
    }
    private onObjectStateChanged(obj: IObjectState) {
        if (this.AutomaticallyUpdatesToWebApi && this.WebApi) {
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this.OnUpdateComplete.bind(this));
            ajax.Put(this.WebApi, obj.ServerObject);
            obj.ObjectState = ObjectState.Clean;
        }
    }
    OnUpdateComplete(arg: CustomEventArg<Ajax>) {
        //reverse stuff here?

    }
    BindToDataObject(dataObject: IObjectState, elementsToBind: Array<HTMLElement> = null) {   
        if (!elementsToBind) {
            elementsToBind = this.Element.Get(e => e.HasDataSet());
            elementsToBind.Add(this.Element);
        }
        if (this.IsFormBinding) {
            this.DataObject = dataObject;            
        }
        dataObject.AddObjectStateListener(this.onObjectStateChanged.bind(this));
        elementsToBind.forEach(e => {
            let element = e;
            this.setListeners(element, dataObject);
        });        
        dataObject.AllPropertiesChanged();
    }
    private setListeners(element: HTMLElement, dataObject: IObjectState) {
        var boundAttributes = element.GetDataSetAttributes();
        if (element.tagName === "SELECT") {            
            var datasource = boundAttributes.First(f => f.Attribute == "datasource");
            var displayMember = boundAttributes.First(f => f.Attribute == "displaymember");
            var valueMember = boundAttributes.First(f => f.Attribute == "valuemember");
            if (datasource) {
                var fun = new Function("return " + datasource.Property);
                var data = fun();
                (<HTMLSelectElement>element).AddOptions(data, valueMember ? valueMember.Property : null, displayMember ? displayMember.Property : null);
            }
        }
        var nonbindingAttributes = ["binder", "datasource", "displaymember", "valuemember"];
        boundAttributes.forEach(b => {
            if (nonbindingAttributes.First(v => v === b.Attribute) == null) {
                var attribute = this.getAttribute(b.Attribute);
                this.setObjectPropertyListener(b.Property, attribute, element, dataObject);
                var elementAttribute = b.Attribute === "checked" && element["type"] === "checkbox" ? "checked" : b.Attribute === "value" ? "value" : null;
                if (elementAttribute) {
                    var fun = (evt) => {
                        dataObject.OnElementChanged.bind(dataObject)(element[elementAttribute], b.Property)
                    };
                    element.addEventListener("change", fun);
                }
            }
        });
    }    
    getAttribute(attribute: string) {
        attribute = attribute.toLowerCase();
        switch (attribute) {
            case "class":
            case "classname":
                return "className";
            case "innerhtml":
                return "innerHTML";
            case "readonly":
                return "readOnly";
            default:                
                return attribute;
        }
    }
    private setObjectPropertyListener(property: string, attribute: string, element: HTMLElement, dataObject: IObjectState) {
        var objectPropertyChangedForElement = (attribute: string, value: any) => {
            if (Is.Property(attribute, element)) {
                if (element.tagName == "INPUT" && element["type"] === "radio") {
                    var radios = element.parentElement.Get(e2 => e2["name"] === element["name"] && e2["type"] === "radio");
                    radios.forEach(r => r["checked"] = false);
                    var first = radios.First(r => r["value"] === value.toString());
                    first["checked"] = true;
                }
                else if (attribute === "className") {
                    element.className = null;
                    element.className = value;
                }
                else {
                    element[attribute] = value;
                }
            }
            else {
                var style = this.getStyle(attribute);
                if (style) {
                    element["style"][style] = value;
                }
                else {
                    element[attribute] = value;
                }
            }
        };
        dataObject.AddPropertyListener(property, attribute, objectPropertyChangedForElement);
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

    AddListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<IBinder>) => void) {
        var found = this.eventHandlers.First(h => h.EventType === eventType && h.EventHandler === eventHandler);
        if (!found) {
            this.eventHandlers.Add(new Listener(eventType, eventHandler));
        }
    }
    RemoveListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<IBinder>) => void) {
        this.eventHandlers.Remove(l => l.EventType === eventType && eventHandler === eventHandler);
    }
    RemoveListeners(eventType: EventType = EventType.Any) {        
        this.eventHandlers.Remove(l => eventType === EventType.Any || l.EventType === eventType);
    }
    Dispatch(eventType: EventType) {
        var listeners = this.eventHandlers.Where(e => e.EventType === eventType);
        listeners.forEach(l => l.EventHandler(new CustomEventArg<IBinder>(this, eventType)));
    }

}