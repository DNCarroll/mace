module HistoryContainer {
    export class History {
        private ViewInstances = new Array<ViewInstance>();
        CurrentRoute(): ViewInstance {
            var vi = this.ViewInstances;
            if (vi != null && vi.length > 0) {
                return vi[vi.length - 1];
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
            var vi = this.ViewInstances;
            if (vi.length > 1) {
                vi.splice(vi.length - 1, 1);
            }
            if (vi.length > 0) {
                var i = vi[vi.length - 1],
                    f = i.ViewContainer;
                f.Show(i);
                this.ManageRouteInfo(i);
            }
            else {
                //do nothing?
            }
        }
        ManageRouteInfo(viewInstance: ViewInstance) {
            var t = viewInstance.ViewContainer.UrlTitle(viewInstance),
                dt = viewInstance.ViewContainer.DocumentTitle(viewInstance),
                u = viewInstance.ViewContainer.Url(viewInstance);
            if (u && !Is.NullOrEmpty(t) && history && history.pushState) {
                u = this.FormatUrl(!Is.NullOrEmpty(u) ? u.indexOf("/") != 0 ? "/" + u : u : "/");
                history.pushState(null, t, u);
            }
            if (dt) {
                document.title = dt;
            }
        }
        FormatUrl(url: string) {
            url = url.replace(/[^A-z0-9/]/g, "");
            return url;
        }
    }
}
var HistoryManager = new HistoryContainer.History();
