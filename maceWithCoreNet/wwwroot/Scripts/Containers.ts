class Order extends DataObject {
    constructor(serverObject) {
        super(serverObject);
        this.AddObjectStateListener(this.objectStateChanged.bind(this));
    }
    objectStateChanged(obj: ObjectState) {
        this.InstigatePropertyChangedListeners("SaveButtonClass", false);
    }
    get SaveButtonClass(): string {
        return this.ObjectState === ObjectState.Dirty ? "btn btn-warning right" : "btn btn-success right disabled";
    }
}
class OrderView extends View {
    constructor() {
        super(CacheStrategy.View, "content");
    }
    static Save(sender: HTMLElement) {
        //kick off the binder for the save?
    }
}
class OrdersContainer extends SingleViewContainer {
    public static instance: OrdersContainer = new OrdersContainer();
    constructor() {
        if (OrdersContainer.instance) {
            return OrdersContainer.instance;
        }
        super();
    }
}
class LandingContainer extends SingleViewContainer {
    private static instance: LandingContainer = new LandingContainer();
    constructor() {
        if (LandingContainer.instance) {
            return LandingContainer.instance;
        }
        super();
        this.IsDefault = true;
    }
}
class OrderContainer extends ViewContainer {
    private static instance: OrderContainer = new OrderContainer();
    constructor() {
        if (OrderContainer.instance) {
            return OrderContainer.instance;
        }
        super();
        this.Views.push(new OrderView());
        this.IsDefault = false;
    }
}
module Main {
    //export function Execute(e?) {
    export function Navigate<T extends IViewContainer>(type: { new (): T; }, ...parameters: any[]) {
        //are we trying to figure out the who?
        //parameters here is probably a problem
        //most likely it will stick the array of parameter in the first
        (<HTMLInputElement>"menu-btn".Element()).checked = false;
        window.Show(type, parameters);
    }
}

