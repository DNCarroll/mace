var HistoryContainer;
(function (HistoryContainer) {
    var History = (function () {
        function History() {
            this.ViewInstances = new Array();
            this.eHandlrs = new Array();
        }
        History.prototype.CurrentViewInstance = function () {
            var vi = this.ViewInstances;
            return vi != null && vi.length > 0 ? vi[vi.length - 1] : null;
        };
        History.prototype.BackEvent = function (e) {
            HistoryManager.Back();
        };
        History.prototype.Add = function (viewInstance) {
            var vi = viewInstance, t = this;
            t.ViewInstances.Add(vi);
            t.ManageRouteInfo(vi);
            t.Dispatch(EventType.Completed);
        };
        History.prototype.Back = function () {
            var t = this, vi = t.ViewInstances;
            if (vi.length > 1) {
                vi.splice(vi.length - 1, 1);
            }
            if (vi.length > 0) {
                var i = vi[vi.length - 1], f = i.ViewContainer;
                f.Show(i);
                t.ManageRouteInfo(i);
                t.Dispatch(EventType.Completed);
            }
            else {
                //do nothing?
            }
        };
        History.prototype.ManageRouteInfo = function (viewInstance) {
            var vi = viewInstance, vc = vi.ViewContainer, t = vc.UrlTitle(vi), dt = vc.DocumentTitle(vi), h = history, u = vc.Url(vi);
            if (u !== null && !Is.NullOrEmpty(t) && h && h.pushState) {
                u = this.FormatUrl(!Is.NullOrEmpty(u) ? u.indexOf("/") != 0 ? "/" + u : u : "/");
                h.pushState(null, t, u);
            }
            if (dt) {
                document.title = dt;
            }
        };
        History.prototype.Manual = function (title, url, documentTitle) {
            if (documentTitle === void 0) { documentTitle = null; }
            document.title = documentTitle ? documentTitle : title;
            history.pushState(null, title, url);
        };
        History.prototype.FormatUrl = function (url) {
            url = url.replace(/[^A-z0-9_/]/g, "");
            return url;
        };
        History.prototype.AddListener = function (eventType, eventHandler) {
            var t = this, f = t.eHandlrs.First(function (h) { return h.EventType === eventType && h.EventHandler === eventHandler; });
            if (!f) {
                t.eHandlrs.Add(new Listener(eventType, eventHandler));
            }
        };
        History.prototype.RemoveListener = function (eventType, eventHandler) {
            this.eHandlrs.Remove(function (l) { return l.EventType === eventType && eventHandler === eventHandler; });
        };
        History.prototype.RemoveListeners = function (eventType) {
            this.eHandlrs.Remove(function (l) { return l.EventType === eventType; });
        };
        History.prototype.Dispatch = function (eventType) {
            var _this = this;
            var l = this.eHandlrs.Where(function (e) { return e.EventType === eventType; });
            l.forEach(function (l) { return l.EventHandler(new CustomEventArg(_this.CurrentViewInstance().ViewContainer, eventType)); });
        };
        return History;
    }());
    HistoryContainer.History = History;
})(HistoryContainer || (HistoryContainer = {}));
var HistoryManager = new HistoryContainer.History();
//# sourceMappingURL=HistoryManager.js.map