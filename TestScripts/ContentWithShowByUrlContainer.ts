class ContentWithShowByUrlContainer extends ViewContainer {
    private static instance: ContentWithShowByUrlContainer;
    constructor() {
        if (ContentWithShowByUrlContainer.instance)
        {
            return ContentWithShowByUrlContainer.instance;
        }
        super();
        this.Views.push(new ContentWithShowByUrlContent());
        this.Views.push(new ViewHeader());
        this.Views.push(new ViewFooter());        
        ContentWithShowByUrlContainer.instance = this;
    }
    DocumentTitle(route: ViewInstance) { return this.UrlTitle(route); }
    Url(route: ViewInstance) { return "ShowByUrl"; }
    UrlPattern() { return "contentByUrl"; }
    UrlTitle(route: ViewInstance) { return "Content with Show By URL"; }
}