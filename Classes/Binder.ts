﻿//disable the active context or readonly it while the new stuff is coming in?
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
        var t = this, d = t.DataObject;
        t.PrimaryKeys = null;
        t.WebApi = null;
        t.AssociatedElementIDs = null;
        if (d) {
            d.RemoveObjectStateListener();
            d.RemovePropertyListeners();
        }
        t.DataObjects.forEach(o => {
            o.RemoveObjectStateListener();
            o.RemovePropertyListeners();
        });
        t.RemoveListeners();
    }
    Execute(viewInstance: ViewInstance = null) {
        var t = this;
        if (t.AutomaticallySelectsFromWebApi && !Is.NullOrEmpty(t.WebApi)) {
            var p = t.WebApiGetParameters() ? t.WebApiGetParameters() : viewInstance.Parameters,
                a = new Ajax(), u = t.WebApi;
            a.AddListener(EventType.Completed, t.OnAjaxComplete.bind(this));
            if (p) {
                u += (u.lastIndexOf("/") + 1 == u.length ? "" : "/");
                u += Is.Array(p) ? p.join("/") : p;
            }
            a.Get(u);
        }
        else {
            t.Dispatch(EventType.Completed);
        }
    }    
    OnAjaxComplete(arg: CustomEventArg<Ajax>) {  
        var t = this;
        if (arg.EventType === EventType.Completed) {
            var d = arg.Sender.GetRequestData();
            if (d) {
                if (!Is.Array(d)) {
                    t.IsFormBinding = true;        
                    t.BindToDataObject(t.NewObject(d));
                }
                else {                
                    (<Array<any>>d).forEach(d => t.Add(t.NewObject(d)));
                }
                t.Dispatch(EventType.Completed);
            }
        }
    }
    //not ready
    Delete(objectToRemove: IObjectState) {
        
    }   
    Add(objectToAdd: IObjectState) {
        var t = this;
        t.prepDataRowTemplates();         
        t.DataRowTemplates.forEach(d => {
            let ne = d.CreateElementFromHtml(),
                be = ne.Get(e => e.HasDataSet());
            be.Add(ne);
            t.DataRowFooter ? t.Element.insertBefore(ne, t.DataRowFooter) : t.Element.appendChild(ne);
            t.DataObjects.Add(objectToAdd);
            t.BindToDataObject(objectToAdd, be);
        });
    }    
    private prepDataRowTemplates() {
        var t = this;
        if (t.DataRowTemplates.length == 0) {            
            var e = t.Element.children,
                r = new Array<HTMLElement>(),
                li = 0;
            for (var i = 0; i < e.length; i++) {
                if (e[i].getAttribute("data-template") != null) {
                    r.Add(e[i]);
                    li = i;
                }
            }          
            if (e[e.length - 1] != r[r.length - 1]) {
                t.DataRowFooter = <HTMLElement>e[e.length - 1];
            }
            r.forEach(r => {
                t.DataRowTemplates.Add(r.outerHTML);
                r.parentElement.removeChild(r);
            });
        }
    }
    private onObjectStateChanged(o: IObjectState) {
        var t = this;
        if (t.AutomaticallyUpdatesToWebApi && t.WebApi) {
            var a = new Ajax();
            a.AddListener(EventType.Completed, t.OnUpdateComplete.bind(this));
            a.Put(t.WebApi, o.ServerObject);
            o.ObjectState = ObjectState.Clean;
        }
    }
    OnUpdateComplete(a: CustomEventArg<Ajax>) {
        var t = this,
            i = <any>a.Sender.GetRequestData(),
            o = t.DataObject ? t.DataObject : t.DataObjects.First(d => t.IsPrimaryKeymatch(d, i));
        o ? t.SetServerObjectValue(o, i) : null;
    }
    SetServerObjectValue(d: IObjectState, i: any) {
        for (var p in i) {
            if (!this.PrimaryKeys.First(k => k === p)) {
                d.SetServerProperty(p, i[p]);
            }
        }
    }
    IsPrimaryKeymatch(d: IObjectState, incoming: any): boolean {
        var t = this;
        for (var i = 0; i < t.PrimaryKeys.length; i++) {
            if (d.ServerObject[t.PrimaryKeys[i]] != incoming[t.PrimaryKeys[i]]) {
                return false;
            }
        }
        return true;
    }
    BindToDataObject(o: IObjectState, eles: Array<HTMLElement> = null) { 
        var t = this;  
        if (!eles) {
            eles = t.Element.Get(e => e.HasDataSet());
            eles.Add(t.Element);
        }
        if (t.IsFormBinding) {
            t.DataObject = o;            
        }
        o.AddObjectStateListener(t.onObjectStateChanged.bind(this));
        eles.forEach(e => {
            let element = e;
            t.setListeners(element, o);
        });        
        o.AllPropertiesChanged();
    }
    private setListeners(ele: HTMLElement, d: IObjectState) {
        var ba = ele.GetDataSetAttributes(), t = this;
        if (ele.tagName === "SELECT") {            
            var ds = ba.First(f => f.Attribute == "datasource"),
                dm = ba.First(f => f.Attribute == "displaymember"),
                vm = ba.First(f => f.Attribute == "valuemember");
            if (ds) {
                var fun = new Function("return " + ds.Property),
                    data = fun();
                (<HTMLSelectElement>ele).AddOptions(data, vm ? vm.Property : null, dm ? dm.Property : null);
            }
        }
        var nba = ["binder", "datasource", "displaymember", "valuemember"];
        ba.forEach(b => {
            if (!nba.First(v => v === b.Attribute)) {
                let a = t.getAttribute(b.Attribute);
                t.setObjectPropertyListener(b.Property, a, ele, d);
                let ea = b.Attribute === "checked" && ele["type"] === "checkbox" ? "checked" : b.Attribute === "value" ? "value" : null;
                if (ea) {
                    let fun = (evt) => {
                        d.OnElementChanged.bind(d)(ele[ea], b.Property)
                    };
                    ele.addEventListener("change", fun);
                }
            }
        });
    }    
    getAttribute(a: string) {
        a = a.toLowerCase();
        switch (a) {
            case "class":
            case "classname":
                return "className";
            case "innerhtml":
                return "innerHTML";
            case "readonly":
                return "readOnly";
            default:                
                return a;
        }
    }
    private setObjectPropertyListener(p: string, a: string, ele: HTMLElement, d: IObjectState) {
        var t = this,
            fun = (atr: string, v: any) => {
            if (Has.Properties(ele, atr)) {
                if (ele.tagName === "INPUT" && ele["type"] === "radio") {
                    var r = ele.parentElement.Get(e2 => e2["name"] === ele["name"] && e2["type"] === "radio");
                    r.forEach(r => r["checked"] = false);
                    var f = r.First(r => r["value"] === v.toString());
                    f ? f["checked"] = true : null;
                }
                else if (atr === "className") {
                    ele.className = null;
                    ele.className = v;
                }
                else {
                    ele[atr] = v;
                }
            }
            else {
                var s = t.getStyle(atr);
                s ? ele["style"][s] = v : ele[atr] = v;
            }
        };
        d.AddPropertyListener(p, a, fun);
    }

    getStyle(v: string):string {
        for (var p in document.body.style) {
            if (p.toLowerCase() === v.toLowerCase()) {
                return p;
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

    AddListener(et: EventType, eh: (eventArg: ICustomEventArg<IBinder>) => void) {
        var f = this.eventHandlers.First(h => h.EventType === et && h.EventHandler === eh);
        if (!f) {
            this.eventHandlers.Add(new Listener(et, eh));
        }
    }
    RemoveListener(et: EventType, eh: (eventArg: ICustomEventArg<IBinder>) => void) {
        this.eventHandlers.Remove(l => l.EventType === et && eh === eh);
    }
    RemoveListeners(et: EventType = EventType.Any) {        
        this.eventHandlers.Remove(l => et === EventType.Any || l.EventType === et);
    }
    Dispatch(et: EventType) {
        var l = this.eventHandlers.Where(e => e.EventType === et);
        l.forEach(l => l.EventHandler(new CustomEventArg<IBinder>(this, et)));
    }
}