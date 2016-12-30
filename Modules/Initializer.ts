module Initializer {
    export function WindowLoad(e?) {
        if (document.readyState === "complete") {
            windowLoaded();
        }
        else {
            if (window.onload) {
                var curronload = window.onload;
                var newonload = function () {
                    curronload(<Event>e);
                    windowLoaded();
                };
                window.onload = newonload;
            } else {
                window.onload = function () {
                    windowLoaded();
                }
            }
        }
    }
    function windowLoaded() {
        addViewContainers();
        setProgressElement();
        window.ShowByUrl(window.location.pathname.substring(1));
        window.addEventListener("popstate", HistoryManager.BackEvent);        
    }
    function addViewContainers() {
        var ignoreThese = ignoreThese();
        for (var obj in window) {
            var name = getNameToTest(getStringOf(window[obj]), ignoreThese);
            if (!Is.NullOrEmpty(name)) {
                try {
                    var newObj = (new Function("return new " + name + "();"))();
                    if (Has.Properties(newObj, "IsDefault", "Views", "Show", "Url",
                        "UrlPattern", "UrlTitle", "IsUrlPatternMatch")
                    ) {
                        ViewContainers.Add(<IViewContainer>newObj);
                    }
                }
                catch (e) {
                    window.Exception(e);
                }
            }
        }
    }
    function getNameToTest(rawFun: string, ignoreThese:Array<string>) {
        if (!Is.NullOrEmpty(rawFun)) {            
            var pattern = "^function\\s(\\w+)\\(\\)";
            var match = rawFun.match(pattern);
            if (match && !ignoreThese.First(i => i === match[1])) {
                return match[1];
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
    function ignoreThese(): Array<string> {
        return ["Ajax", "ViewContainer", "View", "ViewInstance", "Listener", "PropertyListener", "ObjectState",
            "HistoryManager", "Is", "Initializer", "Binder", "DataObject", "EventType", "CustomEventArg"];
    }
}
Initializer.WindowLoad();
