//a promise type too?
var Ajax = (function () {
    function Ajax() {
        this.DisableElement = null;
        this.ManipulateProgressElement = false;
        this.UseAsDateUTC = true;
        this.ContentType = "application/json; charset=utf-8";
        this.eventHandlers = new Array();
    }
    Object.defineProperty(Ajax.prototype, "ResponseText", {
        get: function () {
            return this.XMLHttpRequest.responseText;
        },
        enumerable: true,
        configurable: true
    });
    Ajax.prototype.Submit = function (method, url, parameters) {
        if (parameters === void 0) { parameters = null; }
        this.showProgress();
        url = this.getUrl(url);
        this.XMLHttpRequest = new XMLHttpRequest();
        var ajax = this;
        var xhttpr = this.XMLHttpRequest;
        xhttpr.addEventListener("readystatechange", ajax.onReaderStateChange.bind(ajax), false);
        xhttpr.open(method, url, true);
        xhttpr.setRequestHeader("content-type", navigator && /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent) ? "application/json;q=0.9" : this.ContentType);
        this.setCustomHeader();
        try {
            var newParameters = this.getParameters(parameters);
            xhttpr.send(newParameters);
        }
        catch (e) {
            this.HideProgress();
            window.Exception(e);
        }
    };
    Ajax.prototype.onReaderStateChange = function (e) {
        if (this.isRequestReady()) {
            this.HideProgress();
            this.Dispatch(EventType.Completed);
        }
    };
    Ajax.prototype.showProgress = function () {
        this.showHideProgress(true);
    };
    Ajax.prototype.getUrl = function (url) {
        if (url.indexOf("http") == -1 && !Is.NullOrEmpty(Ajax.Host)) {
            url = Ajax.Host + (url.indexOf("/") == 0 ? url : "/" + url);
        }
        return url;
    };
    Ajax.prototype.isRequestReady = function () {
        return this.XMLHttpRequest && this.XMLHttpRequest.readyState == 4;
    };
    Ajax.prototype.HideProgress = function () {
        this.showHideProgress(false);
    };
    Ajax.prototype.showHideProgress = function (show) {
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
    };
    Ajax.prototype.setCustomHeader = function () {
        if (this.Header) {
            var header = this.Header();
            if (header) {
                for (var prop in header) {
                    this.XMLHttpRequest.setRequestHeader(prop, header[prop]);
                }
            }
        }
    };
    Ajax.prototype.getParameters = function (parameters) {
        var ret = "";
        if (parameters && this.ContentType == "application/json; charset=utf-8") {
            ret = JSON.stringify(parameters);
            ret = ret.replace(/\\\"__type\\\"\:\\\"[\w+\.?]+\\\"\,/g, "");
            ret = ret.replace(/\"__type\"\:\"[\w+\.?]+\"\,/g, "");
            ret = ret.replace(/<script/ig, "");
            ret = ret.replace(/script>/ig, "");
        }
        return ret;
    };
    Ajax.prototype.GetRequestData = function () {
        var ret = null;
        var x = this.XMLHttpRequest;
        if (this.isRequestReady() && (x.status == 200 || x.status == 204) &&
            !Is.NullOrEmpty(x.responseText)) {
            ret = x.responseText;
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
    };
    Ajax.prototype.convertProperties = function (object) {
        var keyMap;
        if (Is.Array(object)) {
            for (var i = 0; i < object.length; i++) {
                var obj = object[i];
                if (obj) {
                    try {
                        keyMap = keyMap ? keyMap : this.getKeyMap(obj);
                    }
                    catch (e) {
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
    };
    Ajax.prototype.getKeyMap = function (obj) {
        var keyMap = new Array();
        for (var prop in obj) {
            var val = obj[prop];
            if (val && Is.String(val)) {
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
    };
    Ajax.prototype.setValues = function (obj, keyMap) {
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
    };
    Ajax.prototype.Get = function (url, parameters) {
        if (parameters === void 0) { parameters = null; }
        this.Submit("GET", url, parameters);
    };
    Ajax.prototype.Put = function (url, parameters) {
        if (parameters === void 0) { parameters = null; }
        this.Submit("PUT", url, parameters);
    };
    Ajax.prototype.AddListener = function (eventType, eventHandler) {
        this.eventHandlers.Add(new Listener(eventType, eventHandler));
    };
    Ajax.prototype.RemoveListener = function (eventType, eventHandler) {
        this.eventHandlers.Remove(function (l) { return l.EventType === eventType && eventHandler === eventHandler; });
    };
    Ajax.prototype.RemoveListeners = function (eventType) {
        this.eventHandlers.Remove(function (l) { return l.EventType === eventType; });
    };
    Ajax.prototype.Dispatch = function (eventType) {
        var _this = this;
        var listeners = this.eventHandlers.Where(function (e) { return e.EventType === eventType; });
        listeners.forEach(function (l) { return l.EventHandler(new CustomEventArg(_this, eventType)); });
    };
    return Ajax;
}());
//# sourceMappingURL=Ajax.js.map