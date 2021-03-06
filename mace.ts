class Ajax implements IEventDispatcher<Ajax>{
    constructor(withProgress: boolean = false, disableElement: any = null) {
        this.WithProgress = withProgress;
        this.DisableElement = disableElement;
    }
    DisableElement: any = null;
    static Host: string;
    WithProgress = false;
    UseAsDateUTC = false;
    ContentType: any = "application/json; charset=utf-8";
    Header: () => any;
    static GlobalHeader: () => any;
    eventHandlers = new Array<Listener<Ajax>>();
    get ResponseText(): string {
        return this.XHttp.responseText;
    }
    XHttp: XMLHttpRequest;
    Url: string;
    Submit(method: string, url: string, parameters: any = null, asRaw: boolean = false) {
        var t = this;
        t.Progress();
        url = t.getUrl(url);
        t.Url = url;
        t.XHttp = new XMLHttpRequest();
        var x = t.XHttp;
        x.addEventListener("readystatechange", t.xStateChanged.bind(t), false);
        x.open(method, url, true);
        t.setHead();
        try {
            var p = asRaw ? parameters : t.getParameters(parameters);
            Is.NullOrEmpty(p) ? x.send() : x.send(p);
        } catch (e) {
            t.Progress(false);
            window.Exception(e);
        }
    }
    private xStateChanged(e) {
        var t = this, x = t.XHttp, s = x.status;
        if (t.isRequestReady()) {
            t.Progress(false);
            t.Dispatch(s === 200 || s === 204 || s === 201 ? EventType.Completed : EventType.Any);
        }
    }
    private getUrl(url: string): string {
        var u = url, a = Ajax.Host;
        if (u.indexOf("http") === -1 && a) {
            u = a + (u.indexOf("/") === 0 ? u : "/" + u);
        }
        return u;
    }
    private isRequestReady(): boolean {
        var x = this.XHttp;
        return x && x.readyState === 4;
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
        var t = this, x = t.XHttp;
        if (t.ContentType) {
            x.setRequestHeader("content-type", t.ContentType);
        }
        if (t.Header) {
            var h = t.Header();
            if (h) {
                for (var p in h) {
                    x.setRequestHeader(p, h[p]);
                }
            }
        }
        if (Ajax.GlobalHeader) {
            var gh = Ajax.GlobalHeader()
            if (gh) {
                for (var p2 in gh) {
                    x.setRequestHeader(p2, gh[p2]);
                }
            }
        }
    }
    static RemoveScript = true;
    private getParameters(parameters: any): string {
        var r = "", p = parameters;
        if (p && this.ContentType === "application/json; charset=utf-8") {
            p = DataObject.IsDataObject(p) ? p["ServerObject"] : p;
            r = JSON.stringify(p).replace(/\\\"__type\\\"\:\\\"[\w+\.?]+\\\"\,/g, "")
                .replace(/\"__type\"\:\"[\w+\.?]+\"\,/g, "");
            if (Ajax.RemoveScript) {
                r = r.replace(/<script/ig, "")
                    .replace(/script>/ig, "");
            }
        }
        return r;
    }

    GetRequestData(): any {
        var r = null, t = this, x = this.XHttp, s = x.status;
        if (t.isRequestReady() && (s === 200) &&
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
                window.Exception("Failed to Convert data at Ajax.GetRequestData with url:" + t.Url);
            }
        }
        return r;
    }
    Array<T extends DataObject>(type: { new(serverObject: any): T; }) {
        var ret = new Array<T>();
        var r = this.GetRequestData();
        if (Is.Alive(r) && r.length) {
            for (var i = 0; i < r.length; i++) {
                ret.Add(new type(r[i]));
            }
        }
        return ret;
    }
    FirstOrDefault<T extends DataObject>(type: { new(serverObject: any): T; }) {
        var r = this.GetRequestData();
        if (Is.Alive(r)) {
            return new type(r);
        }
        return null;
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
            for (var p2 in obj) {
                t.convertProperties(obj[p2]);
            }
        }
    }
    private getKeyMap(obj): Array<any> {
        var km = new Array();
        for (var p in obj) {
            let v = obj[p];
            if (v && typeof v === 'string') {
                v = v.Trim();
                if (v.indexOf("/Date(") === 0 || v.indexOf("Date(") === 0) {
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
class Binder {
    _api: string = null;
    PrimaryKeys: Array<string> = new Array<string>();
    constructor(primaryKeys: Array<string> = null, api: string = null, autoUpdate: boolean = false, TypeObject: { new(obj: any): IObjectState; } = null, staticProperties: Array<string> = null) {
        var p = primaryKeys, t = this;
        t.StaticProperties = staticProperties;
        t.PrimaryKeys = p ? p : t.PrimaryKeys;
        t.AutomaticUpdate = autoUpdate;
        if (TypeObject) {
            t.NewObject = (obj: any) => {
                if (DataObject.IsDataObject(obj)) {
                    return obj;
                }
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
    ElementBoundEvent: (ele: HTMLElement) => void;
    private eventHandlers = new Array<Listener<Binder>>();
    DataObjects: DataObjectCacheArray<IObjectState> = new DataObjectCacheArray<IObjectState>();
    OnSelectedItemChanged: (obj: IObjectState) => void;
    AutomaticUpdate: boolean = true;
    AutomaticDelete: boolean = true;
    AutomaticSelect: boolean = true;
    DataRowTemplates = new Array<HTMLElement>();
    DataRowFooter: HTMLElement;
    MoreKeys: string[];
    MoreThreshold: number;
    MoreElement: HTMLElement;
    StaticProperties: Array<string>;
    NewObject(obj: any): IObjectState {
        if (DataObject.IsDataObject(obj)) {
            return <IObjectState>obj;
        }
        return new DataObject(obj, null, this.StaticProperties);
    }
    Dispose() {
        var t = this;
        t.PrimaryKeys = null;
        t.Api = null;
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
            vp && vp.length === 0 ? p.forEach(o => np.Add(o)) : null;
            return (np[0].indexOf("http") === -1 ? "/" : "") + np.join("/");
        }
        return null;
    }
    initialLoad = true;
    FormTemplateIds: Array<string>;
    private FormTemplates = new Array<{ Template: HTMLElement, Container: HTMLElement }>();
    Execute(viewInstance: ViewInstance = null) {
        var t = this;
        t.prepTemplates();
        try {
            if (t.DataObjects.length > 0 && t.initialLoad) {
                t.SetUpMore(t.DataObjects.Data);
                t.DataObjects.forEach(obj => {
                    t.add(obj, true);
                });
                t.Dispatch(EventType.Completed);
            }
            else if (t.AutomaticSelect && !Is.NullOrEmpty(t.Api)) {
                t.loadFromVI(viewInstance);
            }
            else {
                t.Dispatch(EventType.Completed);
            }
        } catch (e) {
            alert("Failed to load data.");
        }
        t.initialLoad = false;
    }
    Refresh(viewInstance: ViewInstance = null) {
        var vi = viewInstance ? viewInstance : HistoryManager.CurrentViewInstance();
        vi.RefreshBinding = true;
        this.loadFromVI(viewInstance);
    }
    private loadFromVI(vi: ViewInstance) {
        var t = this;
        t.prepTemplates();
        vi = !Is.Alive(vi) ? HistoryManager.CurrentViewInstance() : vi;
        if (vi.RefreshBinding) {
            t.DataObjects = new DataObjectCacheArray<IObjectState>();
            t.Element.ClearBoundElements();
        }
        var url = t.GetApiForAjax(vi.Parameters);
        if (!Is.NullOrEmpty(url)) {
            url.Get(t.OnAjaxComplete.bind(this));
        }
        else {
            t.Dispatch(EventType.Completed);
        }
    }
    OnAjaxComplete(arg: CustomEventArg<Ajax>) {
        var t = this, x = arg.Sender.XHttp, s = x.status;
        if (!t.isRedirecting(x)) {
            var cd = true;
            if (s === 200) {
                var d = arg.Sender.GetRequestData();
                if (d) {
                    cd = false;
                    t.RouteBinding(d);
                }
            }
            if (cd) {
                t.Dispatch(EventType.Completed);
            }
        }
    }
    RouteBinding(data: any) {
        var t = this,
            d = data, da = t.DataObjects;
        if (Is.Array(d)) {
            (<Array<any>>d).forEach(d => t.add(t.NewObject(d)));
            if (t.DataObjects.length > 0) {
                t.ResetSelectedObject();
            }
        }
        else if (d) {
            var no = t.NewObject(d);
            da.Data.Add(no);
            t.Bind(no);
        }
        t.SetUpMore(d);
        da.SaveCache();
        var vi = HistoryManager.CurrentViewInstance();
        if (vi && vi.RefreshBinding) {
            t.ResetSelectedObject();
            vi.RefreshBinding = false;
        }
        t.Dispatch(EventType.Completed);
        if (this.ElementBoundEvent) {
            this.ElementBoundEvent(this.Element);
        }
    }
    SetUpMore(d: Array<any>) {
        var t = this,
            tm = t.MoreElement, tms = "none";
        if (tm) {
            tms = d.length > 0 && d.length % t.MoreThreshold === 0 ? "inline" : tms;
            tm.style.display = tms;
        }
    }
    Delete(sender: HTMLElement, ajaxDeleteFunction: (a: CustomEventArg<Ajax>) => void = null) {
        var o = sender.DataObject, t = this;
        if (!o) {
            let p = sender.parentElement;
            while (!o) {
                o = p.DataObject;
                p = p.parentElement;
                if (p === t.Element) {
                    break;
                }
            }
        }
        if (o) {
            var f = () => {
                var es = t.Element.Get(e => e.DataObject === o), td = t.DataObjects.Data, i = td.indexOf(o);
                es.forEach(e2 => e2.parentElement.removeChild(e2));
                td.forEach(o => o.InstigatePropertyChangedListeners("AlternatingRowClass", false));
            },
                afc = (arg: CustomEventArg<Ajax>) => {
                    var err = () => {
                        var x = arg.Sender.XHttp, s = x.status;
                        if (!t.isRedirecting(x)) {
                            if ([204, 404, 200].indexOf(s) > -1) {
                                f();
                            }
                            else {
                                alert("Failed to delete row.");
                            }
                        }
                    };
                    ajaxDeleteFunction ? ajaxDeleteFunction(arg) : err();
                    arg.EventType === EventType.Completed ? f() : null;
                },
                af = () => {
                    t.Api().Delete(afc, o.ServerObject);
                };
            t.AutomaticDelete ? af() : f();
        }
    }
    InsertBefore(obj: any, beforeIndex: number) {
        this.add(this.NewObject(obj), false, beforeIndex);
    }
    Append(obj: any) {
        if (Is.Array(obj)) {
            var arr = <Array<any>>obj;
            arr.forEach(o => this.add(o));
        }
        else {
            this.add(this.NewObject(obj));
        }
    }
    PostAndAppend(obj: any) {
        var t = this, o = obj, api = t.Api();
        if (DataObject.IsDataObject(obj)) {
            o = obj.ServerObject;
        }
        if (api) {
            var a = new Ajax(t.WithProgress, t.DisableElement);
            a.AddListener(EventType.Any, t.OnUpdateComplete.bind(this));
            a.Post(api, o);
        }
    }
    PostAndInsertBefore(obj: any, childIndex: number) {
        let t = this, o = obj, api = t.Api(), i = childIndex;
        if (DataObject.IsDataObject(obj)) {
            o = obj.ServerObject;
        }
        if (api) {
            var a = new Ajax(t.WithProgress, t.DisableElement);
            a.AddListener(EventType.Any, (arg) => {
                var r = arg.Sender.GetRequestData();
                if (r) {
                    t.add(this.NewObject(r), false, childIndex);
                }
            });
            a.Post(api, o);
        }
    }
    add(obj: IObjectState, shouldNotAddItsAlreadyCached: boolean = false, beforeIndex: number = -1) {
        let t = this, drt = t.DataRowTemplates;
        t.prepTemplates();
        if (drt.length > 0) {
            if (!shouldNotAddItsAlreadyCached) {
                t.DataObjects.Add(obj);
            }
            drt.forEach(d => {
                let ne = <HTMLElement>d.cloneNode(true),
                    be = ne.Get(e => e.HasDataSet()),
                    drf = t.DataRowFooter,
                    pe = t.Element.tagName === "TABLE" ? (<HTMLTableElement>t.Element).tBodies[0] : t.Element;
                be.Add(ne);
                if (beforeIndex > -1 && beforeIndex < pe.childNodes.length) {
                    drf = <HTMLElement>pe.children[beforeIndex];
                }
                drf ? pe.insertBefore(ne, drf) : pe.appendChild(ne);

                obj.Container = t.DataObjects.Data;
                ne.onclick = () => {
                    t.SelectedObject = obj;
                };

                t.Bind(obj, be);
                if (beforeIndex > -1) {
                    t.SelectedObject = obj;
                }
            });
        }
        else {
            t.Bind(obj, null);
            t.SelectedObject = obj;
        }
    }
    ResetSelectedObject() {
        this.SelectedObject = this.selectedObject;
    }
    TempateOverload(ele: HTMLElement) {
        return;
    }
    private prepTemplates() {
        var t = this, drt = t.DataRowTemplates;
        if (drt.length === 0) {
            var e = t.Element.tagName === "TABLE" ? (<HTMLTableElement>t.Element).tBodies[0].children : t.Element.children,
                r = new Array<HTMLElement>(),
                li = 0;
            for (var i = 0; i < e.length; i++) {
                if (Is.Alive(e[i].getAttribute("data-template"))) {
                    r.Add(e[i]);
                    li = i;
                }
            }

            t.DataRowFooter = e[e.length - 1] !== r[r.length - 1] ?
                <HTMLElement>e[e.length - 1] : null;

            r.forEach(r => {
                t.TempateOverload(r);
                drt.Add(r);
                r.parentElement.removeChild(r);
            });
            var dmk = "data-morekeys",
                dmt = "data-morethreshold",
                more = t.Element.First(tag.any, m => m.HasDataSet() && Is.Alive(m.getAttribute(dmk)) &&
                    Is.Alive(m.getAttribute(dmt)));
            if (more) {
                t.MoreElement = more;
                t.MoreKeys = more.getAttribute(dmk).split(";");
                t.MoreThreshold = parseInt(more.getAttribute(dmt));
                more.onclick = () => {
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
        if (Is.Alive(api) && o.ObjectState === ObjectState.Dirty) {
            var a = new Ajax(t.WithProgress, t.DisableElement);
            a.AddListener(EventType.Any, t.OnUpdateComplete.bind(this));
            o.ObjectState = ObjectState.Cleaning;
            a.Put(api, o.ServerObject);
        }
    }
    OnUpdateComplete(a: CustomEventArg<Ajax>) {
        var t = this, x = a.Sender.XHttp, da = t.DataObjects,
            td = <any>a.Sender.GetRequestData(),
            rd = Is.Array(td) ? td : [td];
        if (!t.isRedirecting(x)) {
            if (x.status === 200) {
                for (var i = 0; i < rd.length; i++) {
                    let o = da.First(d => t.isPKMatch(d, rd[i]));
                    if (o) {
                        t.SetServerObjectValue(o, rd[i]);
                        o.ObjectState = ObjectState.Clean;
                        da && da.length > 0 ? da.SaveCache() : null;
                    }
                    else {
                        t.add(t.NewObject(rd[i]));
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
            d = t.DataObjects.Data.Where(o => o.ObjectState === ObjectState.Dirty);
        if (a && d && d.length > 0) {
            var c = d.Select(o => o.ServerObject),
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
        if (Is.Alive(t) && Is.Alive(t.PrimaryKeys)) {
            for (var i = 0; i < t.PrimaryKeys.length; i++) {
                if (d.ServerObject[t.PrimaryKeys[i]] !== incoming[t.PrimaryKeys[i]]) {
                    return false;
                }
            }
        }
        return true;
    }
    ManualLoad(objs: IObjectState[]) {
        var d = this.DataObjects.Data;
        objs.forEach(o => {
            d.Add(o);
            o.Container = d;
        });
        d.forEach(o => this.add(o, true));
    }
    Bind(o: IObjectState, eles: Array<HTMLElement> = null) {
        let t = this;
        o.Binder = t;
        if (!eles) {
            eles = t.Element.Get(e => e.HasDataSet());
            eles.Add(t.Element);
        }
        eles.Where(e => e.dataset && Is.Alive(e.dataset.webcontrol)).forEach(e => {
            var found = t.GetWebControl(e, o);
            if (Is.Alive(found)) {
                e.appendChild(found);
                var wds = found.Get(e2 => e2.HasDataSet());
                found.HasDataSet() ? eles.Add(found) : null;
                wds.forEach(e2 => eles.Add(e2));
            }
        });
        t.SubBind(o, eles);
    }
    GetWebControl(wc: HTMLElement, obj: IObjectState): HTMLElement {
        var eleId = obj[wc.dataset.webcontrol];
        if (eleId) {
            var found = document.getElementById(eleId);
            if (Is.Alive(found)) {
                var c = found.cloneNode(true);
                if (Is.Alive(c)) {
                    var ne = <HTMLElement>c;
                    ne.style.display = "";
                    ne.style.visibility = "visible";
                    return ne;
                }
            }
        }
        return null;
    }
    SubBind(o: IObjectState, eles: Array<HTMLElement>) {
        var t = this;
        if (Is.Alive(eles) && eles.length > 0) {
            o.AddObjectStateListener(t.objStateChanged.bind(this));
            eles.forEach(e => {
                e.DataObject = o;
                t.setListeners(e, o);
            });
            o.AllPropertiesChanged();
        }
    }
    private setListeners(ele: HTMLElement, d: IObjectState) {
        var ba = ele.GetDataSetAttributes(), t = this;
        if (ele.tagName === "SELECT") {
            var ds = ba.First(f => f.Attribute === "datasource"),
                dm = ba.First(f => f.Attribute === "displaymember"),
                vm = ba.First(f => f.Attribute === "valuemember"),
                select = (<HTMLSelectElement>ele);
            if (ds && select.options.length === 0) {
                var fun = new Function("return " + ds.Property),
                    data = fun();
                select.AddOptions(data, vm ? vm.Property : null, dm ? dm.Property : null);
            }
        }
        var eb = ["onclick", "onchange", "onload", "loaded"];
        var ntwb = ["binder", "datasource", "displaymember", "valuemember"];
        ba.forEach(b => {
            if (!Autofill.IsAutoFill(ele, d) &&
                !eb.First(v => v === b.Attribute) &&
                !ntwb.First(v => v === b.Attribute)) {
                let a = t.getAttribute(b.Attribute), tn = ele.tagName;
                t.setObjPropListener(b.Property, a, ele, d);
                if (["INPUT", "SELECT", "TEXTAREA"].indexOf(tn) > -1) {
                    let ea = b.Attribute === "checked" && ele["type"] === "checkbox" ? "checked" :
                        ele["type"] === "radio" && b.Attribute === "checked" ? "value" : b.Attribute;
                    if (ea && ["value", "checked"].indexOf(ea) > -1) {
                        if (Is.Alive(ele.onchange)) {
                            var temp: (evt) => void;
                            temp = ele.onchange;
                            ele.removeEventListener("change", temp);
                        }

                        let fun = (evt) => {
                            d.OnElementChanged.bind(d)(ele[ea], b.Property);
                        };
                        ele.addEventListener("change", fun);
                    }
                }
            }
        });
        var eba = ba.Where(a => eb.First(v => v === a.Attribute) !== null);
        if (eba && eba.length > 0) {
            eba.forEach(a => {
                ele.DataObject = d;
                var body = <string>a.Property;
                if (body) {
                    body = body.lastIndexOf(";") === body.length - 1 ? body : body + ";";
                    var fun = new Function("sender", body);
                    if (a.Attribute === "loaded") {
                        fun(ele);
                    }
                    else {
                        ele[a.Attribute] = () => {
                            fun(ele);
                            return;
                        };
                    }
                }
            });
        }
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
        let t = this,
            fun = (atr: string, v: any) => {
                if (Has.Properties(e, atr) && (atr !== "width" && atr !== "height")) {
                    if (e.tagName === "INPUT" && e["type"] === "radio" && atr === "checked") {
                        var r = this.Element.Get(e2 => e2.DataObject === d && e2["type"] === "radio" && e2.dataset.checked === e.dataset.checked);
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
                    if (s) {
                        e.style[s] = v
                    } else if (atr === "for") {
                        e.setAttribute("for", v);
                    }
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
        var t = this, ftids = t.FormTemplateIds, fts = t.FormTemplates, dad = t.DataObjects.Data, v = value;
        v = !Is.Alive(v) && dad && dad.length > 0 ? dad[0] : v;
        if (v) {
            var prev = t.SelectedObject;

            if (fts.length === 0 && Is.Alive(ftids) && ftids.length > 0) {
                ftids.forEach(ft => {
                    var fte = ft.Element();
                    if (fte) {
                        var nt = {
                            Template: fte,
                            Container: fte.parentElement
                        };
                        fts.Add(nt);
                    }
                });
            }
            t.selectedObject = v;
            t.selectedObject.InstigatePropertyChangedListeners("SelectedRowClass", false);
            if (prev) {
                prev.InstigatePropertyChangedListeners("SelectedRowClass", false);
            }
            if (Is.Alive(t.OnSelectedItemChanged)) {
                t.OnSelectedItemChanged(t.selectedObject);
            }
            fts.forEach(ft => {
                ft.Container.Clear();
                var c = <HTMLElement>ft.Template.cloneNode(true);
                ft.Container.appendChild(c);
                var eles = c.Get(e => e.HasDataSet());
                t.Bind(t.selectedObject, eles);
            });
        }
    }

    AddListener(et: EventType, eh: (eventArg: ICustomEventArg<Binder>) => void) {
        var f = this.eventHandlers.First(h => h.EventType === et && h.EventHandler === eh);
        if (!f) {
            this.eventHandlers.Add(new Listener(et, eh));
        }
    }
    RemoveListener(et: EventType, eh: (eventArg: ICustomEventArg<Binder>) => void) {
        this.eventHandlers.Remove(l => l.EventType === et && eh === eh);
    }
    RemoveListeners(et: EventType = EventType.Any) {
        this.eventHandlers.Remove(l => et === EventType.Any || l.EventType === et);
    }
    Dispatch(et: EventType) {
        var l = this.eventHandlers.Where(e => e.EventType === et);
        l.forEach(l => l.EventHandler(new CustomEventArg<Binder>(this, et)));
    }
    More() {
        var t = this,
            vi = HistoryManager.CurrentViewInstance(),
            pbd = t.DataObjects.Data;
        if (pbd && pbd.length > 0) {
            var nvi = new ViewInstance(new Array<any>(), vi.ViewContainer),
                o = pbd[pbd.length - 1],
                p = vi.Parameters;
            if (Is.Alive(p)) {
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
            this.loadFromVI(nvi);
        }
    }
}
class BinderWithBoundEvent extends Binder {
    constructor(pks: Array<string>, api: string,
        elementBoundEvent: (ele: HTMLElement) => void = null,
        TypeObject: { new(obj: any): IObjectState; } = null, autoUpdate: boolean = false) {
        super(pks, api, autoUpdate, TypeObject);
        let t = this;
        t.ElementBoundEvent = elementBoundEvent;
    }
}
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
        var t = this;
        t.url = viewPath;
        t._containerID = containerId;
        t.CacheStrategy = cacheStrategy;
        t.Cache(t.CacheStrategy);
    }
    Prefix() {
        return "/Views/";
    }
    Url() {
        if (!this.url) {
            var n = Reflection.GetName(this.constructor).replace("View", "");
            this.url = this.Prefix() + n + ".html";
        }
        return this.url;
    };
    _containerID: string = null;
    ContainerID(): string { return this._containerID; };
    private countBindersReported: number;
    private cached: HTMLElement
    private eHandlrs = new Array<Listener<IView>>();
    private binders = new Array<Binder>();
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
        t.binders = new Array<Binder>();
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
        let t = this;
        if (a.Sender.ResponseText) {
            t.SetHTML(a.Sender.ResponseText);
        }
        a.Sender = null;
    }
    SetHTML(html: string) {
        var t = this,
            c = t.ContainerID().Element();
        if (!Is.NullOrEmpty(c)) {
            t.cached = document.NewE(tag.div, { "innerHTML": html });            
            var ele = t.cached.Get(ele => !Is.NullOrEmpty(ele.getAttribute("data-binder")));
            t.countBindersReported = 0;
            if (ele.length > 0) {
                ele.forEach(e => {
                    try {
                        let a = e.getAttribute("data-binder");
                        if (a) {
                            let fun = new Function("return new " + a + (a.indexOf("(") > -1 ? "" : "()"));
                            e.Binder = <Binder>fun();
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
                            window.Exception(ex);
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
    OnBinderComplete(a: ICustomEventArg<Binder>) {
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
        var be = c.Get(e => Is.Alive(e.Binder));
        be.forEach(e => e.Binder.Dispose());
        c.Clear();
        while (t.cached.childNodes.length > 0) {
            let n = t.cached.childNodes[0];
            t.cached.removeChild(n);
            c.appendChild(n);
        }
        setTimeout(() => {
            t.Dispatch(EventType.Completed);
            t.binders.forEach(b => b.ResetSelectedObject());
        }, 100);
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
interface IPreViewLoad {
    Execute(callback: () => void): void;
}
class DataLoaders implements IPreViewLoad {
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
            t._dataUrl.Get(t._ajaxCompleted.bind(this), t._parameters);
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
    static VirtualPath: string;
    constructor() {
        var n = Reflection.GetName(this.constructor);
        this.Name = n.replace("ViewContainer", "");
        this.Name = this.Name.replace("Container", "");
        ViewContainers.push(this);
    }
    UrlPattern: () => string = null;
    UrlReplacePattern: () => string = null;
    ContainerLoaded: () => void = null;
    SubviewLoaded: (containerLoaded: HTMLElement) => void = null;
    public Name: string;
    Views: Array<IView> = new Array<IView>();
    IsDefault: boolean = false;
    NumberViewsShown: number;
    Show(route: ViewInstance) {
        var rp = route.Parameters, t = this;
        if (rp && rp.length === 1 && t.IsDefault) {
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
            url = url.lastIndexOf("/") === url.length - 1 ? url.substring(0, url.length - 1) : url;
            var p = this.UrlPattern ? this.UrlPattern() : "^" + this.Name;
            if (p) {
                var regex = new RegExp(p, 'i');
                return url.match(regex) ? true : false;
            }
        }
        return false;
    }
    ViewLoadCompleted(a: ICustomEventArg<IView>) {
        var t = this, nvs = t.NumberViewsShown
        if (a.EventType === EventType.Completed) {
            t.NumberViewsShown = t.NumberViewsShown + 1;
        }
        if (t.NumberViewsShown === t.Views.length) {
            ProgressManager.Hide();
            window.scrollTo(0, 0);
            if (Is.Alive(t.ContainerLoaded)) {
                t.ContainerLoaded();
            }
            t.Views.forEach(v => {
                t.LoadSubViews(v.ContainerID());
            });
        }
    }
    LoadSubViews(eleId: string) {
        var subviews = eleId.Element().Get(e => Is.Alive(e.dataset.subview));
        let t = this;
        subviews.forEach(s => {
            s.dataset.subview.Get((arg) => {
                var r = arg.Sender.ResponseText;
                s.innerHTML = r;
                var ele = s.Get(ele => !Is.NullOrEmpty(ele.getAttribute("data-binder")));
                if (ele.length > 0) {
                    ele.forEach(e => {
                        try {
                            let a = e.getAttribute("data-binder");
                            if (a) {
                                let fun = new Function("return new " + a + (a.indexOf("(") > - 1 ? "" : "()"));
                                e.Binder = <Binder>fun();
                                e.Binder.Element = e;
                            }
                        }
                        catch (e) {
                            window.Exception(e);
                        }
                    });
                    ele.forEach(e => {
                        if (e.Binder && e.Binder.AutomaticSelect) {
                            try {
                                e.Binder.Refresh();
                            }
                            catch (ex) {
                                window.Exception(ex);
                            }
                        }
                    });
                }
                Is.Alive(t.SubviewLoaded) ? t.SubviewLoaded(s) : "";
            });
        });
    }
    Url(viewInstance: ViewInstance): string {
        var t = this, vi = viewInstance, rp = viewInstance.Parameters, vp = ViewContainer.VirtualPath;
        var newUrl = "";
        if (vi.Route) {
            newUrl = vi.Route;
        }
        else if (Is.Alive(t.UrlReplacePattern)) {
            var up = t.UrlReplacePattern().split("/"), pi = 0, nu = new Array<string>();
            for (var i = 0; i < up.length; i++) {
                let p = up[i];
                if (p.indexOf("(?:") === 0) {
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
            for (var k = 0; k < nu.length; k++) {
                nu[k] = encodeURIComponent(nu[k]);
            }
            newUrl = nu.join("/");
        }
        if (Is.NullOrEmpty(newUrl)) {
            var ecrp = new Array<string>();
            if (rp) {
                for (var j = 0; j < rp.length; j++) {
                    ecrp.Add(encodeURIComponent(rp[j]));
                }
            }
            newUrl = t.Name + (ecrp.length > 0 ? "/" + ecrp.join("/") : "");
        }
        return (!Is.NullOrEmpty(vp) && newUrl.indexOf(vp) === -1 ? vp + "/" : "") + newUrl;
    }

    UrlTitle() {
        return this.Name.replace(/\//g, " ");
    }
    DocumentTitle(route: ViewInstance): string {
        return this.UrlTitle();
    }
    Parameters(url: string) {
        var u = url;
        u = u ? u.replace(this.Name, '') : u;
        u = u ? u.indexOf('/') === 0 ? u.substring(1) : u : u;
        return u ? u.split('/') : new Array<string>();
    }
}
class SingleViewContainer extends ViewContainer {
    constructor(cacheStrategy: CacheStrategy = CacheStrategy.View, containerId: string = "content", isDefault: boolean = false) {
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
    RefreshBinding: boolean;
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
    Binder: Binder;

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
interface IViewContainer {
    DocumentTitle: (route: ViewInstance) => string;
    IsDefault: boolean;
    Show: (route: ViewInstance) => void;
    Url: (route: ViewInstance) => string;
    UrlPattern: () => string;
    UrlReplacePattern: () => string;
    UrlTitle: (route: ViewInstance) => string;
    IsUrlPatternMatch: (url: string) => boolean;
    Views: Array<IView>;
    Name: string;
    Parameters: (url: string) => Array<string>;
}
module Autofill {

    var afapi = "autofillapi", afva = "value", afvm = "valuemember", afdm = "displaymember",
        afc = "completed", afl = "length", b = "busy", eleC = "cache", afodm = "objdisplaymember", afas = "autoset";

    export function IsAutoFill(ele: HTMLElement, obj: IObjectState): boolean {
        var ret = Is.Alive(ele.dataset[afapi] && (ele.dataset[afvm] || ele.dataset[afdm])) && ((ele.tagName === "INPUT" && ele["type"] === "text") || ele.tagName === "TEXTAREA");
        ret ? initialize(ele, obj) : null;
        return ret;
    }
    export function OnKeyDownHookup(sender: HTMLElement) {
        if (!Is.Alive(sender["hasBeenHookedUpToKeypress"])) {
            Autofill.IsAutoFill(sender, new DataObject({}));
            sender["hasBeenHookedUpToKeypress"] = true;
        }
    }
    function initialize(ele: HTMLElement, obj: IObjectState) {
        let i = ele;
        i.onkeypress = null;
        i.onclick = () => {
            SetCaretPosition(i, 0);
        };
        i.onkeyup = () => {
            var code = (event["keyCode"] ? event["keyCode"] : event["which"]);
            if (i["value"].length === 0 && code === 8) {
                SetValue(i);
            }
        };
        i.onkeypress = () => {
            KeyPress(event);
        };
        i["value"] = i.dataset[afodm] ? obj[i.dataset[afodm]] : "";
    }
    function SetCaretPosition(e: HTMLElement, caretPos) {
        if (Is.Alive(e)) {
            if (e["selectionStart"]) {
                e.focus();
                e["setSelectionRange"](caretPos, e["value"].length);
            }
            else {
                e.focus();
            }
        }
    }
    export function SetValue(ele: HTMLElement) {
        let s = (ele.tagName === "INPUT" || ele.tagName === "TEXTAREA") && ele.dataset[afapi] ? ele :
            ele.parentElement.First(tag.any, i => Is.Alive(i.dataset[afapi])),
            dc = s[eleC], ds = s.dataset, f = ds[afva],
            lf = LookupFields(s), arr = <Array<any>>dc,
            dob = <DataObject>s.DataObject;

        var directSet = () => {
            ExecuteApi(s, s["value"], (ret) => {
                s[eleC] = ret;
                if (ret && ret.length > 0) {
                    SetObjectValues(s, dob, f, ret[0], lf.VM, lf.DM);
                }
            });
        };

        if (s && Is.Alive(f) && !Is.NullOrEmpty(lf.VM) && dob) {
            if (arr && arr.length > 0) {
                var found = arr.First(o => o[lf.DM] === s["value"]);
                if (Is.Alive(found)) {
                    SetObjectValues(s, dob, f, found, lf.VM, lf.DM);
                }
                else {
                    directSet();
                }
            } else if (!Is.NullOrEmpty(s["value"])) {
                directSet();
            }
        }
    }

    function ExecuteApi(s: HTMLElement, v: string, fun: (ret) => void) {
        var api = s.dataset[afapi];
        if (!Is.NullOrEmpty(api)) {
            api = api.slice(-1) !== "/" ? api + "/" : api;
            (api + v).Get((arg) => {
                fun(arg.Sender.GetRequestData());
            });
        }
    }

    function SetObjectValues(s: HTMLElement, dob: any, f: string, found: any, vm: string, dm: string) {
        if (s["value"].length === 0) {
            dob[f] = null;
        }
        else if (found) {
            dob[f] = found[vm];
            if (s.dataset[afodm]) {
                dob[s.dataset[afodm]] = found[dm];
            }
        }
        RunCompleted(found, s);
    }

    function RunCompleted(obj: any, s: HTMLElement) {
        let m = s.dataset[afc];
        if (m && obj) {
            m = m + "(obj);";
            let fun = new Function("obj", m);
            fun(obj);
        }
    }

    function LookupFields(s: HTMLElement): { VM: string, DM: string } {
        var r = { VM: "", DM: "" },
            ds = s.dataset;
        r.DM = ds[afdm] ? ds[afdm] : ds[afvm];
        r.VM = ds[afvm] ? ds[afvm] : ds[afdm];
        return r;
    }
    function KeyPress(event) {

        var code = (event.keyCode ? event.keyCode : event.which);
        let k = event.char ? event.char : event.key,
            s = <HTMLElement>event.target,
            lf = LookupFields(s);

        if (s[b] === true) {
            return true;
        }

        var l = s["value"].length,
            tl = s.dataset[afl] ? parseInt(s.dataset[afl]) : 3;
        let v: string;
        if (code === 13) {
            SetValue(s);
        }
        else if (l === tl) {
            s[b] = true;
            v = s["value"] + k;
            s["pv"] = v;
            ExecuteApi(s, v, (ret) => {
                s[eleC] = ret;
                if (ret && ret.length > 0) {
                    SetDisplayValue(s, ret[0], lf);
                }
                SetCaretPosition(s, 4);
                s[b] = false;
            });
        }
        else if (l > (tl + 1)) {
            v = s["pv"] + k;
            l = v.length;
            s["pv"] = v;
            setTimeout(() => {
                var arr = <Array<any>>s[eleC];
                if (arr) {
                    var found = arr.First(o => o[lf.DM].toLowerCase().indexOf(v.toLowerCase()) > -1);
                    SetDisplayValue(s, found, lf);
                    SetCaretPosition(s, l)
                }
            }, 10);
            return true;
        }
    }
    function SetDisplayValue(s: HTMLElement, o: any, lf: { VM: string, DM: string }) {
        if (o) {
            s["value"] = o[lf.DM];

            s["autofill_local_value"] = o[lf.VM];
            s["autofill_local_display"] = o[lf.DM];

            var sas = s.dataset[afas];
            if (sas === "true") {
                s.DataObject[s.dataset[afva]] = o[lf.VM];
                s.DataObject[s.dataset[afodm]] = o[lf.DM];
            }
        }
    }
}
module Exporter {
    export function Execute(sender: HTMLElement, name: string, includeSpans: boolean = true) {
        var t = sender.tagName === "TABLE" ? sender : sender.Ancestor(tag.table),
            h = t.First(tag.thead),
            ths = h.Get(e => e.tagName === "TH"),
            l = h.First(tag.any, e => Is.Alive(e.First(tag.any, e2 => Is.Alive(e2.dataset.exportheader) || e2.tagName === "LABEL"))).Get(e => Is.Alive(e.dataset.exportheader) || e.tagName === "LABEL"),
            r = t.Get(e => e.tagName == "TR" && Is.Alive(e.dataset.template)),
            rows = new Array<string>(),
            rh = "";

        ths.forEach(he => {
            if (he.style.display !== "none") {
                var hv = Exporter.GetHeaderElementInnerHtml(he);
                rh += (Is.NullOrEmpty(rh) ? "" : ",") + "\"" + hv + "\"";
            }
        });
        rows.Add(rh);
        r.forEach(e => {
            var td = e.querySelectorAll("td");
            var rv = "";
            for (var j = 0; j < td.length; j++) {
                if (td[j].style.display !== "none") {
                    var etd = td[j];
                    rv += (Is.NullOrEmpty(rv) ? "" : ",") + GetValue(etd);
                }
            }
            rows.Add(rv);
        })
        let csvContent = "";
        rows.forEach(rv => {
            csvContent += rv + "\r\n";
        });

        OpenCsv(csvContent, name);

    }
    export function GetHeaderElementInnerHtml(ele: HTMLElement) {
        var exportheader = ele.First(tag.any, e => Is.Alive(e.dataset.exportheader));
        exportheader = Is.Alive(exportheader) ? exportheader : ele.First(tag.label);
        return exportheader ? exportheader.innerHTML.trim() : "";
    }

    export function GetValue(td: HTMLTableCellElement, inludeReadOnlys: boolean = true) {
        var eles = td.Get(e => e.tagName === "INPUT" || e.tagName === "SELECT" || e.tagName === "TEXTAREA");
        if (inludeReadOnlys) {
            td.Get(e => Is.Alive(e.dataset.innerhtml)).forEach(e => eles.Add(e));
        }
        if (eles.length === 0) {
            return td.innerHTML;
        }
        var v = "";
        if (eles.length > 0) {
            eles.forEach(e => {
                var tv = Exporter.GetExportValue(e);
                v += (!Is.NullOrEmpty(v) ? "-" : "") + tv
            });

        }
        return "\"" + v + "\"";
    }
    export function GetExportValue(ele: HTMLElement): string {
        if (ele.tagName === "INPUT" && ele["type"] === "checkbox") {
            return ele["checked"] ? "true" : "false";
        }
        else if (ele.tagName === "INPUT" || ele.tagName === "SELECT" || ele.tagName === "TEXTAREA") {
            return ele["value"];
        }
        else if (ele.tagName === "SPAN" || ele.tagName === "DIV") {
            return ele.innerHTML;
        }
        else if (ele.tagName === "A") {
            if (Is.Alive(ele.dataset.exportvalue) && Is.Alive(ele.DataObject)) {
                return ele.DataObject[ele.dataset.exportvalue];
            }
            else if (ele["href"] === "javascript:") {
                return ele.innerHTML;
            }
            return ele["href"];
        }
    }
    export function OpenCsv(csvContent: string, name: string) {
        var link = document.createElement("a"),
            us = window.location.href.split("/");

        name = us[us.length - 2].RemoveSpecialCharacters() + "_" + name + ".csv";

        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, name);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) {
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", name);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
}
module HistoryContainer {
    export class History implements IEventDispatcher<ViewContainer> {
        private ViewInstances = new Array<ViewInstance>();
        CurrentViewInstance(): ViewInstance {
            var vi = this.ViewInstances;
            return Is.Alive(vi) && vi.length > 0 ? vi[vi.length - 1] : null;
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
        }
        ManageRouteInfo(viewInstance: ViewInstance) {
            var vi = viewInstance,
                vc = vi.ViewContainer,
                t = vc.UrlTitle(vi),
                dt = vc.DocumentTitle(vi),
                h = history,
                u = vc.Url(vi);
            if (Is.Alive(u) && !Is.NullOrEmpty(t) && h && h.pushState) {
                u = !Is.NullOrEmpty(u) ? u.indexOf("/") !== 0 ? "/" + u : u : "/";
                h.pushState(null, t, u);
            }
            if (dt) {
                document.title = dt;
            }
        }
        Manual(title: string, url: string, documentTitle: string = null) {
            document.title = documentTitle ? documentTitle : title;
            history.pushState(null, title, url);
        }
        //this method isnt used anymore but it maybe needed still
        //the "g" is absolutely wrong
        //FormatUrl(url: string) {
        //    url = url.replace(new RegExp("[^A-z0-9_/\\-]"), "g");
        //    return url;
        //}
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
class WindowLoaded {
    constructor(loadedEvent: (e, onCompleteCallback: () => void) => any, shouldRunBeforeNavigation: boolean) {
        this.LoadedEvent = loadedEvent;
        this.ShouldRunBeforeNavigation = shouldRunBeforeNavigation;
        Initializer.WindowLoaded = this;
    }
    LoadedEvent: (e, onCompleteCallback: () => void) => any;
    ShouldRunBeforeNavigation: boolean;
}
module Initializer {
    export var WindowLoaded: WindowLoaded;
    export function Execute(e?) {
        if (document.readyState === "complete") {
            loadedWrapper(e);
        }
        else {
            window.onload = function () {
                loadedWrapper(e);
            };
        }
    }
    function loadedWrapper(e?) {
        var WL = WindowLoaded, wL = windowLoaded;
        if (WL) {
            if (WL.ShouldRunBeforeNavigation) {
                WL.LoadedEvent(e, wL);
            }
            else {
                wL();
                WL.LoadedEvent(e, null);
            }
        }
        else {
            wL();
        }
    }
    function windowLoaded() {
        var w = window;
        setProgressElement();
        Navigate.Url(w.location.pathname.substring(1));
        w.addEventListener("popstate", HistoryManager.BackEvent);
    }
    function setProgressElement() {
        var pg = document.getElementById("progress");
        if (Is.Alive(pg)) {
            ProgressManager.ProgressElement = pg;
        }
    }
}
module Reflection {
    export function GetName(o: any, ignoreThese: Array<string> = new Array<string>()) {
        var r = <string>(o && o.toString ? o.toString() : "");
        if (!Is.NullOrEmpty(r)) {
            if (r.indexOf("function ") > -1 || r.indexOf("class ") > -1) {
                var mark = r.indexOf("function") === 0 ? "()" : " ";
                r = r.replace("function ", "");
                r = r.replace("class ", "");
                var si = r.indexOf(mark);
                return r.substring(0, si);
            }
        }
        return null;
    }
    export function NewObject(type: { new() }) {
        return new type();

    }
}
Initializer.Execute();
module Is {
    export function Func(obj: any): boolean {
        return obj instanceof Function;
    }
    export function Array(value): boolean {
        return Object.prototype.toString.call(value) === '[object Array]';
    }
    export function NullOrEmpty(value): boolean {
        return value === undefined ||
            value === null ||
            (typeof value === "string" && value.length === 0);
    }
    export function Number(value): boolean {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
    export function String(value): boolean {
        return typeof value === "string";
    }
    export function Alive(value): boolean {
        return value === undefined || value === null ? false : true;
    }
    export function HTMLElement(o): boolean {
        return Is.Alive(o["tagName"]);
    }
    export function Boolean(o): boolean {
        return typeof o === "boolean";
    }
    export function ValueType(o) {
        return typeof o !== "object" && !Is.Array(o);
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
module Navigate {
    export function Spa<T extends IViewContainer>(type: { new(): T; }, parameters: any = null) {
        var p = Is.Array(parameters) ? <Array<any>>parameters : new Array<any>();
        if (Is.Alive(parameters) && !Is.Array(parameters)) {
            p.Add(parameters)
        }
        p = p && p.length === 1 && p[0] === "" ? null : p;
        var vc = Reflection.NewObject(type),
            vi = new ViewInstance(p, vc);
        vc.Show(vi);
        HistoryManager.Add(vi);
    }
    export function Url(url: string) {
        var vp = ViewContainer.VirtualPath ? ViewContainer.VirtualPath : "", vcs = ViewContainers;
        url = vp && url.length > 0 ? url.replace(vp, '') : url;
        url = url.length > 0 && url.indexOf("/") === 0 ? url.substr(1) : url;
        var vc: IViewContainer = url.length === 0 ? vcs.First(vc => vc.IsDefault) : vcs.Where(vc => !vc.IsDefault).First(d => d.IsUrlPatternMatch(url));
        vc = vc === null ? vcs.First(d => d.IsDefault) : vc;
        if (vc) {
            var p = vc.Parameters(url),
                vi = new ViewInstance(p, vc, url);
            p = vi.Parameters;
            if (p && p.length && !Is.NullOrEmpty(ViewContainer.VirtualPath) && p[0] === ViewContainer.VirtualPath) {
                p.splice(0, 1);
            }
            while (p.length && p.length > 0 && Is.NullOrEmpty(p[0])) {
                p.splice(0, 1);
            }
            vc.Show(vi);
            HistoryManager.Add(vi);
        }
    }
}
enum Placement {
    LeftTop, LeftBottom, RightTop, RightBottom, CenterLeft, CenterRight
}
module Popup {
    export var Element: HTMLElement;
    export function Show(ele: HTMLElement, coord?: any) {
        var cpup = Popup.Element;
        document.removeEventListener('click', Popup.Click);
        Is.Alive(cpup) ? cpup.style.visibility = "hidden" : null;
        Popup.Element = ele;
        var isFun = Is.Alive(coord) && Is.Func(coord);
        ele.style.visibility = "visible";
        var tempC = Is.Alive(coord) && Is.Func(coord) ? coord() : coord;
        if (Is.Alive(tempC)) {
            Popup.SetCoord(ele, "left", tempC);
            Popup.SetCoord(ele, "right", tempC);
            Popup.SetCoord(ele, "top", tempC);
            Popup.SetCoord(ele, "bottom", tempC);
        }
        setTimeout(() => {
            document.addEventListener('click', Popup.Click);
        }, 1);
        ele.focus();
    }
    export function SetCoord(ele: HTMLElement, attr: string, coord?: { left?: number, right?: number, top?: number, bottom?: number }) {
        if (Is.Alive(coord) &&
            Is.Alive(coord[attr]) &&
            coord[attr] > 0) {
            ele.style[attr] = coord[attr] + "px";
        }
    }
    export function Hide() {
        if (Popup.Element) {
            Popup.Element.style.visibility = 'hidden';
            Popup.Element = null;
        }
    }
    export function Click(event) {
        var cpup = Popup.Element;
        if (Is.Alive(cpup) && !cpup.contains(event.target)) { // or use: event.target.closest(selector) === null            
            Popup.Hide();
            document.removeEventListener('click', Popup.Click);
        }
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
    var t = this;
    var f = (v: number) => {
        return (v <= 9 ? '0' : '') + v.toString();
    };
    var d = f(t.getDate()),
        m = f(t.getMonth() + 1),
        y = t.getFullYear(),
        h = f(t.getHours()),
        M = f(t.getMinutes()),
        s = f(t.getSeconds());
    return '' + y + '-' + m + '-' + d + ' ' + h + ":" + M + ":" + s;
};
interface Document {
    NewE<T extends string>(tagName: T): Caster<T>;
    NewE<T extends string>(tagName: T, objectProperties?: any): Caster<T>;
}
Document.prototype.NewE = function <T extends string>(tagName: T, objectProperties?: any): Caster<T> {
    var ele = document.createElement(tagName.toUpperCase()), op = objectProperties;
    if (op) {
        ele.Set(op);
    }
    return <Caster<T>>ele;
};
type AllElements = {
    'a': HTMLAnchorElement,
    'div': HTMLDivElement,
    'span': HTMLSpanElement,
    'table': HTMLTableElement,
    'tr': HTMLTableRowElement,
    'td': HTMLTableCellElement,
    'input': HTMLInputElement,
    'textarea': HTMLTextAreaElement,
    'select': HTMLSelectElement,
    'button': HTMLButtonElement,
    'label': HTMLLabelElement,
    'th': HTMLTableHeaderCellElement,
    'tfoot': HTMLTableSectionElement,
    'tbody': HTMLTableSectionElement,
    'thead': HTMLTableSectionElement,
    'any': HTMLElement,
    'form': HTMLFormElement,
    'i': HTMLElement,
    'fieldset': HTMLFieldSetElement,
    'ul': HTMLUListElement,
    "li": HTMLLIElement
};
type Caster<T extends string> = T extends keyof AllElements ? AllElements[T] : HTMLElement;
module tag {
    export const any = 'any';
    export const div = 'div';
    export const input = 'input';
    export const textarea = 'textarea';
    export const select = 'select';
    export const button = 'button';
    export const a = 'a';
    export const span = 'span';
    export const label = 'label';
    export const table = 'table';
    export const tr = 'tr';
    export const td = 'td';
    export const th = 'th';
    export const thead = 'thead';
    export const tfoot = 'tfoot';
    export const tbody = 'tbody';
    export const form = 'form';
    export const i = 'i';
    export const fieldset = 'fieldset';
    export const ul = 'ul';
    export const li = 'li';
};
module HTMLElementHelper {
    export function IsMatch<T extends string>(ele: HTMLElement, tagName: string, predicate: (ele: Caster<T>) => boolean = null): boolean {
        predicate = predicate === null ? (e: Caster<T>) => true : predicate;
        return (tagName === tag.any || ele.tagName.toLowerCase() === tagName) && predicate(<Caster<T>>ele);
    }
}
interface HTMLElement extends Element {
    Get(func: (ele: HTMLElement) => boolean, notRecursive?: boolean, nodes?: Array<HTMLElement>): HTMLElement[];

    First<T extends string>(tagName: T): Caster<T>;
    First<T extends string>(tagName: T, predicate: (ele: Caster<T>) => boolean): Caster<T>;

    Clear();
    AddListener(eventName, method);
    HasDataSet: () => boolean;
    GetDataSetAttributes: () => { Attribute: string; Property: any; }[];
    Binder: Binder;
    Cast<T extends DataObject>(type: { new(serverObject: any): T; }): T;
    DataObject: IObjectState;
    Delete();
    Save();
    SaveDirty();
    Ancestor<T extends string>(tagName: T): Caster<T>;
    Ancestor<T extends string>(tagName: T, predicate: (ele: Caster<T>) => boolean): Caster<T>;
    Relative<T extends string>(tagName: T): Caster<T>;
    Relative<T extends string>(tagName: T, predicate: (ele: Caster<T>) => boolean): Caster<T>;

    ClearBoundElements();
    Bind(obj: any);
    Bind(obj: any, refresh: boolean);
    IndexOf(ele: HTMLElement);
    PostAndInsertBefore(obj: any, index: number);
    PostAndInsertBeforeChild(childMatch: (child) => boolean, obj: any);
    PostAndAppend(obj: any);
    Append(obj: any);
    InsertBefore(obj: any, index: number);
    InsertBeforeChild(childMatch: (child) => boolean, obj: any);
    Set(objectProperties): HTMLElement;
    PopupShow(coord?: any);
    PopupHide();
    PopupAt(target: HTMLElement, placement: Placement, offset?: { x: number, y: number });
    GetPosition(): { x: number, y: number, width: number, height: number };
}
HTMLElement.prototype.PopupHide = function () {
    Popup.Hide();
};
HTMLElement.prototype.GetPosition = function () {
    var el = <HTMLElement>this, gbr = el.getBoundingClientRect();
    var xPos = 0;
    var yPos = 0;
    while (el) {
        if (el.tagName == "BODY") {
            var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
            var yScroll = el.scrollTop || document.documentElement.scrollTop;
            xPos += (el.offsetLeft - xScroll + el.clientLeft);
            yPos += (el.offsetTop - yScroll + el.clientTop);
        } else {
            xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
            yPos += (el.offsetTop - el.scrollTop + el.clientTop);
        }
        el = <HTMLElement>el.offsetParent;
    }
    return {
        x: xPos,
        y: yPos,
        width: gbr.width,
        height: gbr.height
    };
};
HTMLElement.prototype.PopupAt = function (target: HTMLElement, placement: Placement, offset?: { x: number, y: number }) {
    var pup = <HTMLElement>this;
    let pos = target.GetPosition(),
        gbr = pup.getBoundingClientRect(),
        wrad = gbr.width;
    switch (placement) {
        case Placement.RightBottom:
            pos.x += pos.width;
            pos.y += pos.height;
            break;
        case Placement.RightTop:
            pos.x += pos.width;
            break;
        case Placement.LeftBottom:
            pos.y += pos.height;
            break;
        case Placement.CenterLeft:
            pos.y -= gbr.height / 2;
            break;
        case Placement.CenterRight:
            pos.y -= gbr.height / 2;
            break;
        case Placement.LeftTop:
        default:
            break;
    }
    pup.PopupShow({ left: pos.x - wrad + (offset ? offset.x : 0), top: pos.y + (offset ? offset.y : 0) });
};
HTMLElement.prototype.PopupShow = function (coord?: any) {
    var e = <HTMLElement>this;
    Popup.Show(e, coord);
};
HTMLElement.prototype.Cast = function <T extends IObjectState>(type: { new(serverObject: any): T; }): T {
    var f = this.DataObject;
    return f ? <T>f : null;
};
HTMLElement.prototype.First = function <T extends string>(tagName: T, predicate: (ele: Caster<T>) => boolean = null): Caster<T> {
    var chs = (<HTMLElement>this).children;

    for (var i = 0; i < chs.length; i++) {
        let c = <HTMLElement>chs[i];
        if (c.nodeType === 1 && c.tagName.toLowerCase() !== "svg") {
            if (HTMLElementHelper.IsMatch(c, tagName, predicate)) {
                return <Caster<T>>c;
            }
        }
    }
    for (var j = 0; j < chs.length; j++) {
        let c = <HTMLElement>chs[j];
        if (c.nodeType === 1 && c.tagName.toLowerCase() !== "svg") {
            if (c.First) {
                let f = c.First(tagName, predicate);
                if (f) {
                    return <Caster<T>>f;
                }
            }
        }
    }
    return null;
};
HTMLElement.prototype.Relative = function <T extends string>(tagName: T, predicate: (ele: Caster<T>) => boolean = null): Caster<T> {
    if (!Is.Alive(this || this.parentElement)) {
        return null;
    }
    var p = <HTMLElement>this.parentElement;
    if (HTMLElementHelper.IsMatch(p, tagName, predicate)) {
        return <Caster<T>>p;
    } else {
        var chs = (<HTMLElement>p).children;
        for (var i = 0; i < chs.length; i++) {
            let c = <HTMLElement>chs[i];
            if (c.nodeType === 1 && c.tagName.toLowerCase() !== "svg") {
                if (HTMLElementHelper.IsMatch(c, tagName, predicate)) {
                    return <Caster<T>>c;
                }

                var r = c.First(tagName, predicate);
                if (Is.Alive(r)) {
                    return <Caster<T>>r;
                }
            }
        }
        return p.Relative(tagName, predicate);
    }
};
HTMLElement.prototype.InsertBeforeChild = function (childMatch: (child) => boolean, obj: any) {
    var p = <HTMLElement>this;
    var fc = p.First(tag.any, childMatch);
    if (fc) {
        p = fc.parentElement;
        var i = p.IndexOf(fc);
        if (Is.Alive(i)) {
            p = <HTMLElement>this;
            p.InsertBefore(obj, i);
        }
    }

};
HTMLElement.prototype.InsertBefore = function (obj: any, index: number) {
    var p = <HTMLElement>this, b = p.Binder;
    while (!Is.Alive(b) && Is.Alive(p)) {
        p = p.parentElement;
        if (!Is.Alive(p)) {
            break;
        }
        b = p.Binder
    }
    if (Is.Alive(b)) {
        b.InsertBefore(obj, index);
    }
};
HTMLElement.prototype.Append = function (obj: any) {
    var p = <HTMLElement>this, b = p.Binder;
    while (!Is.Alive(b) && Is.Alive(p)) {
        p = p.parentElement;
        if (!Is.Alive(p)) {
            break;
        }
        b = p.Binder
    }
    if (Is.Alive(b)) {
        b.Append(obj);
    }
};
HTMLElement.prototype.PostAndAppend = function (obj: any) {
    var p = <HTMLElement>this, b = p.Binder;
    while (!Is.Alive(b) && Is.Alive(p)) {
        p = p.parentElement;
        if (!Is.Alive(p)) {
            break;
        }
        b = p.Binder
    }
    if (Is.Alive(b)) {
        b.PostAndAppend(obj);
    }
};
HTMLElement.prototype.PostAndInsertBeforeChild = function (childMatch: (child) => boolean, obj: any) {
    var p = <HTMLElement>this;
    var fc = p.First(tag.any, childMatch);
    if (fc) {
        p = fc.parentElement;
        var i = p.IndexOf(fc);
        if (Is.Alive(i)) {
            p = <HTMLElement>this;
            p.PostAndInsertBefore(obj, i);
            return;
        }
    }
    p = <HTMLElement>this;
    p.PostAndAppend(obj);
};
HTMLElement.prototype.PostAndInsertBefore = function (obj: any, index: number) {
    var p = <HTMLElement>this, b = p.Binder;
    while (!Is.Alive(b) && Is.Alive(p)) {
        p = p.parentElement;
        if (!Is.Alive(p)) {
            break;
        }
        b = p.Binder
    }
    if (Is.Alive(b)) {
        b.PostAndInsertBefore(obj, index);
    }
};
HTMLElement.prototype.IndexOf = function (child: HTMLElement) {
    var p = <HTMLElement>this, c = p.children;
    var i = c.length - 1;
    for (; i >= 0; i--) {
        if (child === c[i]) {
            return i;
        }
    }
    return undefined;
};
HTMLElement.prototype.Bind = function (obj: any, refresh: boolean = false) {
    var t = <HTMLElement>this;
    if (refresh) {
        //you might be clearing out elements before the template has been aquired
        t.ClearBoundElements();
    }
    var b = t.Binder;
    if (b) {
        if (obj instanceof ViewInstance) {
            b.Refresh(<ViewInstance>obj);
        }
        else if (obj instanceof Array) {
            var arr = <Array<any>>obj;
            for (var i = 0; i < arr.length; i++) {
                var tempObj = arr[i];
                b.Append(tempObj);
            }
        }
        else if (obj) {
            b.Append(obj);
        }
    }
};
HTMLElement.prototype.ClearBoundElements = function () {
    var t = <HTMLElement>this;
    t.Get(e => Is.Alive(e.getAttribute("data-template"))).forEach(r => r.parentElement.removeChild(r));
    if (t.Binder) {
        while (t.Binder.DataObjects.Data.length > 0) {
            t.Binder.DataObjects.Data.pop();
        }
    }
};
HTMLElement.prototype.SaveDirty = function () {
    let t = <HTMLElement>this,
        p = Is.Alive(t.Binder) ? t : t.Ancestor(tag.any, p => Is.Alive(p.Binder));
    if (p && p.Binder) {
        p.Binder.SaveDirty();
    }
};
HTMLElement.prototype.Save = function () {
    var t = <HTMLElement>this, p = t.Ancestor(tag.any, p => Is.Alive(p.Binder));
    if (p && p.Binder) {
        p.Binder.Save(t.DataObject);
    }
};
HTMLElement.prototype.Get = function (func: (ele: HTMLElement) => boolean, notRecursive?: boolean, nodes?: Array<HTMLElement>): HTMLElement[] {
    var n = !Is.Alive(nodes) ? new Array<HTMLElement>() : nodes;
    var chs = (<HTMLElement>this).children;
    for (var i = 0; i < chs.length; i++) {
        let c = <HTMLElement>chs[i];
        if (c.nodeType === 1 && c.tagName.toLowerCase() !== "svg") {
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
    var t = <HTMLElement>this, p = t.Ancestor(tag.any, p => Is.Alive(p.Binder));
    if (p && p.Binder) {
        p.Binder.Delete(this, null);
    }
};
HTMLElement.prototype.Ancestor = function <T extends string>(tagName: T, predicate: (ele: Caster<T>) => boolean = null): Caster<T> {
    var p = <HTMLElement>this.parentElement;
    if (!Is.Alive(p)) {
        return null;
    }
    return HTMLElementHelper.IsMatch(p, tagName, predicate) ? <Caster<T>>p : p.Ancestor(tagName, predicate);
}
HTMLElement.prototype.Set = function (objectProperties) {
    var t = <HTMLElement>this, op = objectProperties;
    if (op) {
        for (var p in op) {
            if (p !== "cls" && p !== "className") {
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
interface HTMLSelectElement {
    AddOptions(arrayOrObject, valueProperty?: string, displayProperty?: string, selectedValue?): HTMLSelectElement;
    SetSelectedValue(value: string);
}
HTMLSelectElement.prototype.SetSelectedValue = function (value: string) {
    var dd = <HTMLSelectElement>this;
    for (var i = 0; i < dd.options.length; i++) {
        var opt = dd.options[i];
        opt.selected = opt.text === value;
    }
};
HTMLSelectElement.prototype.AddOptions = function (arrayOrObject, valueProperty?: string, displayProperty?: string, selectedValue?): HTMLSelectElement {
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
    Element<T extends HTMLElement>(): T;
    IsStyle(): boolean;
    RemoveSpecialCharacters(replaceWithCharacter?: string): string;
    Post(cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean);
    Put(cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean);
    Get(cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean);
    Delete(cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean);
    GetStyle(): string;
    CopyToClipboard(sender: HTMLElement): (alertMessage: string, timeout?: number, attributeAndStyle?: any) => void;
    Alert(target: HTMLElement, timeout?: any, attributesAndStyle?: any);
    ReplaceAll(replace: string, withValue: string): string;

}
String.prototype.ReplaceAll = function (replace: string, withValue: string): string {
    return this.replace(new RegExp(replace, 'g'), withValue);
}
String.prototype.GetStyle = function (): string {
    var v = <string>this;
    if (v) {
        for (var p in document.body.style) {
            if (p.toLowerCase() === v.toLowerCase()) {
                return p;
            }
        }
    }
    return null;
}
String.prototype.CopyToClipboard = function (sender: HTMLElement): (alertMessage: string, timeout?: number, attributeAndStyle?: any) => void {
    var v = <string>this;
    var el = document.createElement('textarea');
    let t = sender;

    el.value = v;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    t.appendChild(el);
    el.select();
    document.execCommand('copy');
    t.removeChild(el);

    var alert = (alertMessage: string = "Copied to clipboard", timeout: number = 1500, attributeAndStyle: any = null) => {
        alertMessage.Alert(t, timeout, attributeAndStyle);
    }
    return alert;
}
String.prototype.Alert = function (target: HTMLElement, timeout: number = 1500, attributesAndStyle: any = null) {

    var message = <string>this;
    let s = target, b = document.body;

    var bx = s.getBoundingClientRect(),
        de = document.documentElement, w = window,
        st = w.pageYOffset || de.scrollTop || b.scrollTop,
        sl = w.pageXOffset || de.scrollLeft || b.scrollLeft,
        ct = de.clientTop || b.clientTop || 0,
        cl = de.clientLeft || b.clientLeft || 0,
        t = bx.top + st - ct + bx.height,
        l = bx.left + sl - cl;

    let d = document.NewE(tag.div, {
        fontSize: ".9rem", padding: ".125rem .25rem", position: "absolute", zIndex: "1000000000", border: 'solid 1px gray', className: "alert alert-light",
        top: t + "px", left: l + "px"
    });

    d["role"] = "alert";

    if (attributesAndStyle) {
        var op = attributesAndStyle;
        for (var p in op) {
            var sp = p.GetStyle();
            if (sp) {
                d.style[sp] = op[p];
            }
            else if (p === "class") {
                var cs = op[p].toString().split(" ");
                cs.forEach(c => d.classList.add(c));
            }
            else {
                d[p] = op[p];
            }
        }
    }

    d.innerHTML = message;
    b.appendChild(d);

    setTimeout(() => {
        b.removeChild(d);
    }, timeout);

}
String.prototype.Delete = function (cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean) {
    withProgress = Is.Alive(withProgress) ? withProgress : true;
    var a = new Ajax(withProgress);
    a.AddListener(EventType.Any, cb);
    a.Delete(this, parameter);
};
String.prototype.Get = function (cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean) {
    withProgress = Is.Alive(withProgress) ? withProgress : true;
    var a = new Ajax(withProgress);
    a.AddListener(EventType.Any, cb);
    a.Get(this, parameter);
};
String.prototype.Post = function (cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean) {
    withProgress = Is.Alive(withProgress) ? withProgress : true;
    var a = new Ajax(withProgress);
    a.AddListener(EventType.Any, cb);
    a.Post(this, parameter);
};
String.prototype.Put = function (cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean) {
    withProgress = Is.Alive(withProgress) ? withProgress : true;
    var a = new Ajax(withProgress);
    a.AddListener(EventType.Any, cb);
    a.Put(this, parameter);
};
String.prototype.RemoveSpecialCharacters = function (replaceWithCharacter?: string) {
    var s = <string>this, p: string = null, r: string = "", rc = !Is.Alive(replaceWithCharacter) ? "-" : replaceWithCharacter;
    s = s.trim();
    for (var i = 0; i < s.length; i++) {
        let c = s.charAt(i);
        let m = c.match(/\w/);
        if ((c === rc && p !== rc) || (m && m.length > 0)) {
            r += c;
            p = c;
        }
        else if (c === " " && p !== rc) {
            p = rc;
            r += p;
        }
    }
    return r;
};
String.prototype.Trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.Element = function <T extends HTMLElement>(): T {
    var e = document.getElementById(this.toString());
    return e ? <T>e : null;
};
String.prototype.IsStyle = function () {
    return Is.Alive(document.body.style[this]);
};
interface Window {
    Exception(parameters: any);
}
Window.prototype.Exception = function (parameters: any) {
    var a = alert, p = parameters;
    a(Is.Array(p) || !Is.String(p) ? JSON.stringify(p) : p.toString());
}; 
