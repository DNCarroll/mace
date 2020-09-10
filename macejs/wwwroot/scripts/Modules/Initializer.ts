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
        var WL = WindowLoaded, wL = windowLoaded;
        if (WL) {
            if (WL.ShouldRunBeforeNavigation) {
                WL.LoadedEvent(e, wL);
            }
            else {
                wL();
                WL.LoadedEvent(e, null);
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
        if (Is.Alive(pg)) {
            ProgressManager.ProgressElement = pg;
        }
    }
}
module Reflection {
    export function GetName(o: any, ignoreThese: Array<string> = new Array<string>()) {
        var r = <string>(o && o.toString ? o.toString() : "");
        if (!Is.NullOrEmpty(r)) {
            if (r.indexOf("function ") > -1 || r.indexOf("class ") > -1) {
                var mark = r.indexOf("function") === 0 ? "()" : " ";
                r = r.replace("function ", "");
                r = r.replace("class ", "");
                var si = r.indexOf(mark);
                return r.substring(0, si);
            }
        }
        return null;
    }
    export function NewObject(type: { new() }) {
        return new type();

    }
}
Initializer.Execute();