var ViewContainers: Array<IViewContainer> = new Array<IViewContainer>();
abstract class ViewContainer implements IViewContainer {
    constructor() {
        var n = Reflection.GetName(this.constructor);
        this.UrlBase = n.replace("ViewContainer", "");
        this.UrlBase = this.UrlBase.replace("Container", "");
        ViewContainers.push(this);
    }
    UrlBase: string;
    Views: Array<IView> = new Array<IView>();
    IsDefault: boolean = false;
    NumberViewsShown: number;
    Show(route: ViewInstance) {
        var rp = route.Parameters, t = this;
        if (rp.length == 1 && t.IsDefault) {
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
            var p = this.UrlPattern();
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
    Url(route: ViewInstance): string {
        var rp = route.Parameters, t = this;
        if (rp) {            
            if (rp.length == 1 && t.IsDefault) {
                rp = new Array();
            }
            if (rp.length > 0) {
                var p = rp[0] == t.UrlBase ?
                    rp.slice(1).join("/") :
                    rp.join("/");
                return t.UrlBase + (p.length > 0 ? "/" + p : "");
            }
        }
        return t.UrlBase;
    }
    DocumentTitle(route: ViewInstance): string {
        return this.UrlBase;
    }
    UrlPattern(): string {
        return "^" + this.UrlBase;
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