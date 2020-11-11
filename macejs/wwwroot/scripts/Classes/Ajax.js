var Ajax = /** @class */ (function () {
    function Ajax(withProgress, disableElement) {
        if (withProgress === void 0) { withProgress = false; }
        if (disableElement === void 0) { disableElement = null; }
        this.DisableElement = null;
        this.WithProgress = false;
        this.UseAsDateUTC = false;
        this.ContentType = "application/json; charset=utf-8";
        this.eventHandlers = new Array();
        this.WithProgress = withProgress;
        this.DisableElement = disableElement;
    }
    Object.defineProperty(Ajax.prototype, "ResponseText", {
        get: function () {
            return this.XHttp.responseText;
        },
        enumerable: false,
        configurable: true
    });
    Ajax.prototype.Submit = function (method, url, parameters, asRaw) {
        if (parameters === void 0) { parameters = null; }
        if (asRaw === void 0) { asRaw = false; }
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
        }
        catch (e) {
            t.Progress(false);
            window.Exception(e);
        }
    };
    Ajax.prototype.xStateChanged = function (e) {
        var t = this, x = t.XHttp, s = x.status;
        if (t.isRequestReady()) {
            t.Progress(false);
            t.Dispatch(s === 200 || s === 204 || s === 201 ? EventType.Completed : EventType.Any);
        }
    };
    Ajax.prototype.getUrl = function (url) {
        var u = url, a = Ajax.Host;
        if (u.indexOf("http") === -1 && a) {
            u = a + (u.indexOf("/") === 0 ? u : "/" + u);
        }
        return u;
    };
    Ajax.prototype.isRequestReady = function () {
        var x = this.XHttp;
        return x && x.readyState === 4;
    };
    Ajax.prototype.Progress = function (show) {
        if (show === void 0) { show = true; }
        if (this.WithProgress) {
            var pm = ProgressManager;
            show ? pm.Show() : pm.Hide();
            var de = this.DisableElement, d = "disabled", f = function (e) {
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
    };
    Ajax.prototype.setHead = function () {
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
            var gh = Ajax.GlobalHeader();
            if (gh) {
                for (var p2 in gh) {
                    x.setRequestHeader(p2, gh[p2]);
                }
            }
        }
    };
    Ajax.prototype.getParameters = function (parameters) {
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
    };
    Ajax.prototype.GetRequestData = function () {
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
    };
    Ajax.prototype.Array = function (type) {
        var ret = new Array();
        var r = this.GetRequestData();
        if (Is.Alive(r) && r.length) {
            for (var i = 0; i < r.length; i++) {
                ret.Add(new type(r[i]));
            }
        }
        return ret;
    };
    Ajax.prototype.FirstOrDefault = function (type) {
        var r = this.GetRequestData();
        if (Is.Alive(r)) {
            return new type(r);
        }
        return null;
    };
    Ajax.prototype.convertProperties = function (obj) {
        var km, t = this;
        if (Is.Array(obj)) {
            for (var i = 0; i < obj.length; i++) {
                var o = obj[i];
                if (o) {
                    try {
                        km = km ? km : t.getKeyMap(o);
                    }
                    catch (e) {
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
    };
    Ajax.prototype.getKeyMap = function (obj) {
        var km = new Array();
        for (var p in obj) {
            var v = obj[p];
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
    };
    Ajax.prototype.setValues = function (obj, keyMap) {
        for (var j = 0; j < keyMap.length; j++) {
            var k = keyMap[j].Key, t = keyMap[j].Type, v = obj[k];
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
                    var t_1 = new Date(v);
                    if (this.UseAsDateUTC) {
                        t_1 = new Date(t_1.getUTCFullYear(), t_1.getUTCMonth(), t_1.getUTCDate());
                    }
                    else if (window["chrome"]) {
                        var os = new Date().getTimezoneOffset();
                        t_1 = t_1.Add(0, 0, 0, 0, os);
                    }
                    obj[k] = t_1;
                    break;
                default:
                    break;
            }
        }
    };
    Ajax.prototype.Get = function (url, prmtrs) {
        if (prmtrs === void 0) { prmtrs = null; }
        this.Submit("GET", url, prmtrs);
    };
    Ajax.prototype.Put = function (url, prmtrs) {
        if (prmtrs === void 0) { prmtrs = null; }
        this.Submit("PUT", url, prmtrs);
    };
    Ajax.prototype.Post = function (url, prmtrs) {
        if (prmtrs === void 0) { prmtrs = null; }
        this.Submit("POST", url, prmtrs);
    };
    Ajax.prototype.Delete = function (url, prmtrs) {
        if (prmtrs === void 0) { prmtrs = null; }
        this.Submit("DELETE", url, prmtrs);
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
        var l = this.eventHandlers.Where(function (e) { return e.EventType === eventType || e.EventType === EventType.Any; });
        l.forEach(function (l) { return l.EventHandler(new CustomEventArg(_this, eventType)); });
    };
    Ajax.RemoveScript = true;
    return Ajax;
}());
//# sourceMappingURL=Ajax.js.map