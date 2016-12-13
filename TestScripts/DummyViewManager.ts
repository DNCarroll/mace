class DummyViewManager extends ViewContainer {
    private static instance: DummyViewManager;
    constructor() {
        if (DummyViewManager.instance) {
            return DummyViewManager.instance;
        }
        super();
        this.Views.push(new DummyContent());
        this.Views.push(new ViewHeader());
        this.Views.push(new ViewFooter());
        this.IsDefault = true;
        DummyViewManager.instance = this;
    }
    DocumentTitle(route: ViewInstance) { return "Dummy Content"; }
    Url(route: ViewInstance) { return "DummyView/DummyParameter"; }
    UrlPattern() { return "dummypattern|dummy"; }
    UrlTitle(route: ViewInstance) { return "Dummy Page"; }
}