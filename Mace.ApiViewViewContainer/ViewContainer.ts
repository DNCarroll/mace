class $ApiViewControllerName$Container extends ViewContainer {
    private static instance: $ApiViewControllerName$Container = new $ApiViewControllerName$Container();
    constructor() {
        if ($ApiViewControllerName$Container.instance) {
            return $ApiViewControllerName$Container.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "/Views/$ApiViewControllerName$.html"));
        this.IsDefault = false;
    }
}