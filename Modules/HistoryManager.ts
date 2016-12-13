//not done
//should we be removing stuff from the history when we do this?
//if we make this a class i can hide stuff that should be acted on

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
        ManageRouteInfo(viewInstance: ViewInstance) {
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
        }
        FormatUrl(url: string) {
            url = url.replace(/[^A-z0-9/]/g, "");
            return url;
        }
    }
}
var HistoryManager = new HistoryContainer.History();
