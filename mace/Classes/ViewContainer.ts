var ViewContainers: Array<IViewContainer> = new Array<IViewContainer>();
abstract class ViewContainer implements IViewContainer {
    constructor() {
        var n = Reflection.GetName(this.constructor);
        this.UrlBase = n.replace("Container", "");
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
        var pattern = this.UrlPattern();
        if (pattern) {
            var regex = new RegExp(pattern, 'i');
            return url.match(regex) ? true : false;
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
            var part = rp[0] == this.UrlBase ?
                rp.slice(1).join("/") :
                rp.join("/");
            return this.UrlBase + (part.length > 0 ? "/" + part : "");
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