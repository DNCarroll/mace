//disable the active context or readonly it while the new stuff is coming in?
class Binder implements IBinder {
    _api: string = null;
    PrimaryKeys: Array<string> = new Array<string>();    
    constructor(primaryKeys: Array<string> = null, api: string = null, staticProperties: Array<string> = null, TypeObject: { new (obj: any): IObjectState; } = null) {
        var p = primaryKeys;
        this.StaticProperties = staticProperties;
        this.PrimaryKeys = p ? p : this.PrimaryKeys;
        if (TypeObject) {
            this.NewObject = (obj: any) => {
                return new TypeObject(obj);
            };
        }
        this._api = api;
    }
    ApiPrefix() {
        return "/Api/";
    }
    Api(): string {
        if (!this._api) {
            var r = Reflection,
                n = r.GetName(this.constructor);
            this._api = this.ApiPrefix() + n;
        }
        return this._api;
    }
    WithProgress: boolean = true;
    DisableElement: any;
    WebApiGetParameters(): any {
        return null;
    }
    Element: HTMLElement;
    private eventHandlers = new Array<Listener<IBinder>>();
    DataObject: IObjectState;
    DataObjects: Array<IObjectState> = new Array<IObjectState>();   
    AutomaticUpdate: boolean = true;
    AutomaticSelect: boolean = true;
    DataRowTemplates = new Array<string>();
    DataRowFooter :HTMLElement;
    IsFormBinding: boolean = false;
    StaticProperties: Array<string>;
    NewObject(obj: any): IObjectState {
        return new DynamicDataObject(obj, this.StaticProperties);
    }  
    Dispose() {
        var t = this, d = t.DataObject;
        t.PrimaryKeys = null;
        t.Api = null;
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
        if (t.AutomaticSelect && !Is.NullOrEmpty(t.Api)) {
            var p = t.WebApiGetParameters() ? t.WebApiGetParameters() : viewInstance.Parameters,
                a = new Ajax(t.WithProgress, t.DisableElement), u = t.Api();
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
                    t.Bind(t.NewObject(d));
                }
                else {                
                    (<Array<any>>d).forEach(d => t.Add(t.NewObject(d)));
                }
                t.Dispatch(EventType.Completed);
            }
        }
    }
    Delete(sender: HTMLElement, ajaxDeleteFunction: (a: CustomEventArg<Ajax>) => void = null) {        
        var obj = sender.DataObject, t = this;
        if (!obj) {
            var parent = sender.parentElement;
            while (!obj || parent !== t.Element) {
                obj = parent.DataObject;
                parent = parent.parentElement;
            }
        }
        if (obj) {
            var a = new Ajax(t.WithProgress, t.DisableElement),
                f = () => {
                    var es = t.Element.Get(e => e.DataObject === obj);
                    es.forEach(e2 => e2.parentElement.removeChild(e2));
                },
                afc = (a: CustomEventArg<Ajax>) => {
                    var err = () => {
                        if (a.EventType === EventType.Error) {
                            throw "Failed to delete row.";
                        }
                    };
                    ajaxDeleteFunction ? ajaxDeleteFunction(a) : err();
                    a.EventType === EventType.Completed ? f() : null;
                },
                af = () => {
                    a.AddListener(EventType.Any, afc);
                    a.Delete(t.Api(), obj);
                };
            t.AutomaticUpdate ? af() : f();
        }
    }
    Add(obj: IObjectState) {
        var t = this;
        t.prepTemplates();         
        t.DataRowTemplates.forEach(d => {
            let ne = d.CreateElementFromHtml(),
                be = ne.Get(e => e.HasDataSet()),
                drf = t.DataRowFooter;
            be.Add(ne);
            drf ? t.Element.insertBefore(ne, drf) : t.Element.appendChild(ne);
            t.DataObjects.Add(obj);
            t.Bind(obj, be);
        });
    }    
    private prepTemplates() {
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
    private objStateChanged(o: IObjectState) {
        var t = this;
        if (t.AutomaticUpdate && t.Api) {
            var a = new Ajax(t.WithProgress, t.DisableElement);
            a.AddListener(EventType.Completed, t.OnUpdateComplete.bind(this));
            a.Put(t.Api(), o.ServerObject);
            o.ObjectState = ObjectState.Clean;
        }
    }
    OnUpdateComplete(a: CustomEventArg<Ajax>) {
        var t = this,
            i = <any>a.Sender.GetRequestData(),
            o = t.DataObject ? t.DataObject : t.DataObjects.First(d => t.isPKMatch(d, i));
        o ? t.SetServerObjectValue(o, i) : null;
    }
    SetServerObjectValue(d: IObjectState, i: any) {
        for (var p in i) {
            if (!this.PrimaryKeys.First(k => k === p)) {
                d.SetServerProperty(p, i[p]);
            }
        }
    }
    isPKMatch(d: IObjectState, incoming: any): boolean {
        var t = this;
        for (var i = 0; i < t.PrimaryKeys.length; i++) {
            if (d.ServerObject[t.PrimaryKeys[i]] != incoming[t.PrimaryKeys[i]]) {
                return false;
            }
        }
        return true;
    }
    Bind(o: IObjectState, eles: Array<HTMLElement> = null) { 
        var t = this;  
        if (!eles) {
            eles = t.Element.Get(e => e.HasDataSet());
            eles.Add(t.Element);
        }
        if (t.IsFormBinding) {
            t.DataObject = o;            
        }
        o.AddObjectStateListener(t.objStateChanged.bind(this));
        eles.forEach(e => {
            e.DataObject = o;
            t.setListeners(e, o);
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
                t.setObjPropListener(b.Property, a, ele, d);
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
    private setObjPropListener(p: string, a: string, ele: HTMLElement, d: IObjectState) {
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