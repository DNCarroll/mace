class BinderTestObject extends DataObject {
    
    private _makeCheckedChange: string = "no";
    private _containerBackground: string;
    get ID(){
        return this.ServerObject["ID"];
    }
    set ID(value:number){
        this.SetServerProperty("ID", value);
        if (this.ID > 19) {
            this.ContainerBackground = "#FE2E2E";
        }
        else if (this.ID > 9) {
            this.ContainerBackground = "#DBA901";
        }
        else {
            this.ContainerBackground = "#FFFFFF";
        }
    }
    get Name() {
        return this.ServerObject["Name"];
    }
    set Name(value: string) {
        this.SetServerProperty("Name", value);
    }
    get Value() {
        return this.ServerObject["Value"];
    }
    set Value(value: string) {
        this.SetServerProperty("Value", value);
    }
    get Checked() {
        return this.ServerObject["Checked"];
    }
    set Checked(value: boolean) {
        this.SetServerProperty("Checked", value);
    }
    get RadioChecked() {
        return this.ServerObject["RadioChecked"];
    }
    get SelectValue() {
        return this.ServerObject["SelectValue"];
    }
    set SelectValue(value: string) {
        this.SetServerProperty("SelectValue", value);
    }
    set RadioChecked(value) {
        this.SetServerProperty("RadioChecked", value);
    }
    get MakeCheckedChange() {
        return this._makeCheckedChange;
    }
    
    set MakeCheckedChange(value: string) {
        var change = value != this._makeCheckedChange;
        this._makeCheckedChange = value;
        if (change) {
            this.InstigatePropertyChangedListeners("MakeCheckedChange", false);
        }
        if (this._makeCheckedChange === "yes") {
            this.Checked = !this.Checked;
        }
    }
    get ContainerBackground() {
        if (!this._containerBackground) {
            if (this.ID > 19) {
                this._containerBackground = "#FE2E2E";
            }
            else if (this.ID > 9) {
                this._containerBackground = "#DBA901";
            }
            else {
                this._containerBackground = "#FFFFFF";
            }
        }
        return this._containerBackground;
    }
    set ContainerBackground(value: string) {
        var change = value != this._containerBackground;
        this._containerBackground = value;
        if (change) {
            this.InstigatePropertyChangedListeners("ContainerBackground", false);
        }
    }
}

class BinderTest extends Binder {
    constructor() {
        super();
    }
    NewObject(obj:any) {
        return new BinderTestObject(obj);
    }
    Execute() {        
        var bo = new BinderTestObject();
        bo.Name = "Test the name";
        bo.ID = 1;
        bo.Value = "test the value";        
        this.BindToDataObject(bo);
        this.Dispatch(EventType.Completed);
    }
}

class BinderTest2 extends Binder {
    constructor() {
        super();
    }
    NewObject(obj: any) {
        return new BinderTestObject(obj);
    }
    Execute() {
        var bo = new BinderTestObject();
        bo.Name = "Test the name";
        bo.ID = 1;
        bo.Value = "test the value";
        this.BindToDataObject(bo);
        this.Dispatch(EventType.Completed);
    }
}

class BinderView extends View {    
    constructor() {
        super();                
    }
    ViewUrl() { return "/Views/BinderView.html" };
    ContainerID() {
        return "content";        
    }
}
class BinderViewContainer extends ViewContainer {
    private static instance: BinderViewContainer;
    constructor() {
        if (BinderViewContainer.instance) {
            return BinderViewContainer.instance;
        }
        super();
        this.Views.push(new BinderView());
        this.Views.push(new ViewHeader());
        this.Views.push(new ViewFooter());
        this.IsDefault = true;
        BinderViewContainer.instance = this;
    }
    DocumentTitle(route: ViewInstance) { return "Bound content"; }
    Url(route: ViewInstance) { return "Bound"; }
    UrlPattern() { return "Bound"; }
    UrlTitle(route: ViewInstance) { return "Bound Page"; }
}
class MultipleViewBinder extends View {
    constructor() {
        super();
    }
    ViewUrl() { return "/Views/MultipleBindings.html" };
    ContainerID() {
        return "content";
    }
}
class MultipleBindingsContainer extends ViewContainer {
    private static instance: MultipleBindingsContainer;
    constructor() {
        if (MultipleBindingsContainer.instance) {
            return MultipleBindingsContainer.instance;
        }
        super();
        this.Views.push(new MultipleViewBinder());
        this.Views.push(new ViewHeader());
        this.Views.push(new ViewFooter());
        this.IsDefault = true;
        MultipleBindingsContainer.instance = this;
    }
    DocumentTitle(route: ViewInstance) { return "Multiple bindings"; }
    Url(route: ViewInstance) { return "multiplebindings"; }
    UrlPattern() { return "multiplebindings"; }
    UrlTitle(route: ViewInstance) { return "multiplebindings view"; }
}
class WebApiFormView extends View {
    static GenericSelectData: any;
    constructor() {
        super();
        var ajax = new Ajax();        
        this.Preload = new DataLoaders(new DataLoader("/Api/GenericSelectData", this.AjaxLoadCompleted, () => !WebApiFormView.GenericSelectData));
        this.Cache();
    }
    ViewUrl() { return "/Views/WebApiFormView.html" };
    ContainerID() {
        return "content";
    }  
    AjaxLoadCompleted(arg: ICustomEventArg<Ajax>) {
        WebApiFormView.GenericSelectData = arg.Sender.GetRequestData();
    }  
}
class WebApiBindingContainer extends ViewContainer {
    private static instance: WebApiBindingContainer;
    constructor() {
        if (WebApiBindingContainer.instance) {
            return WebApiBindingContainer.instance;
        }
        super();
        this.Views.push(new WebApiFormView());
        this.Views.push(new ViewHeader());
        this.Views.push(new ViewFooter());
        this.IsDefault = true;
        WebApiBindingContainer.instance = this;
    }
    DocumentTitle(route: ViewInstance) { return "WebApi Data"; }
    Url(route: ViewInstance) {
        var routeVariable = "/";
        if (route.Parameters) {
            if (Is.Array(route.Parameters)) {
                routeVariable += route.Parameters.join("/");
            }
            else {
                routeVariable += route.Parameters.toString();
            }
        }
        return "WebApiData" + (routeVariable.length > 1 ? routeVariable : "");
    }
    UrlPattern() { return "WebApiData"; }
    UrlTitle(route: ViewInstance) { return "webapi view"; }
}
class WebApiBinder extends Binder {
    constructor() {
        super();
        this.AutomaticallySelectsFromWebApi = true;
        this.AutomaticallyUpdatesToWebApi = true;
        this.WebApi = "/Api/WebApiBinder";        
    }
    NewObject(obj: any) {
        return new BinderTestObject(obj);
    }
}

