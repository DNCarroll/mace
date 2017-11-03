module Initializer {
    export var WindowLoaded: (e: any) => any;
    export function Execute(e?) {
        var w = window;
        if (document.readyState === "complete") {
            windowLoaded();
            WindowLoaded ? WindowLoaded(e) : null;
        }
        else {
            w.onload = function () {
                windowLoaded();
                WindowLoaded ? WindowLoaded(e) : null;
            };
        }
    }
    function windowLoaded() {
        var w = window;        
        setProgressElement();
        w.ShowByUrl(w.location.pathname.substring(1));
        w.addEventListener("popstate", HistoryManager.BackEvent);
    }
    function setProgressElement() {
        var pg = document.getElementById("progress");
        if (pg != null) {
            ProgressManager.ProgressElement = pg;
        }
    }
}
module Reflection {
    export function GetName(o: any, ignoreThese: Array<string> = new Array<string>()) {
        var r = o && o.toString ? o.toString() : null;
        if (!Is.NullOrEmpty(r)) {
            var p = "^function\\s(\\w+)\\(\\)",
                m = r.match(p);
            if (m && !ignoreThese.First(i => i === m[1])) {
                return m[1];
            }
        }
        return null;
    }
    export function NewObject(type: { new () }) {
        return new type();
    }
}
Initializer.Execute();
