class WindowLoaded {
    constructor(loadedEvent: (e, onCompleteCallback: () => void) => any, shouldRunBeforeNavigation: boolean) {
        this.LoadedEvent = loadedEvent;
        this.ShouldRunBeforeNavigation = shouldRunBeforeNavigation;
        Initializer.WindowLoaded = this;
    }
    LoadedEvent: (e, onCompleteCallback: () => void) => any;
    ShouldRunBeforeNavigation: boolean;
}
module Initializer {
    export var WindowLoaded: WindowLoaded;
    export function Execute(e?) {
        if (document.readyState === "complete") {
            loadedWrapper(e);
        }
        else {
            window.onload = function () {
                loadedWrapper(e);
            };
        }
    }
    function loadedWrapper(e?) {
        var WL = WindowLoaded, wL = windowLoaded, le = WL.LoadedEvent;
        if (WL) {
            if (WL.ShouldRunBeforeNavigation) {
                le(e, wL);
            }
            else {
                wL();
                le(e, null);
            }
        }
        else {
            wL();
        }
    }
    function windowLoaded() {
        var w = window;
        setProgressElement();
        Navigate.Url(w.location.pathname.substring(1));
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
    export function NewObject(type: { new() }) {
        return new type();
    }
}
Initializer.Execute();