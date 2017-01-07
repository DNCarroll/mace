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
        var it = ignoreTheseNames(), w = window;
        for (var o in w) {
            var n = GetFuncName(GetStringOf(w[o]), it);
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
    function GetFuncName(rawFunction, ignoreThese) {
        if (ignoreThese === void 0) { ignoreThese = new Array(); }
        var rf = rawFunction;
        if (!Is.NullOrEmpty(rf)) {
            var p = "^function\\s(\\w+)\\(\\)", m = rf.match(p);
            if (m && !ignoreThese.First(function (i) { return i === m[1]; })) {
                return m[1];
            }
        }
        return null;
    }
    Initializer.GetFuncName = GetFuncName;
    function GetStringOf(o) {
        return o && o.toString ? o.toString() : null;
    }
    Initializer.GetStringOf = GetStringOf;
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
Initializer.WindowLoad();
//# sourceMappingURL=Initializer.js.map