class Ajax implements IEventDispatcher<Ajax>{
    constructor(withProgress: boolean = false, disableElement:any = null) {
        this.WithProgress = withProgress;
        this.DisableElement = disableElement;
    }
    DisableElement: any = null;
    static Host: string;
    WithProgress = false;
    UseAsDateUTC = true;
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
        var t = this, x = t.XHttp;
        if (t.isRequestReady()) {
            t.Progress(false);
            t.Dispatch(x.status === 200 || x.status === 204 ? EventType.Completed : EventType.Error);
        }
    }
    private getUrl(url: string): string {
        if (url.indexOf("http") == -1 && !Is.NullOrEmpty(Ajax.Host)) {
            url = Ajax.Host + (url.indexOf("/") == 0 ? url : "/" + url);
        }
        return url;
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
        var r = "";
        if (parameters && this.ContentType === "application/json; charset=utf-8") {
            r = JSON.stringify(parameters).replace(/\\\"__type\\\"\:\\\"[\w+\.?]+\\\"\,/g, "")
                .replace(/\"__type\"\:\"[\w+\.?]+\"\,/g, "")
                .replace(/<script/ig, "")
                .replace(/script>/ig, "");
        }
        return r;
    }

    GetRequestData(): any {
        var r = null, t = this, x = this.XHttp;       
        if (t.isRequestReady() && (x.status == 200 || x.status == 204) &&
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
            let k = keyMap[j].Key;
            let t = keyMap[j].Type;
            let v = obj[k];
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

