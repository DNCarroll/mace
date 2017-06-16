var ViewContainers: Array<IViewContainer> = new Array<IViewContainer>();
abstract class ViewContainer implements IViewContainer {
    constructor() {
        var n = Reflection.GetName(this.constructor);
        this.UrlBase = n.replace("ViewContainer", "");
        this.UrlBase = this.UrlBase.replace("Container", "");
        ViewContainers.push(this);
    }
    UrlPattern: () => string = null;
    UrlBase: string;
    Views: Array<IView> = new Array<IView>();
    IsDefault: boolean = false;
    NumberViewsShown: number;
    Show(route: ViewInstance) {
        var rp = route.Parameters, t = this;
        if (rp && rp.length == 1 && t.IsDefault) {
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
            url = url.lastIndexOf("/") == url.length - 1 ? url.substring(0, url.length - 1) : url;
            var p = this.UrlPattern ? this.UrlPattern() : "^" + this.UrlBase;
            if (p) {
                var regex = new RegExp(p, 'i');
                return url.match(regex) ? true : false;
            }
        }
        return false;
    }
    ViewLoadCompleted(a: ICustomEventArg<IView>) {
        if (a.EventType === EventType.Completed) {
            this.NumberViewsShown = this.NumberViewsShown + 1;
        }
        if (this.NumberViewsShown === this.Views.length) {
            ProgressManager.Hide();
        }
    }
    Url(viewInstance: ViewInstance): string {
        var t = this, vi = viewInstance, rp = viewInstance.Parameters;
        if (vi.Route) {
            return vi.Route;
        }
        else if (t.UrlPattern != null) {
            var up = t.UrlPattern().split("/"), pi = 0, nu = new Array<string>();
            for (var i = 0; i < up.length; i++) {
                let p = up[i];
                if (p.indexOf("(?:") == 0) {
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
            return nu.join("/");            
        }
        return t.UrlBase + (rp && rp.length > 0 ? "/" + rp.join("/") : "");
    }
    DocumentTitle(route: ViewInstance): string {
        return this.UrlBase;
    }
    UrlTitle(route: ViewInstance): string {
        return this.UrlBase;
    }
}
class SingleViewContainer extends ViewContainer {
    constructor(cacheStrategy: CacheStrategy = CacheStrategy.View,  containerId: string = "content",  isDefault: boolean = false) {
        super();
        var t = this;
        t.IsDefault = isDefault;
        t.Views.push(new View(cacheStrategy, containerId, "/Views/" + t.UrlBase + ".html"));
    }
}