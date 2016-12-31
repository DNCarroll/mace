module Initializer {
    export function WindowLoad(e?) {
        var w = window;
        if (document.readyState === "complete") {
            windowLoaded();
        }
        else {
            if (w.onload) {
                var curronload = w.onload;
                var newonload = function () {
                    curronload(<Event>e);
                    windowLoaded();
                };
                w.onload = newonload;
            } else {
                w.onload = function () {
                    windowLoaded();
                }
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
        var it = ignoreTheseNames();
        for (var obj in window) {
            var name = getNameToTest(getStringOf(window[obj]), it);
            if (!Is.NullOrEmpty(name)) {
                try {
                    var newObj = (new Function("return new " + name + "();"))();                    
                    if (Has.Properties(newObj, "IsDefault", "Views", "Show", 
                        "Url", "UrlPattern", "UrlTitle", "IsUrlPatternMatch")) {
                        ViewContainers.Add(<IViewContainer>newObj);
                    }
                }
                catch (e) {
                    window.Exception(e);
                }
            }
        }
    }
    function getNameToTest(rawFunction: string, ignoreThese:Array<string>) {
        if (!Is.NullOrEmpty(rawFunction)) {            
            var p = "^function\\s(\\w+)\\(\\)",
                m = rawFunction.match(p);
            if (m && !ignoreThese.First(i => i === m[1])) {
                return m[1];
            }
        }
        return null;
    }
    function getStringOf(obj: any): string {
        return obj && obj.toString ? obj.toString() : null;
    }
    function setProgressElement() {
        var pg = document.getElementById("progress");
        if (pg != null && Ajax) {
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
