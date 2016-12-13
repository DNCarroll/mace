var ViewContainers: Array<IViewContainer> = new Array<IViewContainer>();
abstract class ViewContainer implements IViewContainer {    
    constructor() { }        
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
    ViewLoadCompleted(arg: ICustomEventArg<IView>) {
        if (arg.EventType == EventType.Completed) {
            this.NumberViewsShown = this.NumberViewsShown + 1;
        }
        if (this.NumberViewsShown === this.Views.length) {            
            ProgressManager.Hide();
        }
    }
    abstract DocumentTitle(route: ViewInstance): string;
    abstract Url(route: ViewInstance): string;
    abstract UrlPattern(): string;  
    abstract UrlTitle(route: ViewInstance): string;      
}