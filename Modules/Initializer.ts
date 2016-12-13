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
        var ignoreThese = ignoreTheseNames();
        for (var obj in window) {
            var name = getNameToTest(getStringOf(window[obj]), ignoreThese);
            if (!Is.NullOrEmpty(name)) {
                try {
                    var newObj = (new Function("return new " + name + "();"))();                    
                    if (Is.Property("IsDefault", newObj) &&
                        Is.Property("Views", newObj) &&
                        Is.Property("Show", newObj) &&
                        Is.Property("Url", newObj) &&
                        Is.Property("UrlPattern", newObj) &&
                        Is.Property("UrlTitle", newObj) &&
                        Is.Property("IsUrlPatternMatch", newObj)) {
                        ViewContainers.Add(<IViewContainer>newObj);
                    }
                }
                catch (e) {
                }
            }
        }
    }
    function getNameToTest(rawFunction: string, ignoreThese:Array<string>) {
        if (!Is.NullOrEmpty(rawFunction)) {            
            var pattern = "^function\\s(\\w+)\\(\\)";
            var match = rawFunction.match(pattern);
            if (match && ignoreThese.First(i => i === match[1]) === null) {
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
    function ignoreTheseNames(): Array<string> {
        return ["Ajax", "ViewContainer", "View", "ViewInstance", "Formatters",
            "HistoryManager", "Is", "RegularExpression", "Initializer", "ViewContainers",
            "ActionEvent", "DataBinding", "ActionType", "AutoSuggest", "Binding",
            "KeyPress", "Thing", "What"];
    }
}
Initializer.WindowLoad();
