//not done
//should we be removing stuff from the history when we do this?
//if we make this a class i can hide stuff that should be acted on
var HistoryContainer;
(function (HistoryContainer) {
    var History = (function () {
        function History() {
            this.ViewInstances = new Array();
        }
        History.prototype.CurrentRoute = function () {
            if (this.ViewInstances != null && this.ViewInstances.length > 0) {
                return this.ViewInstances[this.ViewInstances.length - 1];
            }
            return null;
        };
        History.prototype.BackEvent = function (e) {
            HistoryManager.Back();
        };
        History.prototype.Add = function (viewInstance) {
            this.ViewInstances.Add(viewInstance);
            this.ManageRouteInfo(viewInstance);
        };
        History.prototype.Back = function () {
            if (this.ViewInstances.length > 1) {
                this.ViewInstances.splice(this.ViewInstances.length - 1, 1);
            }
            if (this.ViewInstances.length > 0) {
                var viewInfo = this.ViewInstances[this.ViewInstances.length - 1];
                var found = viewInfo.ViewContainer;
                found.Show(viewInfo);
                this.ManageRouteInfo(viewInfo);
            }
            else {
            }
        };
        History.prototype.ManageRouteInfo = function (viewInstance) {
            var title = viewInstance.ViewContainer.UrlTitle(viewInstance);
            var documentTitle = viewInstance.ViewContainer.DocumentTitle(viewInstance);
            var url = viewInstance.ViewContainer.Url(viewInstance);
            if (url && !Is.NullOrEmpty(title)) {
                if (history && history.pushState) {
                    url = this.FormatUrl(!Is.NullOrEmpty(url) ? url.indexOf("/") != 0 ? "/" + url : url : "/");
                    history.pushState(null, title, url);
                }
            }
            if (documentTitle) {
                document.title = documentTitle;
            }
        };
        History.prototype.FormatUrl = function (url) {
            url = url.replace(/[^A-z0-9/]/g, "");
            return url;
        };
        return History;
    }());
    HistoryContainer.History = History;
})(HistoryContainer || (HistoryContainer = {}));
var HistoryManager = new HistoryContainer.History();
//# sourceMappingURL=HistoryManager.js.map