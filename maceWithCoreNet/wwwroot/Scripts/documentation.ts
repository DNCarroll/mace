window["IsDebug"] = true;
class DocumentationContainer extends ViewContainer {
    private static instance: DocumentationContainer = new DocumentationContainer();
    constructor() {
        if (DocumentationContainer.instance) {
            return DocumentationContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "../Views/Landing.html"));
        this.IsDefault = true;
        this.UrlPattern = ()=> {
            return "^" + this.Name + "%";
        }
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
        this.Name = "Documentation/Binder";
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
        this.Name = "Documentation/DataObject";
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
        this.Name = "Documentation/ViewContainer";
    }
}
class ViewDocumentationContainer extends ViewContainer {
    private static instance: ViewDocumentationContainer = new ViewDocumentationContainer();
    constructor() {
        if (ViewDocumentationContainer.instance) {
            return ViewDocumentationContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "/Documentation/View.html"));
        this.IsDefault = false;
        this.Name = "Documentation/View";
    }
}
module Documentation {
    export function Navigate<T extends IViewContainer>(type: { new (): T; }, ...parameters: any[]) {
        (<HTMLInputElement>"menu-btn".Element()).checked = false;
        window.Show(type, parameters);
    }    
}
HistoryManager.AddListener(EventType.Completed, (e) => {
    var n = e.Sender.ViewContainer.Name.replace("Documentation/", "");
    "ViewHeader".Element().innerHTML = n;
});




