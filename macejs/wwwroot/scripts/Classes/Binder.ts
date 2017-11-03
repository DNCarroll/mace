﻿class Binder implements IBinder {
    _api: string = null;
    PrimaryKeys: Array<string> = new Array<string>();
    constructor(primaryKeys: Array<string> = null, api: string = null, autoUpdate: boolean = false, TypeObject: { new(obj: any): IObjectState; } = null, staticProperties: Array<string> = null) {
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
    DataObjects: DataObjectCacheArray<IObjectState> = new DataObjectCacheArray<IObjectState>();
    AutomaticUpdate: boolean = true;
    AutomaticSelect: boolean = true;
    DataRowTemplates = new Array<HTMLElement>();
    DataRowFooter: HTMLElement;
    MoreKeys: string[];
    MoreThreshold: number;
    MoreElement: HTMLElement;
    StaticProperties: Array<string>;
    NewObject(obj: any): IObjectState {
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
            return "/" + np.join("/");
        }
        return null;
    }
    initialLoad = true;
    Execute(viewInstance: ViewInstance = null) {
        var t = this;
        t.prepTemplates();
        try {
            if (this.DataObjects.length > 0 && this.initialLoad) {
                t.SetUpMore(t.DataObjects);
                t.DataObjects.forEach(obj => {
                    t.Add(obj, true);
                });
                t.Dispatch(EventType.Completed);
            }
            else if (t.AutomaticSelect && !Is.NullOrEmpty(t.Api)) {
                var a = new Ajax(t.WithProgress, t.DisableElement),
                    url = t.GetApiForAjax(viewInstance.Parameters);
                if (!Is.NullOrEmpty(url)) {
                    a.AddListener(EventType.Any, t.OnAjaxComplete.bind(this));
                    a.Get(url);
                }
                else {
                    t.Dispatch(EventType.Completed);
                }
            }
            else {
                t.Dispatch(EventType.Completed);
            }
        } catch (e) {
            alert("Failed to load data.");
        }
        this.initialLoad = false;
    }
    OnAjaxComplete(arg: CustomEventArg<Ajax>) {
        var t = this, x = arg.Sender.XHttp, s = x.status;
        if (!t.isRedirecting(x)) {
            if (s === 200) {
                var d = arg.Sender.GetRequestData();
                if (d) {
                    this.RouteBinding(d);
                }
            }
        }
    }
    RouteBinding(data: any) {
        var t = this,
            d = data;
        if (Is.Array(d)) {
            (<Array<any>>d).forEach(d => t.Add(t.NewObject(d)));
        }
        else if (d) {
            var newobject = t.NewObject(d);
            this.DataObjects.Data.Add(newobject);
            t.Bind(newobject);
        }
        this.SetUpMore(d);
        this.DataObjects.SaveCache();
        t.Dispatch(EventType.Completed);
    }
    SetUpMore(d: DataObjectCacheArray<IObjectState>) {
        var t = this,
            tm = t.MoreElement, tms = "none";
        if (tm) {
            tms = t.DataObjects.length % t.MoreThreshold === 0 && d.length > 0 ? "inline" : tms;
            tm.style.display = tms;
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
                    var es = t.Element.Get(e => e.DataObject === o), td = t.DataObjects.Data, i = td.indexOf(o);
                    es.forEach(e2 => e2.parentElement.removeChild(e2));
                    td.slice(i);
                    td.forEach(o => o.InstigatePropertyChangedListeners("AlternatingRowClass", false));
                },
                afc = (arg: CustomEventArg<Ajax>) => {
                    var err = () => {
                        var x = arg.Sender.XHttp, s = x.status;
                        if (!t.isRedirecting(x)) {
                            if ([204, 404].indexOf(s) > -1) {
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
                    a.AddListener(EventType.Any, afc);
                    a.Delete(t.Api(), o.ServerObject);
                };
            t.AutomaticUpdate ? af() : f();
        }
    }
    Add(obj: IObjectState, shouldNotAddItsAlreadyCached: boolean = false) {
        var t = this;
        t.prepTemplates();
        t.DataRowTemplates.forEach(d => {
            let ne = <HTMLElement>d.cloneNode(true),
                be = ne.Get(e => e.HasDataSet()),
                drf = t.DataRowFooter,
                pe = t.Element.tagName === "TABLE" ? (<HTMLTableElement>t.Element).tBodies[0] : t.Element;
            be.Add(ne);
            drf ? pe.insertBefore(ne, drf) : pe.appendChild(ne);
            if (!shouldNotAddItsAlreadyCached) {
                t.DataObjects.Add(obj);
            }
            obj.Container = t.DataObjects.Data;
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
                    let o = t.DataObjects.First(d => t.isPKMatch(d, rd[i]));
                    if (o) {
                        t.SetServerObjectValue(o, rd[i]);
                        o.ObjectState = ObjectState.Clean;
                        t.DataObjects && t.DataObjects.length > 0 ? t.DataObjects.SaveCache() : null;
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
            d = t.DataObjects;
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
            var ds = ba.First(f => f.Attribute === "datasource"),
                dm = ba.First(f => f.Attribute === "displaymember"),
                vm = ba.First(f => f.Attribute === "valuemember");
            if (ds) {
                var fun = new Function("return " + ds.Property),
                    data = fun();
                (<HTMLSelectElement>ele).AddOptions(data, vm ? vm.Property : null, dm ? dm.Property : null);
            }
        }
        var nba = ["binder", "datasource", "displaymember", "valuemember", "onclick"];
        ba.forEach(b => {
            if (!nba.First(v => v === b.Attribute)) {
                let a = t.getAttribute(b.Attribute), tn = ele.tagName;
                t.setObjPropListener(b.Property, a, ele, d);
                if (["INPUT", "SELECT", "TEXTAREA"].indexOf(tn) > -1) {
                    let ea = b.Attribute === "checked" && ele["type"] === "checkbox" ? "checked" : b.Attribute;
                    if (ea) {
                        let fun = (evt) => {
                            d.OnElementChanged.bind(d)(ele[ea], b.Property);
                        };
                        ele.addEventListener("change", fun);
                    }
                }
            }
        });
        var onclicks = ba.Where(a => a.Attribute === "onclick");
        if (onclicks && onclicks.length > 0) {
            onclicks.forEach(a => {
                ele.DataObject = d;
                var body = <string>a.Property;
                if (body) {
                    body = body.lastIndexOf(";") === body.length - 1 ? body : body + ";";
                    var fun = new Function("sender", body);
                    ele.onclick = () => {
                        fun(ele);
                        return;
                    };
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
                    if (s) {
                        e.style[s] = v
                    } else {
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
            pbd = pb.DataObjects.Data;
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