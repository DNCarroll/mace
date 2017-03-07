module HistoryContainer {
    export class History {
        private ViewInstances = new Array<ViewInstance>();
        CurrentViewInstance(): ViewInstance {
            var vi = this.ViewInstances;
            return vi != null && vi.length > 0 ? vi[vi.length - 1] : null;
        }
        BackEvent(e) {
            HistoryManager.Back();
        }
        Add(viewInstance: ViewInstance) {
            var vi = viewInstance,
                t = this;
            t.ViewInstances.Add(vi);
            t.ManageRouteInfo(vi);
        }
        Back() {
            var t = this,
                vi = t.ViewInstances;
            if (vi.length > 1) {
                vi.splice(vi.length - 1, 1);
            }
            if (vi.length > 0) {
                var i = vi[vi.length - 1],
                    f = i.ViewContainer;
                f.Show(i);
                t.ManageRouteInfo(i);
            }
            else {
                //do nothing?
            }
        }
        ManageRouteInfo(viewInstance: ViewInstance) {
            var vi = viewInstance,
                vc = vi.ViewContainer,
                t = vc.UrlTitle(vi),
                dt = vc.DocumentTitle(vi),
                h = history,
                u = vc.Url(vi);
            if (u && !Is.NullOrEmpty(t) && h && h.pushState) {
                u = this.FormatUrl(!Is.NullOrEmpty(u) ? u.indexOf("/") != 0 ? "/" + u : u : "/");
                h.pushState(null, t, u);
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
