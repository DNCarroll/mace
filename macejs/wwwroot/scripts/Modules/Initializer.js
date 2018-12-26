var WindowLoaded = /** @class */ (function () {
    function WindowLoaded(loadedEvent, shouldRunBeforeNavigation) {
        this.LoadedEvent = loadedEvent;
        this.ShouldRunBeforeNavigation = shouldRunBeforeNavigation;
        Initializer.WindowLoaded = this;
    }
    return WindowLoaded;
}());
var Initializer;
(function (Initializer) {
    function Execute(e) {
        if (document.readyState === "complete") {
            loadedWrapper(e);
        }
        else {
            window.onload = function () {
                loadedWrapper(e);
            };
        }
    }
    Initializer.Execute = Execute;
    function loadedWrapper(e) {
        var WL = Initializer.WindowLoaded, wL = windowLoaded;
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
})(Initializer || (Initializer = {}));
var Reflection;
(function (Reflection) {
    function GetName(o, ignoreThese) {
        if (ignoreThese === void 0) { ignoreThese = new Array(); }
        var r = (o && o.toString ? o.toString() : "");
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
    Reflection.GetName = GetName;
    function NewObject(type) {
        return new type();
    }
    Reflection.NewObject = NewObject;
})(Reflection || (Reflection = {}));
Initializer.Execute();
//# sourceMappingURL=Initializer.js.map