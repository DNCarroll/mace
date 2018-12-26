module HistoryContainer {
    export class History implements IEventDispatcher<ViewContainer> {
        private ViewInstances = new Array<ViewInstance>();
        CurrentViewInstance(): ViewInstance {
            var vi = this.ViewInstances;
            return Is.Alive(vi) && vi.length > 0 ? vi[vi.length - 1] : null;
        }
        BackEvent(e) {
            HistoryManager.Back();
        }
        Add(viewInstance: ViewInstance) {
            var vi = viewInstance,
                t = this;
            t.ViewInstances.Add(vi);
            t.ManageRouteInfo(vi);
            t.Dispatch(EventType.Completed);
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
                t.Dispatch(EventType.Completed);
            }
        }
        ManageRouteInfo(viewInstance: ViewInstance) {
            var vi = viewInstance,
                vc = vi.ViewContainer,
                t = vc.UrlTitle(vi),
                dt = vc.DocumentTitle(vi),
                h = history,
                u = vc.Url(vi);
            if (Is.Alive(u) && !Is.NullOrEmpty(t) && h && h.pushState) {
                u = !Is.NullOrEmpty(u) ? u.indexOf("/")!==0 ? "/" + u : u : "/";
                h.pushState(null, t, u);
            }
            if (dt) {
                document.title = dt;
            }
        }
        Manual(title: string, url: string, documentTitle: string = null) {
            document.title = documentTitle ? documentTitle : title;
            history.pushState(null, title, url);
        }
        //this method isnt used anymore but it maybe needed still
        //the "g" is absolutely wrong
        //FormatUrl(url: string) {
        //    url = url.replace(new RegExp("[^A-z0-9_/\\-]"), "g");
        //    return url;
        //}
        private eHandlrs = new Array<Listener<ViewContainer>>();
        AddListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<ViewContainer>) => void) {
            var t = this,
                f = t.eHandlrs.First(h => h.EventType === eventType && h.EventHandler === eventHandler);
            if (!f) {
                t.eHandlrs.Add(new Listener(eventType, eventHandler));
            }
        }
        RemoveListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<ViewContainer>) => void) {
            this.eHandlrs.Remove(l => l.EventType === eventType && eventHandler === eventHandler);
        }
        RemoveListeners(eventType: EventType) {
            this.eHandlrs.Remove(l => l.EventType === eventType);
        }
        Dispatch(eventType: EventType) {
            var l = this.eHandlrs.Where(e => e.EventType === eventType);
            l.forEach(l => l.EventHandler(new CustomEventArg<ViewContainer>(this.CurrentViewInstance().ViewContainer, eventType)));
        }
    }
}
var HistoryManager = new HistoryContainer.History(); 