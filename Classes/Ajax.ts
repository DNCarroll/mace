//a promise type too?
class Ajax implements IEventDispatcher<Ajax>{
    constructor() { }
    DisableElement: any = null;
    static Host: string;
    ManipulateProgressElement = false;
    UseAsDateUTC = true;
    ContentType = "application/json; charset=utf-8";
    Header: () => any;
    eventHandlers = new Array<Listener<Ajax>>();
    get ResponseText(): string {
        return this.XMLHttpRequest.responseText;
    }
    XMLHttpRequest: XMLHttpRequest;
    Submit(method: string, url: string, parameters: any = null) {
        var t = this;
        t.showProgress();
        url = t.getUrl(url);
        t.XMLHttpRequest = new XMLHttpRequest(); 
        var x = t.XMLHttpRequest;       
        x.addEventListener("readystatechange", t.onReaderStateChange.bind(t), false);        
        x.open(method, url, true);
        x.setRequestHeader("content-type", t.ContentType);
        t.setCustomHeader();
        try {
            x.send(t.getParameters(parameters));
        } catch (e) {
            t.HideProgress();
            window.Exception(e);
        }
    }
    private onReaderStateChange(e) {
        if (this.isRequestReady()) {
            this.HideProgress();
            this.Dispatch(EventType.Completed);            
        }
    }
    private showProgress() {
        this.showHideProgress(true);
    }
    private getUrl(url: string): string {
        if (url.indexOf("http") == -1 && !Is.NullOrEmpty(Ajax.Host)) {
            url = Ajax.Host + (url.indexOf("/") == 0 ? url : "/" + url);
        }
        return url;
    }
    private isRequestReady(): boolean {
        return this.XMLHttpRequest && this.XMLHttpRequest.readyState == 4;
    }
    HideProgress() {
        this.showHideProgress(false);
    }
    private showHideProgress(show: boolean) {
        if (this.ManipulateProgressElement) {
            show ? ProgressManager.Show() : ProgressManager.Hide();
            var de = this.DisableElement, d = "disabled";
            if (de) {
                if (Is.Array(de)) {
                    for (var i = 0; i < de.length; i++) {
                        show ? de[i].setAttribute(d, d) : de[i].removeAttribute(d);
                    }
                }
                else {
                    show ? de.setAttribute(d, d) : de.removeAttribute(d);
                }
            }
        }
    }
    private setCustomHeader() {
        var t = this;
        if (t.Header) {
            var h = t.Header();
            if (h) {
                for (var prop in h) {
                    t.XMLHttpRequest.setRequestHeader(prop, h[prop]);
                }
            }
        }
    }
    private getParameters(parameters: any): string {
        var r = "";
        if (parameters && this.ContentType == "application/json; charset=utf-8") {
            r = JSON.stringify(parameters);
            r = r.replace(/\\\"__type\\\"\:\\\"[\w+\.?]+\\\"\,/g, "");
            r = r.replace(/\"__type\"\:\"[\w+\.?]+\"\,/g, "");
            r = r.replace(/<script/ig, "");
            r = r.replace(/script>/ig, "");
        }
        return r;
    }

    GetRequestData(): any {
        var r = null, t = this;        
        if (t.isRequestReady() && (t.XMLHttpRequest.status == 200 || t.XMLHttpRequest.status == 204) &&
            !Is.NullOrEmpty(t.XMLHttpRequest.responseText)) {
            r = t.XMLHttpRequest.responseText;
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
    private convertProperties(object) {
        var km: Array<any>, t = this;
        if (Is.Array(object)) {
            for (var i = 0; i < object.length; i++) {
                let o = object[i];
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
        else if (object && typeof object === 'object') {
            km = t.getKeyMap(object);
            t.setValues(object, km);
            for (var p in object) {
                t.convertProperties(object[p]);
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

    Get(url: string, parameters: any = null) { this.Submit("GET", url, parameters); }
    Put(url: string, parameters: any = null) { this.Submit("PUT", url, parameters); }
        
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
        var listeners = this.eventHandlers.Where(e => e.EventType === eventType);
        listeners.forEach(l => l.EventHandler(new CustomEventArg<Ajax>(this, eventType)));        
    }
}

