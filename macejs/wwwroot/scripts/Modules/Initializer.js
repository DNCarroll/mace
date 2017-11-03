var Initializer;
(function (Initializer) {
    function Execute(e) {
        var w = window;
        if (document.readyState === "complete") {
            windowLoaded();
            Initializer.WindowLoaded ? Initializer.WindowLoaded(e) : null;
        }
        else {
            w.onload = function () {
                windowLoaded();
                Initializer.WindowLoaded ? Initializer.WindowLoaded(e) : null;
            };
        }
    }
    Initializer.Execute = Execute;
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
Initializer.Execute();
//# sourceMappingURL=Initializer.js.map