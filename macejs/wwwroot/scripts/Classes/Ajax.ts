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