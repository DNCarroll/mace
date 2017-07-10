window["IsDebug"] = true;
class DocumentationContainer extends ViewContainer {
    private static instance: DocumentationContainer = new DocumentationContainer();
    constructor() {
        if (DocumentationContainer.instance) {
            return DocumentationContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "../../mace/Landing.html"));
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
        this.Views.push(new View(CacheStrategy.View, "content", "../../mace/Documentation/Binder.html"));
        this.IsDefault = false;
        this.Name = "mace/Documentation/Binder";
    }
}
class DataObjectContainer extends ViewContainer {
    private static instance: DataObjectContainer = new DataObjectContainer();
    constructor() {
        if (DataObjectContainer.instance) {
            return DataObjectContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "../../mace/Documentation/DataObject.html"));
        this.IsDefault = false;
        this.Name = "mace/Documentation/DataObject";
    }
}
class ViewContainerContainer extends ViewContainer {
    private static instance: ViewContainerContainer = new ViewContainerContainer();
    constructor() {
        if (ViewContainerContainer.instance) {
            return ViewContainerContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "../../mace/Documentation/ViewContainer.html"));
        this.IsDefault = false;
        this.Name = "mace/Documentation/ViewContainer";
    }
}
class ViewDocumentationContainer extends ViewContainer {
    private static instance: ViewDocumentationContainer = new ViewDocumentationContainer();
    constructor() {
        if (ViewDocumentationContainer.instance) {
            return ViewDocumentationContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "../../mace/Documentation/View.html"));
        this.IsDefault = false;
        this.Name = "mace/Documentation/View";
    }
}
class BuildChecklistContainer extends ViewContainer {
    private static instance: BuildChecklistContainer = new BuildChecklistContainer();
    constructor() {
        if (BuildChecklistContainer.instance) {
            return BuildChecklistContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "../../mace/Documentation/BuildCheckList.html"));
        this.IsDefault = false;
        this.Name = "mace/Documentation/BuildCheckList";
    }
}
class NavigationContainer extends ViewContainer {
    private static instance: NavigationContainer = new NavigationContainer();
    constructor() {
        if (NavigationContainer.instance) {
            return NavigationContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "../../mace/Documentation/Navigation.html"));
        this.IsDefault = false;
        this.Name = "mace/Documentation/Navigation";
    }
}
module Documentation {
    export var position = 1;
    export function Navigate<T extends IViewContainer>(type: { new (): T; }, ...parameters: any[]) {
        (<HTMLInputElement>"menu-btn".Element()).checked = false;
        window.Show(type, parameters);
    }  
    export function ChangePage(isNext: boolean) {
        var lastposition = position, previousElement = ("page" + lastposition).Element();
        position = isNext ? position === 4 ? 1 : position + 1 : position === 1 ? 4 : position - 1;
        var currentElement = ("page" + position).Element();
        previousElement.style.opacity = "0";
        previousElement.style.display = "none";
        currentElement.style.opacity = "1";
        currentElement.style.display = "block";
    }
}
HistoryManager.AddListener(EventType.Completed, (e) => {
    var n = e.Sender.Name.replace("mace/Documentation/", ""), bc = "breadCrumbWhere".Element();
    "ViewHeader".Element().innerHTML = n;
    bc.style.opacity = n === "Documentation" ? "0" : "1";
    bc.innerHTML = n;
    "DocumentationCrumb".Element().className = n === "Documentation" ? "active" : null;
    Documentation.position = 1;
});





