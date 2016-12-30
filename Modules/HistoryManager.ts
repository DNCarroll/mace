module HistoryContainer {
    export class History {
        private ViewInstances = new Array<ViewInstance>();
        CurrentRoute(): ViewInstance {
            if (this.ViewInstances != null && this.ViewInstances.length > 0) {
                return this.ViewInstances[this.ViewInstances.length - 1];
            }
            return null;
        }
        BackEvent(e) {
            HistoryManager.Back();
        }
        Add(viewInstance: ViewInstance) {
            this.ViewInstances.Add(viewInstance);
            this.ManageRouteInfo(viewInstance);
        }
        Back() {
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
                //do nothing?
            }
        }
        ManageRouteInfo(inst: ViewInstance) {
            var title = inst.ViewContainer.UrlTitle(inst);
            var documentTitle = inst.ViewContainer.DocumentTitle(inst);
            var url = inst.ViewContainer.Url(inst);
            if (url && !Is.NullOrEmpty(title) && history && history.pushState) {
                url = this.FormatUrl(!Is.NullOrEmpty(url) ? url.indexOf("/") != 0 ? "/" + url : url : "/");
                history.pushState(null, title, url);
            }
            if (documentTitle) {
                document.title = documentTitle;
            }
        }
        FormatUrl(url: string) {
            url = url.replace(/[^A-z0-9/]/g, "");
            return url;
        }
    }
}
var HistoryManager = new HistoryContainer.History();
