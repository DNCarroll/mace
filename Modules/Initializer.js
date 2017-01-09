var Initializer;
(function (Initializer) {
    function WindowLoad(e) {
        var w = window;
        if (document.readyState === "complete") {
            windowLoaded();
        }
        else {
            if (w.onload) {
                var c = w.onload, nl = function () {
                    c(e);
                    windowLoaded();
                };
                w.onload = nl;
            }
            else {
                w.onload = function () {
                    windowLoaded();
                };
            }
        }
    }
    Initializer.WindowLoad = WindowLoad;
    function windowLoaded() {
        var w = window;
        addViewContainers();
        setProgressElement();
        w.ShowByUrl(w.location.pathname.substring(1));
        w.addEventListener("popstate", HistoryManager.BackEvent);
    }
    function addViewContainers() {
        var it = ignoreTheseNames(), w = window, r = Reflection;
        for (var o in w) {
            var n = r.GetName(w[o], it);
            if (!Is.NullOrEmpty(n)) {
                try {
                    var no = (new Function("return new " + n + "();"))();
                    if (Has.Properties(no, "IsDefault", "Views", "Show", "Url", "UrlPattern", "UrlTitle", "IsUrlPatternMatch")) {
                        //dont know the cache strategy
                        no.Views.forEach(function (v) { return v.CacheStrategy != CacheStrategy.None ? v.Cache(v.CacheStrategy) : null; });
                        ViewContainers.Add(no);
                    }
                }
                catch (e) {
                    w.Exception(e);
                }
            }
        }
    }
    function setProgressElement() {
        var pg = document.getElementById("progress");
        if (pg != null) {
            ProgressManager.ProgressElement = pg;
        }
    }
    function ignoreTheseNames() {
        return ["Ajax", "Binder", "DataObject", "View", "ViewContainer", "ViewContainers",
            "ViewInstance", "EventType", "CustomEventArg", "Listener", "PropertyListener",
            "ObjectState", "HistoryManager", "Initializer", "Is", "ProgressManager"];
    }
})(Initializer || (Initializer = {}));
var Reflection;
(function (Reflection) {
    function GetName(o, ignoreThese) {
        if (ignoreThese === void 0) { ignoreThese = new Array(); }
        var r = o && o.toString ? o.toString() : null;
        if (!Is.NullOrEmpty(r)) {
            var p = "^function\\s(\\w+)\\(\\)", m = r.match(p);
            if (m && !ignoreThese.First(function (i) { return i === m[1]; })) {
                return m[1];
            }
        }
        return null;
    }
    Reflection.GetName = GetName;
    function NewObject(type) {
        return new type();
    }
    Reflection.NewObject = NewObject;
})(Reflection || (Reflection = {}));
Initializer.WindowLoad();
//# sourceMappingURL=Initializer.js.map