var ViewContainers: Array<IViewContainer> = new Array<IViewContainer>();
abstract class ViewContainer implements IViewContainer {
    static VirtualPath: string;
    constructor() {
        var n = Reflection.GetName(this.constructor);
        this.Name = n.replace("ViewContainer", "");
        this.Name = this.Name.replace("Container", "");
        ViewContainers.push(this);
    }
    UrlPattern: () => string = null;
    UrlReplacePattern: () => string = null;
    ContainerLoaded: () => void = null;
    public Name: string;
    Views: Array<IView> = new Array<IView>();
    IsDefault: boolean = false;
    NumberViewsShown: number;
    Show(route: ViewInstance) {
        var rp = route.Parameters, t = this;
        if (rp && rp.length === 1 && t.IsDefault) {
            route.Parameters = new Array();
        }
        t.NumberViewsShown = 0;
        ProgressManager.Show();
        t.Views.forEach(s => {
            s.AddListener(EventType.Completed, t.ViewLoadCompleted.bind(t));
            s.Show(route)
        });
    }
    IsUrlPatternMatch(url: string) {
        if (!Is.NullOrEmpty(url)) {
            url = url.lastIndexOf("/") === url.length - 1 ? url.substring(0, url.length - 1) : url;
            var p = this.UrlPattern ? this.UrlPattern() : "^" + this.Name;
            if (p) {
                var regex = new RegExp(p, 'i');
                return url.match(regex) ? true : false;
            }
        }
        return false;
    }
    ViewLoadCompleted(a: ICustomEventArg<IView>) {
        var t = this, nvs = t.NumberViewsShown
        if (a.EventType === EventType.Completed) {
            t.NumberViewsShown = t.NumberViewsShown + 1;
        }
        if (t.NumberViewsShown === t.Views.length) {
            ProgressManager.Hide();
            window.scrollTo(0, 0);
            if (Is.Alive(t.ContainerLoaded)) {
                t.ContainerLoaded();
            }
            t.Views.forEach(v => {
                t.LoadSubViews(v.ContainerID());
            });
        }
    }
    LoadSubViews(eleId: string) {
        var subviews = eleId.Element().Get(e => Is.Alive(e.dataset.subview));
        subviews.forEach(s => {
            s.dataset.subview.Get((arg) => {
                var r = arg.Sender.ResponseText;
                s.innerHTML = r;
                var ele = s.Get(ele => !Is.NullOrEmpty(ele.getAttribute("data-binder")));
                if (ele.length > 0) {
                    ele.forEach(e => {
                        try {
                            let a = e.getAttribute("data-binder");
                            if (a) {
                                let fun = new Function("return new " + a + (a.indexOf("(") > - 1 ? "" : "()"));
                                e.Binder = <Binder>fun();
                                e.Binder.Element = e;
                            }
                        }
                        catch (e) {
                            window.Exception(e);
                        }
                    });
                    ele.forEach(e => {
                        if (e.Binder && e.Binder.AutomaticSelect) {
                            try {
                                e.Binder.Refresh();
                            }
                            catch (ex) {
                                window.Exception(ex);
                            }
                        }
                    });
                }
            });
        });
    }
    Url(viewInstance: ViewInstance): string {
        var t = this, vi = viewInstance, rp = viewInstance.Parameters, vp = ViewContainer.VirtualPath;
        var newUrl = "";
        if (vi.Route) {
            newUrl = vi.Route;
        }
        else if (Is.Alive(t.UrlReplacePattern)) {
            var up = t.UrlReplacePattern().split("/"), pi = 0, nu = new Array<string>();
            for (var i = 0; i < up.length; i++) {
                let p = up[i];
                if (p.indexOf("(?:") === 0) {
                    if (!rp) { break; }
                    if (pi < rp.length) {
                        nu.Add(rp[pi]);
                    }
                    else {
                        break;
                    }
                    pi++;
                }
                else {
                    nu.Add(up[i]);
                }
            }
            for (var k = 0; k < nu.length; k++) {
                nu[k] = encodeURIComponent(nu[k]);
            }
            newUrl = nu.join("/");
        }
        if (Is.NullOrEmpty(newUrl)) {
            var ecrp = new Array<string>();
            if (rp) {
                for (var j = 0; j < rp.length; j++) {
                    ecrp.Add(encodeURIComponent(rp[j]));
                }
            }
            newUrl = t.Name + (ecrp.length > 0 ? "/" + ecrp.join("/") : "");
        }
        return (!Is.NullOrEmpty(vp) && newUrl.indexOf(vp) === -1 ? vp + "/" : "") + newUrl;
    }

    UrlTitle() {
        return this.Name.replace(/\//g, " ");
    }
    DocumentTitle(route: ViewInstance): string {
        return this.UrlTitle();
    }
    Parameters(url: string) {
        var u = url;
        u = u ? u.replace(this.Name, '') : u;
        u = u ? u.indexOf('/') === 0 ? u.substring(1) : u : u;
        return u ? u.split('/') : new Array<string>();
    }
}
class SingleViewContainer extends ViewContainer {
    constructor(cacheStrategy: CacheStrategy = CacheStrategy.View, containerId: string = "content", isDefault: boolean = false) {
        super();
        var t = this;
        t.IsDefault = isDefault;
        t.Views.push(new View(cacheStrategy, containerId, "/Views/" + t.Name + ".html"));
    }
} 