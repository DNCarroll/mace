module Initializer {
    export function WindowLoad(e?) {
        var w = window;
        if (document.readyState === "complete") {
            windowLoaded();
        }
        else {
            if (w.onload) {
                var c = w.onload,
                    nl = function () {
                    c(<Event>e);
                    windowLoaded();
                };
                w.onload = nl;
            } else {
                w.onload = function () {
                    windowLoaded();
                };
            }
        }
    }
    function windowLoaded() {
        var w = window;
        addViewContainers();
        setProgressElement();
        w.ShowByUrl(w.location.pathname.substring(1));
        w.addEventListener("popstate", HistoryManager.BackEvent);        
    }
    function addViewContainers() {
        var it = ignoreTheseNames(),
            w = window;
        for (var o in w) {
            let n = getNameToTest(getStringOf(w[o]), it);
            if (!Is.NullOrEmpty(n)) {
                try {
                    var no = (new Function("return new " + n + "();"))();                    
                    if (Has.Properties(no, "IsDefault", "Views", "Show", 
                        "Url", "UrlPattern", "UrlTitle", "IsUrlPatternMatch")) {
                        ViewContainers.Add(<IViewContainer>no);
                    }
                }
                catch (e) {
                    w.Exception(e);
                }
            }
        }
    }
    function getNameToTest(rawFunction: string, ignoreThese: Array<string>) {
        var rf = rawFunction;
        if (!Is.NullOrEmpty(rf)) {            
            var p = "^function\\s(\\w+)\\(\\)",
                m = rf.match(p);
            if (m && !ignoreThese.First(i => i === m[1])) {
                return m[1];
            }
        }
        return null;
    }
    function getStringOf(o: any): string {
        return o && o.toString ? o.toString() : null;
    }
    function setProgressElement() {
        var pg = document.getElementById("progress");
        if (pg != null) {
            ProgressManager.ProgressElement = pg;
        }
    }
    function ignoreTheseNames(): Array<string> {
        return ["Ajax", "Binder", "DataObject", "View", "ViewContainer", "ViewContainers", 
            "ViewInstance", "EventType", "CustomEventArg", "Listener", "PropertyListener", 
            "ObjectState", "HistoryManager", "Initializer", "Is", "ProgressManager"];
    }
}
Initializer.WindowLoad();
