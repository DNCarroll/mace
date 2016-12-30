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
    Submit(method: string,
        url: string,        
        parameters: any = null) {
        this.showProgress();
        url = this.getUrl(url);
        this.XMLHttpRequest = new XMLHttpRequest();
        var ajax = this;
        this.XMLHttpRequest.addEventListener("readystatechange", ajax.onReaderStateChange.bind(ajax), false);        
        this.XMLHttpRequest.open(method, url, true);
        this.XMLHttpRequest.setRequestHeader("content-type", this.ContentType);
        this.setCustomHeader();
        try {
            var newParameters = this.getParameters(parameters);
            this.XMLHttpRequest.send(newParameters);
        } catch (e) {
            this.HideProgress();
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
            if (this.DisableElement) {
                if (Is.Array(this.DisableElement)) {
                    for (var i = 0; i < this.DisableElement.length; i++) {
                        show ? this.DisableElement[i].setAttribute("disabled", "disabled") : this.DisableElement[i].removeAttribute("disabled");
                    }
                }
                else {
                    show ? this.DisableElement.setAttribute("disabled", "disabled") : this.DisableElement.removeAttribute("disabled");
                }
            }
        }
    }
    private setCustomHeader() {
        if (this.Header) {
            var header = this.Header();
            if (header) {
                for (var prop in header) {
                    this.XMLHttpRequest.setRequestHeader(prop, header[prop]);
                }
            }
        }
    }
    private getParameters(parameters: any): string {
        var ret = "";
        if (parameters && this.ContentType == "application/json; charset=utf-8") {
            ret = JSON.stringify(parameters);
            ret = ret.replace(/\\\"__type\\\"\:\\\"[\w+\.?]+\\\"\,/g, "");
            ret = ret.replace(/\"__type\"\:\"[\w+\.?]+\"\,/g, "");
            ret = ret.replace(/<script/ig, "");
            ret = ret.replace(/script>/ig, "");
        }
        return ret;
    }

    GetRequestData(): any {
        var ret = null;
        if (this.isRequestReady() && (this.XMLHttpRequest.status == 200 || this.XMLHttpRequest.status == 204) &&
            !Is.NullOrEmpty(this.XMLHttpRequest.responseText)) {
            ret = this.XMLHttpRequest.responseText;
            try {
                ret = JSON.parse(ret);
                if (ret.d) {
                    ret = ret.d;
                }
                this.convertProperties(ret);
            }
            catch (e) {
                ret = null;
                window.Exception(e);
            }
        }
        return ret;
    }
    private convertProperties(object) {
        var keyMap: Array<any>;
        if (Is.Array(object)) {
            for (var i = 0; i < object.length; i++) {
                var obj = object[i];
                if (obj) {
                    try {
                        keyMap = keyMap ? keyMap : this.getKeyMap(obj);
                    } catch (e) {
                        window.Exception(e);
                    }
                    this.setValues(obj, keyMap);
                }
                for (var prop in obj) {
                    this.convertProperties(obj[prop]);
                }
            }
        }
        else if (object && typeof object === 'object') {
            var keyMap = this.getKeyMap(object);
            this.setValues(object, keyMap);
            for (var prop in object) {
                this.convertProperties(object[prop]);
            }
        }
    }
    private getKeyMap(obj): Array<any> {
        var keyMap = new Array();
        for (var prop in obj) {
            var val = obj[prop];
            if (val && typeof val === 'string') {
                val = val.Trim();
                if (val.indexOf("/Date(") == 0 || val.indexOf("Date(") == 0) {
                    keyMap.push({ Key: prop, Type: "Date" });
                }
                else if (val.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/i)) {
                    keyMap.push({ Key: prop, Type: "UTCDate" });
                }
                else if (val.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g)) {
                    keyMap.push({ Key: prop, Type: "ZDate" });
                }
            }
        }
        return keyMap;
    }
    private setValues(obj, keyMap: Array<any>) {
        for (var j = 0; j < keyMap.length; j++) {
            var key = keyMap[j].Key;
            var type = keyMap[j].Type;
            var val = obj[key];
            switch (type) {
                case "Date":
                    if (val) {
                        val = parseInt(val.substring(6).replace(")/", ""));                        
                        if (val > -62135575200000) {
                            val = new Date(val);
                            obj[key] = val;
                        }
                        else {
                            delete obj[key];
                        }
                    }
                    else {
                        obj[key] = new Date();
                    }
                    break;
                case "UTCDate":
                case "ZDate":
                    var tempDate = new Date(val);
                    if (this.UseAsDateUTC) {
                        tempDate = new Date(tempDate.getUTCFullYear(), tempDate.getUTCMonth(), tempDate.getUTCDate());
                    }
                    else if (window["chrome"]) {
                        var offset = new Date().getTimezoneOffset();
                        tempDate = tempDate.Add(0, 0, 0, 0, offset);
                    }
                    obj[key] = tempDate;
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

