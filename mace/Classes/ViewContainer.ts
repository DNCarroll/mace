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
        this.NumberViewsShown = 0;
        ProgressManager.Show();
        this.Views.forEach(s => {
            s.AddListener(EventType.Completed, this.ViewLoadCompleted.bind(this));
            s.Show(route)
        });
    }
    IsUrlPatternMatch(url: string) {
        if (!Is.NullOrEmpty(url)) {
            var p = this.UrlPattern(), up = (url.indexOf("/") == 0 ? url.substr(1) : url).split("/")[0];
            if (p) {
                var regex = new RegExp(p, 'i');
                return up.match(regex) ? true : false;
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
        var rp = route.Parameters;
        if (rp) {
            var p = rp[0] == this.UrlBase ?
                rp.slice(1).join("/") :
                rp.join("/");
            return this.UrlBase + (p.length > 0 ? "/" + p : "");
        }
        return this.UrlBase;
    }
    DocumentTitle(route: ViewInstance): string {
        return this.UrlBase;
    }
    UrlPattern(): string {
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