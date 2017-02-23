class DefaultContentManager extends ViewContainer {
    private static instance: DefaultContentManager;
    constructor() {
        if (DefaultContentManager.instance) {            
            return DefaultContentManager.instance;
        }
        super();
        this.Views.push(new ViewContent());
        this.Views.push(new ViewHeader());
        this.Views.push(new ViewFooter());
        this.IsDefault = true;
        DefaultContentManager.instance = this;
    }    
    DocumentTitle(route: ViewInstance) { return "Default content"; }
    Url(route: ViewInstance) { return "Default"; }
    UrlPattern() { return "default"; }
    UrlTitle(route: ViewInstance) { return "Default Page"; }
}
