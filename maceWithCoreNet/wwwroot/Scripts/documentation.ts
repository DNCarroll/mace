class HighLevelContainer extends ViewContainer {
    private static instance: HighLevelContainer = new HighLevelContainer();
    constructor() {
        if (HighLevelContainer.instance) {
            return HighLevelContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "/Documentation/HighLevel.html"));
        this.IsDefault = false;
    }
}
class BinderContainer extends ViewContainer {
    private static instance: BinderContainer = new BinderContainer();
    constructor() {
        if (BinderContainer.instance) {
            return BinderContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "/Documentation/Binder.html"));
        this.IsDefault = false;
    }
}
class DataObjectContainer extends ViewContainer {
    private static instance: DataObjectContainer = new DataObjectContainer();
    constructor() {
        if (DataObjectContainer.instance) {
            return DataObjectContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "/Documentation/DataObject.html"));
        this.IsDefault = false;
    }
}
class ViewContainerContainer extends ViewContainer {
    private static instance: ViewContainerContainer = new ViewContainerContainer();
    constructor() {
        if (ViewContainerContainer.instance) {
            return ViewContainerContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "/Documentation/ViewContainer.html"));
        this.IsDefault = false;
    }
}


