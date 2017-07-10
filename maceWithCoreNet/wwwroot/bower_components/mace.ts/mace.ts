class Ajax implements IEventDispatcher<Ajax>{
    constructor(withProgress: boolean = false, disableElement:any = null) {
        this.WithProgress = withProgress;
        this.DisableElement = disableElement;
    }
    DisableElement: any = null;
    static Host: string;
    WithProgress = false;
    UseAsDateUTC = false;
    ContentType = "application/json; charset=utf-8";
    Header: () => any;
    eventHandlers = new Array<Listener<Ajax>>();
    get ResponseText(): string {
        return this.XHttp.responseText;
    }
    XHttp: XMLHttpRequest;    
    Submit(method: string, url: string, parameters: any = null) {
        var t = this;        
        t.Progress();
        url = t.getUrl(url);
        t.XHttp = new XMLHttpRequest(); 
        var x = t.XHttp;       
        x.addEventListener("readystatechange", t.xStateChanged.bind(t), false);        
        x.open(method, url, true);
        x.setRequestHeader("content-type", t.ContentType);
        t.setHead();
        try {
            x.send(t.getParameters(parameters));
        } catch (e) {            
            t.Progress(false);
            window.Exception(e);
        }
    }
    private xStateChanged(e) {
        var t = this, x = t.XHttp, s = x.status;
        if (t.isRequestReady()) {
            t.Progress(false);            
            t.Dispatch(s === 200 || s === 204 || s === 201  ? EventType.Completed : EventType.Any);
        }
    }
    private getUrl(url: string): string {
        var u = url, a = Ajax.Host;
        if (u.indexOf("http") == -1 && !Is.NullOrEmpty(a)) {
            u = a + (u.indexOf("/") == 0 ? u : "/" + u);
        }
        return u;
    }
    private isRequestReady(): boolean {
        var x = this.XHttp;
        return x && x.readyState == 4;
    }
    private Progress(show: boolean = true) {
        if (this.WithProgress) {
            var pm = ProgressManager;
            show ? pm.Show() : pm.Hide();
            var de = this.DisableElement,
                d = "disabled",
                f = (e) => {
                    show ? e.setAttribute(d, d) : e.removeAttribute(d);
                };
            if (de) {
                if (Is.Array(de)) {
                    for (var i = 0; i < de.length; i++) {
                        f(de[i]);
                    }
                }
                else {
                    f(de);
                }
            }
        }
    }
    private setHead() {
        var t = this;
        if (t.Header) {
            var h = t.Header();
            if (h) {
                for (var p in h) {
                    t.XHttp.setRequestHeader(p, h[p]);
                }
            }
        }
    }
    private getParameters(parameters: any): string {
        var r = "", p = parameters;
        if (p && this.ContentType === "application/json; charset=utf-8") {
            r = JSON.stringify(p).replace(/\\\"__type\\\"\:\\\"[\w+\.?]+\\\"\,/g, "")
                .replace(/\"__type\"\:\"[\w+\.?]+\"\,/g, "")
                .replace(/<script/ig, "")
                .replace(/script>/ig, "");
        }
        return r;
    }

    GetRequestData(): any {
        var r = null, t = this, x = this.XHttp, s = x.status;       
        if (t.isRequestReady() && (s == 200 || s == 204) &&
            !Is.NullOrEmpty(x.responseText)) {
            r = x.responseText;
            try {
                r = JSON.parse(r);
                if (r.d) {
                    r = r.d;
                }
                t.convertProperties(r);
            }
            catch (e) {
                r = null;
                window.Exception(e);
            }
        }
        return r;
    }
    private convertProperties(obj) {
        var km: Array<any>, t = this;
        if (Is.Array(obj)) {
            for (var i = 0; i < obj.length; i++) {
                let o = obj[i];
                if (o) {
                    try {
                        km = km ? km : t.getKeyMap(o);
                    } catch (e) {
                        window.Exception(e);
                    }
                    t.setValues(o, km);
                }
                for (var p in o) {
                    t.convertProperties(o[p]);
                }
            }
        }
        else if (obj && typeof obj === 'object') {
            km = t.getKeyMap(obj);
            t.setValues(obj, km);
            for (var p in obj) {
                t.convertProperties(obj[p]);
            }
        }
    }
    private getKeyMap(obj): Array<any> {
        var km = new Array();
        for (var p in obj) {
            let v = obj[p];
            if (v && typeof v === 'string') {
                v = v.Trim();
                if (v.indexOf("/Date(") == 0 || v.indexOf("Date(") == 0) {
                    km.push({ Key: p, Type: "Date" });
                }
                else if (v.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/i)) {
                    km.push({ Key: p, Type: "UTCDate" });
                }
                else if (v.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g)) {
                    km.push({ Key: p, Type: "ZDate" });
                }
            }
        }
        return km;
    }
    private setValues(obj, keyMap: Array<any>) {
        for (var j = 0; j < keyMap.length; j++) {
            let k = keyMap[j].Key,
                t = keyMap[j].Type,
                v = obj[k];
            switch (t) {
                case "Date":
                    if (v) {
                        v = parseInt(v.substring(6).replace(")/", ""));                        
                        if (v > -62135575200000) {
                            v = new Date(v);
                            obj[k] = v;
                        }
                        else {
                            delete obj[k];
                        }
                    }
                    else {
                        obj[k] = new Date();
                    }
                    break;
                case "UTCDate":
                case "ZDate":
                    let t = new Date(v);
                    if (this.UseAsDateUTC) {
                        t = new Date(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
                    }
                    else if (window["chrome"]) {
                        let os = new Date().getTimezoneOffset();
                        t = t.Add(0, 0, 0, 0, os);
                    }
                    obj[k] = t;
                    break;
                default:
                    break;
            }
        }
    }

    Get(url: string, prmtrs: any = null) { this.Submit("GET", url, prmtrs); }
    Put(url: string, prmtrs: any = null) { this.Submit("PUT", url, prmtrs); }
    Post(url: string, prmtrs: any = null) { this.Submit("POST", url, prmtrs); }
    Delete(url: string, prmtrs: any = null) { this.Submit("DELETE", url, prmtrs); }
        
    AddListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<Ajax>) => void) {
        this.eventHandlers.Add(new Listener(eventType, eventHandler));
    }
    RemoveListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<Ajax>) => void) {
        this.eventHandlers.Remove(l => l.EventType === eventType && eventHandler === eventHandler);
    }
    RemoveListeners(eventType: EventType) {
        this.eventHandlers.Remove(l => l.EventType === eventType);
    }
    Dispatch(eventType: EventType) {
        var l = this.eventHandlers.Where(e => e.EventType === eventType || e.EventType === EventType.Any);
        l.forEach(l => l.EventHandler(new CustomEventArg<Ajax>(this, eventType)));        
    }
}


//disable the active context or readonly it while the new stuff is coming in?
class Binder implements IBinder {
    _api: string = null;
    PrimaryKeys: Array<string> = new Array<string>();
    constructor(primaryKeys: Array<string> = null, api: string = null, autoUpdate:boolean = false, TypeObject: { new (obj: any): IObjectState; } = null, staticProperties: Array<string> = null) {
        var p = primaryKeys, t = this;
        t.StaticProperties = staticProperties;
        t.PrimaryKeys = p ? p : t.PrimaryKeys;
        t.AutomaticUpdate = autoUpdate;
        if (TypeObject) {
            t.NewObject = (obj: any) => {
                return new TypeObject(obj);
            };
        }
        t._api = api;
    }
    ApiPrefix() {
        return "/Api/";
    }
    Api(): string {
        var t = this;
        if (!t._api) {
            var r = Reflection,
                n = r.GetName(t.constructor);
            n = n.replace("Binder", "");
            t._api = t.ApiPrefix() + n;
        }
        return t._api;
    }
    WithProgress: boolean = true;
    DisableElement: any;
    Element: HTMLElement;
    private eventHandlers = new Array<Listener<IBinder>>();
    DataObject: IObjectState;
    DataObjects: Array<IObjectState> = new Array<IObjectState>();
    AutomaticUpdate: boolean = true;
    AutomaticSelect: boolean = true;
    DataRowTemplates = new Array<HTMLElement>();
    DataRowFooter: HTMLElement;
    IsFormBinding: boolean = false;
    MoreKeys: string[];
    MoreThreshold: number;
    MoreElement: HTMLElement;
    StaticProperties: Array<string>;
    NewObject(obj: any): IObjectState {
        return new DataObject(obj, null, this.StaticProperties);
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
    GetApiForAjax(parameters: any[]): string {
        var a = this.Api();
        if (a) {
            a = a.indexOf("/") === 0 ? a.substring(1) : a
            var api = a.split("/"),
                vp = api.Where(part => part.indexOf("?") > -1),
                p = parameters ? parameters.Where(p => api.First(ap => ap === p) === null) : new Array<string>(),
                np = new Array<string>();
            var pos = 0;
            for (var i = 0; i < api.length; i++) {
                var ta = api[i];
                if (ta.indexOf("?") > -1) {
                    if (p.length > pos) {
                        np.Add(p[pos]);
                    }
                    pos++;
                }
                else {
                    np.Add(ta);
                }
            }
        }
        vp && vp.length === 0 ? p.forEach(o => np.Add(o)) : null;
        return "/" + np.join("/");
    }
    Execute(viewInstance: ViewInstance = null) {
        var t = this;
        if (t.AutomaticSelect && !Is.NullOrEmpty(t.Api)) {
            var a = new Ajax(t.WithProgress, t.DisableElement),
                url = t.GetApiForAjax(viewInstance.Parameters);
            a.AddListener(EventType.Any, t.OnAjaxComplete.bind(this));
            a.Get(url);
        }
        else {
            t.Dispatch(EventType.Completed);
        }
    }
    OnAjaxComplete(arg: CustomEventArg<Ajax>) {
        var t = this, x = arg.Sender.XHttp, s = x.status;        
        if (!t.isRedirecting(x)) {
            if (s === 200) {
                var d = arg.Sender.GetRequestData();
                if (d) {
                    if (Is.Array(d)) {
                        (<Array<any>>d).forEach(d => t.Add(t.NewObject(d)));
                        var tm = t.MoreElement, tms = "none";
                        if (tm) {
                            tms = t.DataObjects.length % t.MoreThreshold === 0 && d.length > 0 ? "inline" : tms;
                            tm.style.display = tms;
                        }
                    }
                    else if (d) {
                        t.IsFormBinding = true;
                        t.Bind(t.NewObject(d));
                    }
                    t.Dispatch(EventType.Completed);
                }
            }
            else {
                alert("Failed to retrieve data from web site.");
            }
        }
    }
    Delete(sender: HTMLElement, ajaxDeleteFunction: (a: CustomEventArg<Ajax>) => void = null) {
        var o = sender.DataObject, t = this;
        if (!o) {
            var p = sender.parentElement;
            while (!o || p !== t.Element) {
                o = p.DataObject;
                p = p.parentElement;
            }
        }
        if (o) {
            var a = new Ajax(t.WithProgress, t.DisableElement),
                f = () => {                    
                    var es = t.Element.Get(e => e.DataObject === o), td = t.DataObjects, i = td.indexOf(o);
                    es.forEach(e2 => e2.parentElement.removeChild(e2));
                    td.splice(i);                    
                    td.forEach(o => o.InstigatePropertyChangedListeners("AlternatingRowClass", false));
                },
                afc = (a: CustomEventArg<Ajax>) => {
                    var err = () => {
                        //needs testing
                        var x = a.Sender.XHttp, s = x.status;
                        if (!t.isRedirecting(x)) {
                            s === 500 ?
                                alert("Server error contact web site administrators.") :
                                s !== 204 ?
                                alert("Failed to delete row.") : null;
                        }
                    };
                    ajaxDeleteFunction ? ajaxDeleteFunction(a) : err();
                    a.EventType === EventType.Completed ? f() : null;
                },
                af = () => {
                    a.AddListener(EventType.Any, afc);
                    a.Delete(t.Api(), o);
                };
            t.AutomaticUpdate ? af() : f();
        }
    }
    Add(obj: IObjectState) {
        var t = this;
        t.prepTemplates();
        t.DataRowTemplates.forEach(d => {
            //casting here may be an issue
            let ne = <HTMLElement>d.cloneNode(true),
                be = ne.Get(e => e.HasDataSet()),
                drf = t.DataRowFooter,
                pe = t.Element.tagName === "TABLE" ? (<HTMLTableElement>t.Element).tBodies[0] : t.Element;
            be.Add(ne);
            drf ? pe.insertBefore(ne, drf) : pe.appendChild(ne);
            t.DataObjects.Add(obj);
            obj.Container = t.DataObjects;
            t.Bind(obj, be);
        });
    }
    private prepTemplates() {
        var t = this;
        if (t.DataRowTemplates.length === 0) {
            var e = t.Element.tagName === "TABLE" ? (<HTMLTableElement>t.Element).tBodies[0].children : t.Element.children,
                r = new Array<HTMLElement>(),
                li = 0;
            for (var i = 0; i < e.length; i++) {
                if (e[i].getAttribute("data-template") != null) {
                    r.Add(e[i]);
                    li = i;
                }
            }
            t.DataRowFooter = e[e.length - 1] !== r[r.length - 1] ?
                              <HTMLElement>e[e.length - 1] : null;
            r.forEach(r => {
                t.DataRowTemplates.Add(r);
                r.parentElement.removeChild(r);
            });
            var dmk = "data-morekeys",
                dmt = "data-morethreshold",
                more = t.Element.First(m => m.HasDataSet() && m.getAttribute(dmk) != null &&
                m.getAttribute(dmt) != null);
            if (more) {
                t.MoreElement = more;
                t.MoreKeys = more.getAttribute(dmk).split(";");
                t.MoreThreshold = parseInt(more.getAttribute(dmt));
                t.MoreElement.onclick = () => {
                    t.More();
                }
            }
        }
    }
    RunWhenObjectsChange: () => void = null;
    private objStateChanged(o: IObjectState) {
        var t = this, r = t.RunWhenObjectsChange;
        r ? r() : null;
        this.AutomaticUpdate ? this.Save(o) : null;
    }
    Save(obj: IObjectState) {
        var t = this, o = obj, api = t.Api();
        if (api && o.ObjectState === ObjectState.Dirty) {
            var a = new Ajax(t.WithProgress, t.DisableElement);
            a.AddListener(EventType.Any, t.OnUpdateComplete.bind(this));
            o.ObjectState = ObjectState.Cleaning;
            a.Put(api, o.ServerObject);            
        }
    }
    OnUpdateComplete(a: CustomEventArg<Ajax>) {
        var t = this, x = a.Sender.XHttp,
            td = <any>a.Sender.GetRequestData(),
            rd = Is.Array(td) ? td : [td];
        if (!t.isRedirecting(x)) {
            if (x.status === 200) {
                for (var i = 0; i < rd.length; i++) {
                    let o = t.DataObject ? t.DataObject : t.DataObjects.First(d => t.isPKMatch(d, rd[i]));
                    if (o) {
                        t.SetServerObjectValue(o, rd[i]);
                        o.ObjectState = ObjectState.Clean;
                    }
                }
            }
            else {
                alert("Failed to update record.");
            }
        }
    }
    SaveDirty() {
        var t = this,
            a = t.Api(),
            d = t.DataObjects ? t.DataObjects : [t.DataObject];
        if (a && d && d.length > 0) {
            var c = d.Where(o => o.ObjectState === ObjectState.Dirty).Select(o => o.ServerObject),
                aj = new Ajax(t.WithProgress, t.DisableElement);
            aj.AddListener(EventType.Any, t.OnUpdateComplete.bind(this));
            aj.Submit("PUT", t.Api() + "/SaveDirty", c);      
            d.forEach(o => o.ObjectState = ObjectState.Cleaning);
        }
    }
    private isRedirecting(x: XMLHttpRequest) {        
        var s = x.status, r = x.getResponseHeader('Location');
        if ((s === 401 || s === 407 || s === 403) && r) {
            window.location.href = r;
            return true;
        }
        return false;
    }
    SetServerObjectValue(d: IObjectState, i: any) {
        for (var p in i) {
            !this.PrimaryKeys.First(k => k === p) ? d.SetServerProperty(p, i[p]) : null;
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
        //is there a more element        
    }
    private setListeners(ele: HTMLElement, d: IObjectState) {
        var ba = ele.GetDataSetAttributes(), t = this;
        if (ele.tagName === "SELECT") {
            var ds = ba.First(f => f.Attribute === "datasource"),
                dm = ba.First(f => f.Attribute === "displaymember"),
                vm = ba.First(f => f.Attribute === "valuemember");
            if (ds) {
                var fun = new Function("return " + ds.Property),
                    data = fun();
                (<HTMLSelectElement>ele).AddOptions(data, vm ? vm.Property : null, dm ? dm.Property : null);
            }
        }
        var nba = ["binder", "datasource", "displaymember", "valuemember"];
        ba.forEach(b => {
            if (!nba.First(v => v === b.Attribute)) {
                let a = t.getAttribute(b.Attribute), tn = ele.tagName;
                t.setObjPropListener(b.Property, a, ele, d);
                if (["INPUT", "SELECT", "TEXTAREA"].indexOf(tn) > -1) {                    
                    let ea = b.Attribute === "checked" && ele["type"] === "checkbox" ? "checked" : b.Attribute;
                    if (ea) {
                        let fun = (evt) => {
                            d.OnElementChanged.bind(d)(ele[ea], b.Property)
                        };
                        ele.addEventListener("change", fun);
                    }
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
    private setObjPropListener(p: string, a: string, e: HTMLElement, d: IObjectState) {
        var t = this,
            fun = (atr: string, v: any) => {
                if (Has.Properties(e, atr)) {
                    if (e.tagName === "INPUT" && e["type"] === "radio") {
                        var r = e.parentElement.Get(e2 => e2["name"] === e["name"] && e2["type"] === "radio");
                        r.forEach(r => r["checked"] = false);
                        var f = r.First(r => r["value"] === v.toString());
                        f ? f["checked"] = true : null;
                    }
                    else if (atr === "className") {
                        e.className = null;
                        e.className = v;
                    }
                    else {
                        e[atr] = v;
                    }
                }
                else {
                    var s = t.getStyle(atr);
                    s ? e["style"][s] = v : e[atr] = v;
                }
            };
        d.AddPropertyListener(p, a, fun);
    }

    getStyle(v: string): string {
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
    More() {
        var pb = this.Element.Binder,
            vi = HistoryManager.CurrentViewInstance(),
            pbd = pb.DataObjects;
        if (pbd && pbd.length > 0) {
            var nvi = new ViewInstance(new Array<any>(), vi.ViewContainer),
                o = pbd[pbd.length - 1],
                p = vi.Parameters;
            if (p != null) {
                for (var i = 0; i < p.length; i++) {
                    var v = p[i];
                    if (v === 0 && this._api.indexOf(v) === 0) {
                        continue;
                    }
                    nvi.Parameters.Add(v)
                }
            }
            this.MoreKeys.forEach(k => {
                nvi.Parameters.Add(o[k]);
            });
            pb.Execute(nvi);
        }
    }
}
//state management isnt working right yet with regards to the put and the complete of the ajax call
class DataObject implements IObjectState {   
    static DefaultAlternatingRowClass: string = null;
    constructor(serverObject: any,
        propertiesThatShouldSubscribeToObjectStateChanged:Array<string>= null,
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

enum CacheStrategy {
    None,
    ViewAndPreload,
    View,
    Preload
}
class View implements IView {
    private url: string;
    CacheStrategy: CacheStrategy = CacheStrategy.None;
    constructor(cacheStrategy: CacheStrategy = CacheStrategy.View, containerId: string = "content", viewPath: string = null) {
        this.url = viewPath;
        this._containerID = containerId;
        this.CacheStrategy = cacheStrategy;
        this.Cache(this.CacheStrategy);
    }
    Prefix() {
        return "/Views/";
    }
    Url() {
        if (!this.url) {
            var n = Reflection.GetName(this.constructor).replace("View","");
            this.url = this.Prefix() + n + ".html";
        }
        return this.url;
    };
    _containerID: string = null;
    ContainerID(): string { return this._containerID; };    
    private countBindersReported: number;
    private cached: HTMLElement
    private eHandlrs = new Array<Listener<IView>>();
    private binders = new Array<IBinder>();
    ViewInstance: ViewInstance;
    private preload: IPreViewLoad = null;
    get Preload() {
        return this.preload;
    }
    set Preload(value: IPreViewLoad) {
        this.preload = value;
    }
    Cache(strategy: CacheStrategy = CacheStrategy.ViewAndPreload) {
        var t = this;
        if (t.Preload &&
            (strategy === CacheStrategy.ViewAndPreload || strategy === CacheStrategy.Preload)) {
            t.Preload.Execute(() => { });
        }        
        if (strategy === CacheStrategy.View || strategy === CacheStrategy.ViewAndPreload) {
            t.postPreloaded(true);
        }
    }
    Show(viewInstance: ViewInstance) {
        var t = this;
        t.ViewInstance = viewInstance;
        t.binders = new Array<IBinder>();
        t.binders.forEach(b => b.RemoveListeners(EventType.Any));
        t.Preload ? t.Preload.Execute(t.postPreloaded.bind(this)) : t.postPreloaded();
    }
    private postPreloaded(dontSetHtml: boolean = false) {
        var t = this,
            a = new Ajax();
        if (!dontSetHtml) {
            a.AddListener(EventType.Completed, t.RequestCompleted.bind(this));
        }
        a.Get(t.Url());
    }
    RequestCompleted(a: CustomEventArg<Ajax>) {
        if (a.Sender.ResponseText) {
            this.SetHTML(a.Sender.ResponseText);
        }
        a.Sender = null;
    }
    SetHTML(html: string) {
        var t = this,
            c = t.ContainerID().Element();
        if (!Is.NullOrEmpty(c)) {
            t.cached = "div".CreateElement({ "innerHTML": html });
            var ele = t.cached.Get(ele => !Is.NullOrEmpty(ele.getAttribute("data-binder")));
            t.countBindersReported = 0;            
            if (ele.length > 0) {
                ele.forEach(e => {
                    try {
                        let a = e.getAttribute("data-binder");
                        if (a) {
                            let fun = new Function("return new " + a + (a.indexOf("Binder(") == 0 ? "" : "()"));
                            e.Binder = <IBinder>fun();
                            e.Binder.AddListener(EventType.Completed, t.OnBinderComplete.bind(this));
                            e.Binder.Element = e;
                            t.binders.Add(e.Binder);                            
                        }
                    }
                    catch (e) {
                        window.Exception(e);
                    }
                });
                ele.forEach(e => {
                    if (e.Binder) {
                        try {
                            e.Binder.Execute(t.ViewInstance);
                        }
                        catch (ex) {
                            window.Exception(e);
                        }
                    }
                });
            } else {
                t.MoveStuffFromCacheToReal();
            }
        }
        else {
            t.Dispatch(EventType.Completed);
        }
    }
    OnBinderComplete(a: ICustomEventArg<IBinder>) {
        var t = this;
        if (a.EventType === EventType.Completed) {
            t.countBindersReported = t.countBindersReported + 1;
            if (t.binders.length === t.countBindersReported) {
                t.MoveStuffFromCacheToReal();                
                t.binders.forEach(b => {
                    b.RemoveListener(EventType.Completed, t.OnBinderComplete.bind(this));
                });   
            }
        }
    }
    MoveStuffFromCacheToReal() {
        var t = this,
            c = t.ContainerID().Element();
        var be = c.Get(e => e.Binder != null);
        be.forEach(e => e.Binder.Dispose());
        c.Clear();
        while (t.cached.childNodes.length > 0) {
            let n = t.cached.childNodes[0];
            t.cached.removeChild(n);
            c.appendChild(n);
        }
        t.Dispatch(EventType.Completed);
    }
    AddListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<IView>) => void) {
        var t = this,
            f = t.eHandlrs.First(h => h.EventType === eventType && h.EventHandler === eventHandler);
        if (!f) {
            t.eHandlrs.Add(new Listener(eventType, eventHandler));
        }
    }
    RemoveListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<IView>) => void) {
        this.eHandlrs.Remove(l => l.EventType === eventType && eventHandler === eventHandler);
    }
    RemoveListeners(eventType: EventType) {
        this.eHandlrs.Remove(l => l.EventType === eventType);
    }
    Dispatch(eventType: EventType) {
        var l = this.eHandlrs.Where(e => e.EventType === eventType);
        l.forEach(l => l.EventHandler(new CustomEventArg<IView>(this, eventType)));
    }
}
//thinking is could have a generic type that could 
//be set for the preload
interface IPreViewLoad {
    Execute(callback: () => void): void;
}
class DataLoaders implements IPreViewLoad{
    _callback: () => any;
    completedCount: number = 0;
    private _dataLoaders: Array<DataLoader>;
    constructor(...dataLoaders: Array<DataLoader>) {
        this._dataLoaders = dataLoaders;
    }
    Execute(callback: () => void) {
        var t = this;
        t._callback = callback;
        t.completedCount = 0;
        t._dataLoaders.forEach(d => d.Execute(t.Completed.bind(this)));
    }
    Completed() {
        var t = this;
        t.completedCount++;
        if (t.completedCount === t._dataLoaders.length) {
            t._callback();
        }
    }
}
class DataLoader {
    private _dataUrl: string;
    private _shouldTryLoad: () => boolean;
    private _dataCallBack: (arg: ICustomEventArg<Ajax>) => void;
    private _completed: () => void;
    private _parameters: any = null;
    constructor(dataUrl: string, dataCallBack: (arg: ICustomEventArg<Ajax>) => void, shouldTryLoad: () => boolean = null, parameters: any = null) {
        var t = this;
        t._dataCallBack = dataCallBack;
        t._dataUrl = dataUrl;
        t._shouldTryLoad = shouldTryLoad;
    }
    Execute(completed: () => void) {
        var t = this;
        t._completed = completed;
        if (!t._shouldTryLoad || t._shouldTryLoad()) {
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, t._ajaxCompleted.bind(this));
            ajax.Get(t._dataUrl, t._parameters);
        }
        else {
            t._completed();
        }
    }
    private _ajaxCompleted(arg: ICustomEventArg<Ajax>) {
        this._dataCallBack(arg);
        this._completed();
    }
}
var ViewContainers: Array<IViewContainer> = new Array<IViewContainer>();
abstract class ViewContainer implements IViewContainer {
    constructor() {
        var n = Reflection.GetName(this.constructor);
        this.Name = n.replace("ViewContainer", "");
        this.Name = this.Name.replace("Container", "");
        ViewContainers.push(this);
    }
    UrlPattern: () => string = null;
    public Name: string;
    Views: Array<IView> = new Array<IView>();
    IsDefault: boolean = false;
    NumberViewsShown: number;
    Show(route: ViewInstance) {
        var rp = route.Parameters, t = this;
        if (rp && rp.length == 1 && t.IsDefault) {
            route.Parameters = new Array();
        }
        t.NumberViewsShown = 0;
        ProgressManager.Show();
        t.Views.forEach(s => {
            s.AddListener(EventType.Completed, t.ViewLoadCompleted.bind(t));
            s.Show(route)
        });
    }
    IsUrlPatternMatch(url: string) {
        if (!Is.NullOrEmpty(url)) {
            url = url.lastIndexOf("/") == url.length - 1 ? url.substring(0, url.length - 1) : url;
            var p = this.UrlPattern ? this.UrlPattern() : "^" + this.Name;
            if (p) {
                var regex = new RegExp(p, 'i');
                return url.match(regex) ? true : false;
            }
        }
        return false;
    }
    ViewLoadCompleted(a: ICustomEventArg<IView>) {
        if (a.EventType === EventType.Completed) {
            this.NumberViewsShown = this.NumberViewsShown + 1;
        }
        if (this.NumberViewsShown === this.Views.length) {
            ProgressManager.Hide();
        }
    }
    Url(viewInstance: ViewInstance): string {
        var t = this, vi = viewInstance, rp = viewInstance.Parameters;
        if (vi.Route) {
            return vi.Route;
        }
        else if (t.UrlPattern != null) {
            var up = t.UrlPattern().split("/"), pi = 0, nu = new Array<string>();
            for (var i = 0; i < up.length; i++) {
                let p = up[i];
                if (p.indexOf("(?:") == 0) {
                    if (!rp) { break; }
                    if (pi < rp.length) {
                        nu.Add(rp[pi]);
                    }
                    else {
                        break;
                    }
                    pi++;
                }
                else {
                    nu.Add(up[i]);
                }
            }
            return nu.join("/");            
        }
        return t.Name + (rp && rp.length > 0 ? "/" + rp.join("/") : "");
    }
    DocumentTitle(route: ViewInstance): string {
        return this.Name;
    }
    UrlTitle(route: ViewInstance): string {
        return this.Name;
    }
    Parameters(url:string){
        url = url ? url.replace(this.Name, '') : url;
        url = url ? url.charAt(0) ===  "/" ? url.substring(1):url:url;
        return url ? url.split('/'): new Array<string>();
    }
}
class SingleViewContainer extends ViewContainer {
    constructor(cacheStrategy: CacheStrategy = CacheStrategy.View,  containerId: string = "content",  isDefault: boolean = false) {
        super();
        var t = this;
        t.IsDefault = isDefault;
        t.Views.push(new View(cacheStrategy, containerId, "/Views/" + t.Name + ".html"));
    }
}
class ViewInstance {
    Parameters: Array<any>;
    ViewContainer: IViewContainer;    
    Route: string;
    constructor(parameters: Array<any>, viewContainer: IViewContainer, route: string = null) {
        this.Route = route;
        this.Parameters = parameters;
        this.ViewContainer = viewContainer;        
    }
}

enum EventType {
    Any,
    Completed,
    Error,
    Aborted,
    Message
}
interface ICustomEventArg<T> {
    Sender: T;
    EventType: EventType;
    Message: string;
    Cancel: boolean;
}
class CustomEventArg<T> implements ICustomEventArg<T> {
    Sender: T;
    EventType: EventType;
    Cancel: boolean = false;
    Message: string;
    constructor(sender: any, eventType: EventType) {
        this.Sender = sender;
        this.EventType = eventType;
    }
}
interface IEventDispatcher<T> {
    AddListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<T>) => void);
    RemoveListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<T>) => void);
    RemoveListeners(eventType: EventType);
    Dispatch(eventType: EventType);
}
class Listener<T> {
    EventType: EventType;
    EventHandler: (eventArg: ICustomEventArg<T>) => void;
    constructor(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<T>) => void) {
        this.EventType = eventType;
        this.EventHandler = eventHandler;
    }
}
class PropertyListener {
    PropertyName: string;
    Attribute: string;
    Handler: (attribute: string, value: any) => void;
    constructor(propertyName: string, attribute: string, handler: (attribute: string, value: any) => void) {
        this.PropertyName = propertyName;
        this.Attribute = attribute;
        this.Handler = handler;
    }
}
interface IPropertyChangedDispatcher {
    AddPropertyListener(propertyName: string, attribute: string, handler: (attribute: string, value: any) => void);    
    RemovePropertyListeners();
    OnPropertyChanged(propertyName: string);
    
}
interface IObjectState extends IPropertyChangedDispatcher {
    ObjectState: ObjectState;
    AddObjectStateListener(handler: (obj: IObjectState) => void);
    RemoveObjectStateListener();
    OnObjectStateChanged();
    OnElementChanged(value: any, propertyName: string);
    AllPropertiesChanged();
    ServerObject: any;
    SetServerProperty(propertyName: string, value: any);
    Container: Array<IObjectState>;
    InstigatePropertyChangedListeners(p: string, canCauseDirty: boolean);
}
enum ObjectState {
    Dirty,
    Cleaning,
    Clean
}
interface IView extends IEventDispatcher<IView> {
    Url: () => string;
    Show: (route: ViewInstance) => void;
    ContainerID: () => string;
    CacheStrategy: CacheStrategy;
    Cache: (strategy: CacheStrategy) => void;
}
interface IBinder extends IEventDispatcher<IBinder> {
    Execute: (viewInstance: ViewInstance) => void;
    Dispose: () => void;
    Element: HTMLElement;
    DataObjects: Array<IObjectState>;
    Save(obj: IObjectState);
    SaveDirty();
    RunWhenObjectsChange: () => void;
    Delete(sender: HTMLElement, ajaxDeleteFunction: (a: CustomEventArg<Ajax>) => void);
}
interface IViewContainer {
    DocumentTitle: (route: ViewInstance) => string;
    IsDefault: boolean;
    Show: (route: ViewInstance) => void;
    Url: (route: ViewInstance) => string;
    UrlPattern: () => string;
    UrlTitle: (route: ViewInstance) => string;
    IsUrlPatternMatch: (url: string) => boolean;
    Views: Array<IView>;
    Name: string;
    Parameters:(url:string)=> Array<string>;
}
module HistoryContainer {
    export class History implements IEventDispatcher<ViewContainer> {        
        private ViewInstances = new Array<ViewInstance>();
        CurrentViewInstance(): ViewInstance {
            var vi = this.ViewInstances;
            return vi != null && vi.length > 0 ? vi[vi.length - 1] : null;
        }
        BackEvent(e) {
            HistoryManager.Back();
        }
        Add(viewInstance: ViewInstance) {
            var vi = viewInstance,
                t = this;
            t.ViewInstances.Add(vi);
            t.ManageRouteInfo(vi);
            t.Dispatch(EventType.Completed);
        }
        Back() {
            var t = this,
                vi = t.ViewInstances;
            if (vi.length > 1) {
                vi.splice(vi.length - 1, 1);
            }
            if (vi.length > 0) {
                var i = vi[vi.length - 1],
                    f = i.ViewContainer;
                f.Show(i);
                t.ManageRouteInfo(i);
                t.Dispatch(EventType.Completed);
            }
            else {
                //do nothing?
            }
        }
        ManageRouteInfo(viewInstance: ViewInstance) {
            var vi = viewInstance,
                vc = vi.ViewContainer,
                t = vc.UrlTitle(vi),
                dt = vc.DocumentTitle(vi),
                h = history,
                u = vc.Url(vi);
            if (u && !Is.NullOrEmpty(t) && h && h.pushState) {
                u = this.FormatUrl(!Is.NullOrEmpty(u) ? u.indexOf("/") != 0 ? "/" + u : u : "/");
                h.pushState(null, t, u);
            }
            if (dt) {
                document.title = dt;
            }
        }
        FormatUrl(url: string) {
            url = url.replace(/[^A-z0-9/]/g, "");
            return url;
        }
        private eHandlrs = new Array<Listener<ViewContainer>>();
        AddListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<ViewContainer>) => void) {
            var t = this,
                f = t.eHandlrs.First(h => h.EventType === eventType && h.EventHandler === eventHandler);
            if (!f) {
                t.eHandlrs.Add(new Listener(eventType, eventHandler));
            }
        }
        RemoveListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<ViewContainer>) => void) {
            this.eHandlrs.Remove(l => l.EventType === eventType && eventHandler === eventHandler);
        }
        RemoveListeners(eventType: EventType) {
            this.eHandlrs.Remove(l => l.EventType === eventType);
        }
        Dispatch(eventType: EventType) {
            var l = this.eHandlrs.Where(e => e.EventType === eventType);
            l.forEach(l => l.EventHandler(new CustomEventArg<ViewContainer>(this.CurrentViewInstance().ViewContainer, eventType)));
        }
    }
}
var HistoryManager = new HistoryContainer.History();

module Initializer {
    export var WindowLoaded: (e: any) => any;
    export function Execute(e?) {
        var w = window;
        if (document.readyState === "complete") {
            windowLoaded();
            WindowLoaded ? WindowLoaded(e) : null;
        }
        else {
            w.onload = function () {
                windowLoaded();
                WindowLoaded ? WindowLoaded(e) : null;
            };
        }
    }
    function windowLoaded() {
        var w = window;        
        setProgressElement();
        w.ShowByUrl(w.location.pathname.substring(1));
        w.addEventListener("popstate", HistoryManager.BackEvent);
    }
    function setProgressElement() {
        var pg = document.getElementById("progress");
        if (pg != null) {
            ProgressManager.ProgressElement = pg;
        }
    }
}
module Reflection {
    export function GetName(o: any, ignoreThese: Array<string> = new Array<string>()) {
        var r = o && o.toString ? o.toString() : null;
        if (!Is.NullOrEmpty(r)) {
            var p = "^function\\s(\\w+)\\(\\)",
                m = r.match(p);
            if (m && !ignoreThese.First(i => i === m[1])) {
                return m[1];
            }
        }
        return null;
    }
    export function NewObject(type: { new () }) {
        return new type();
    }
}
Initializer.Execute();

module Is {
    export function Array(value): boolean {
        return Object.prototype.toString.call(value) === '[object Array]';
    }
    export function NullOrEmpty(value): boolean {
        return value == null || (value.length && value.length === 0);
    }
} 
module Has {
    export function Properties(inObject: any, ...properties): boolean {
        var p = properties;
        for (var i = 0; i < p.length; i++) {
            if (inObject[p[i]] === undefined) {
                return false;
            }
        }
        return true;
    }
}
module ProgressManager {
    export var ProgressElement: HTMLElement = null;
    export function Show() {
        var pe = ProgressManager.ProgressElement;
        if (pe) {
            pe.style.display = "inline";
        }
    }
    export function Hide() {
        var pe = ProgressManager.ProgressElement;
        if (pe) {
            pe.style.display = "none";
        }
    }
}
interface Array<T> {     
    Add(obj: any);
    Add(...obj: T[]);
    First(func?: (obj: T) => boolean): T;
    Last(func: (obj: T) => boolean): T;
    Remove(func: (obj: T) => boolean): T[];
    Where(func: (obj: T) => boolean): T[];    
    Select<U>(keySelector: (element: T) => U): Array<U>;
}
Array.prototype.Select = function (keySelector: (element: any) => any): Array<any> {
    var r = new Array<any>(), t = this;
    for (var i = 0; i < t.length; i++) {
        r.push(keySelector(t[i]));
    }
    return r;
};
Array.prototype.Add = function (...objectOrObjects: Array<any>) {
    var o = objectOrObjects;
    if (!Is.Array(o)) {
        o = [o];
    }
    for (var i = 0; i < o.length; i++) {
        this.push(o[i]);
    }
};
Array.prototype.First = function (func?: (obj) => boolean) {
    var t = this, l = t.length;
    if (func) {
        for (var i = 0; i < l; i++) {
            if (func(t[i])) {
                return t[i];
            }
        }
    }
    else if (l > 0) {
        return t[0];
    }
    return null;
};
Array.prototype.Last = function (func?: (obj) => boolean): any {
    var t = this, l = t.length;
    if (func) {
        var p = l - 1;
        while (p > 0) {
            if (func(t[p])) {
                return t[p];
            }
            p--;
        }
    }
    if (l > 0) {
        return t[l - 1];
    }
    return null;
};
Array.prototype.Remove = function (func: (obj) => boolean): Array<any> {
    var t = this;
    if (func) {
        var p = t.length - 1;
        while (p > 0) {
            if (func(t[p])) {
                t.splice(p, 1);
            }
            p--;
        }
    }
    return t;
};
Array.prototype.Where = function (func: (obj) => boolean): Array<any> {
    var m = new Array();
    for (var i = 0; i < this.length; i++) {
        var c = this[i];
        if (func(c)) {
            m.push(c);
        }
    }
    return m;
};
//reviewed and updated NC - 2015-04-02
interface Date {
    Add(y?: number, m?: number, d?: number, h?: number, mm?: number, s?: number): Date;
    ToyyyymmddHHMMss();
}
Date.prototype.Add = function (y?: number, m?: number, d?: number, h?: number, mm?: number, s?: number): Date {
    y = y ? y : 0;
    m = m ? m : 0;
    d = d ? d : 0;
    h = h ? h : 0;
    mm = mm ? mm : 0;
    s = s ? s : 0;
    var t = this;
    return new Date(t.getFullYear() + y, t.getMonth() + m, t.getDate() + d, t.getHours() + h,
        t.getMinutes() + mm, t.getSeconds() + s, t.getMilliseconds());
};
Date.prototype.ToyyyymmddHHMMss = function () {
    var f = (v: number) => {
        return (v <= 9 ? '0' : '') + v.toString();
    };
    var d = f(this.getDate()),
        m = f(this.getMonth() + 1),
        y = this.getFullYear(),
        h = f(this.getHours()),
        M = f(this.getMinutes()),
        s = f(this.getSeconds());
    return '' + y + '-' + m + '-' + d + ' ' + h + ":" + M + ":" + s;
};

interface HTMLElement extends Element {
    Get(func: (ele: HTMLElement) => boolean, notRecursive?: boolean, nodes?: Array<HTMLElement>): HTMLElement[]
    First(func: (ele: HTMLElement) => boolean): HTMLElement; 
    Clear();       
    AddListener(eventName, method);
    Set(objectProperties): HTMLElement;
    HasDataSet: () => boolean;
    GetDataSetAttributes: () => { Attribute: string; Property: any; }[];        
    Binder: IBinder;
    DataObject: IObjectState;   
    Delete(); 
    Save();
    SaveDirty();
    Ancestor(func: (ele: HTMLElement) => boolean): HTMLElement;
}
HTMLElement.prototype.SaveDirty = function () {
    var t = <HTMLElement>this, p = t.Ancestor(p => p.Binder != null);
    if (p && p.Binder) {
        p.Binder.SaveDirty();
    }
}
HTMLElement.prototype.Save = function () {
    var t = <HTMLElement>this, p = t.Ancestor(p => p.Binder != null);
    if (p && p.Binder) {
        p.Binder.Save(t.DataObject);
    }
};
HTMLElement.prototype.Get = function (func: (ele: HTMLElement) => boolean, notRecursive?: boolean, nodes?: Array<HTMLElement>): HTMLElement[] {
    var n = nodes == null ? new Array<HTMLElement>() : nodes;
    var chs = (<HTMLElement>this).children;
    for (var i = 0; i < chs.length; i++) {
        let c = <HTMLElement>chs[i];
        if (c.nodeType == 1 && c.tagName.toLowerCase() != "svg") {            
            if (func(c)) {
                n.push(c);
            }
            if (!notRecursive && c.Get) {
                c.Get(func, notRecursive, n);
            }
        }
    }
    return n;
};
HTMLElement.prototype.First = function (func: (ele: HTMLElement) => boolean): HTMLElement {
    var chs = (<HTMLElement>this).children;
    for (var i = 0; i < chs.length; i++) {
        let c = <HTMLElement>chs[i];
        if (c.nodeType == 1 && c.tagName.toLowerCase() != "svg") {            
            if (func(c)) {
                return c;
            }
        }
    }
    for (var i = 0; i < chs.length; i++) {
        let c = <HTMLElement>chs[i];
        if (c.nodeType == 1 && c.tagName.toLowerCase() != "svg") {            
            if (c.First) {
                let f = c.First(func);
                if (f) {
                    return f;
                }
            }
        }
    }
    return null;
};
HTMLElement.prototype.Clear = function () {
    var t = <HTMLElement>this;
    var chs = t.childNodes;
    while (chs.length > 0) {
        t.removeChild(chs[0]);
    }
};
HTMLElement.prototype.AddListener = function (eventName, method) {
    this.addEventListener ? this.addEventListener(eventName, method) : this.attachEvent(eventName, method);
};
HTMLElement.prototype.Set = function (objectProperties) {
    var t = <HTMLElement>this, op = objectProperties;
    if (op) {
        for (var p in op) {
            if (p != "cls" && p != "className") {
                if (p.IsStyle()) {
                    t.style[p] = op[p];
                }
                else if (p === "style") {
                    if (op.style.cssText) {
                        t.style.cssText = op.style.cssText;
                    }
                }
                else {
                    t[p] = op[p];
                }
            }
            else {
                t.className = null;
                t.className = op[p];
            }
        }
    }
    return t;
};
HTMLElement.prototype.HasDataSet = function () {
    var d = this["dataset"];
    if (d) {        
        for (var p in d) {
            return true;
        }
    }
    return false;
};
HTMLElement.prototype.GetDataSetAttributes = function () {
    var r = new Array<{ Attribute: string; Property: any; }>();
    var d = this["dataset"];
    if (d) {        
        for (var p in d) {
            r.Add({ Attribute: p, Property: d[p] });
        }
    }
    return r;
};
HTMLElement.prototype.Delete = function () {
    var t = <HTMLElement>this, p = t.Ancestor(p => p.Binder != null);
    if (p && p.Binder) {
        p.Binder.Delete(this, null);
    }
};
HTMLElement.prototype.Ancestor = function (func: (ele: HTMLElement) => boolean): HTMLElement {
    var p = this.parentElement;
    while (!func(p)) {
        p = p.parentElement;
    }
    return p;
};
interface HTMLSelectElement {
    AddOptions(arrayOrObject, valueProperty?: string, displayProperty?: string, selectedValue?): HTMLSelectElement;    
}
HTMLSelectElement.prototype.AddOptions= function(arrayOrObject, valueProperty ? : string, displayProperty?: string, selectedValue?): HTMLSelectElement {
    var s = <HTMLSelectElement>this,
        sv = selectedValue,
        aoo = arrayOrObject,
        ao = (d, v) => {
            var o = new Option(d, v);
            s["options"][s.options.length] = o;
            if (sv && v === sv) {
                o.selected = true;
            }
        };
    if (Is.Array(aoo)) {
        var ta = <Array<any>>aoo,
            dp = displayProperty,
            vp = valueProperty;
        if (dp && vp) {
            ta.forEach(t => {  
                ao(t[dp], t[vp]);              
            });                        
        }
        else if (ta.length > 1 && typeof ta[0] === 'string') {
            ta.forEach(t => {
                ao(t, t);
            });
        }
    }
    else if (aoo) {        
        for (var p in aoo) {
            if (!(aoo[p] && {}.toString.call(aoo[p]) === '[object Function]')) {
                ao(aoo[p], aoo[p]);                
            }
        }
    }    
    return s;
};

interface String {
    Trim(): string;
    Element(): HTMLElement;  
    CreateElement(objectProperties?): HTMLElement;    
    CreateElementFromHtml(): HTMLElement;
    IsStyle(): boolean;
}
String.prototype.Trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.Element = function (): HTMLElement {
    return document.getElementById(this.toString());
};
String.prototype.CreateElement = function (objectProperties?): HTMLElement {
    var o = document.createElement(this), op = objectProperties;
    if (op) {
        o.Set(op);
    }
    return o;
};
String.prototype.CreateElementFromHtml = function (): HTMLElement {
    var d = "div".CreateElement({ innerHTML: this }),
        dcs = d.children;
    while (dcs.length > 0) {
        var c = dcs[dcs.length - 1];
        return <HTMLElement>c;
    }
};
String.prototype.IsStyle = function () {
    for (var p in document.body.style) {
        return p.toLowerCase() === this.toLowerCase()
    }
    return false;
};
interface Window {
    Show<T extends IViewContainer>(type: {
        new (): T;
    }, ...parameters: any[]);
    ShowByUrl(url: string);
    Exception(...parameters: any[]);
}
Window.prototype.Exception = function (...parameters: any[]) {
    if (parameters.length == 1) {
        var o = {};
        for (var i = 0; i < parameters.length; i++) {
            o["parameter" + i] = parameters[i];
        }
        alert(JSON.stringify(o));
    }
    else if (parameters.length > 1) {
        alert(JSON.stringify(parameters[0]));
    }
    else {
        alert("Unknown error");
    }
};
Window.prototype.Show = function <T extends IViewContainer>(type: { new (): T; }, ...parameters: any[]) {
    var p = parameters;
    p = p.length == 1 && p[0] == "" ? null : p;
    var vc = Reflection.NewObject(type),
        vi = new ViewInstance(p, vc);
    vc.Show(vi);
    HistoryManager.Add(vi);
};
Window.prototype.ShowByUrl = function (url: string) {
    var vc: IViewContainer = url.length === 0 ? ViewContainers.First(vc => vc.IsDefault) : ViewContainers.Where(vc=>!vc.IsDefault).First(d => d.IsUrlPatternMatch(url));
    vc = vc == null ? ViewContainers.First(d => d.IsDefault) : vc;
    if (vc) {
        var p = vc.Parameters(url),
            vi = new ViewInstance(p, vc, window.location.pathname);
        vc.Show(vi);
        HistoryManager.Add(vi);
    }
};
