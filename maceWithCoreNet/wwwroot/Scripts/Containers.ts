window["IsDebug"] = true;
class Order extends DataObject {
    constructor(serverObject) {
        super(serverObject, ["SaveButtonClass"]);
    }
    get SaveButtonClass(): string {
        return this.ObjectState === ObjectState.Dirty ? "btn btn-warning right" : "btn btn-success right disabled";
    }
}
class OrdersBinder extends Binder {
    constructor() {
        super(['Id'], '/Api/Orders');
        this.RunWhenObjectsChange = () => {
            var e = "SaveOrders".Element();
            e.className = this.DataObjects.First(o => o.ObjectState === ObjectState.Dirty) != null ? "btn btn-warning right" : "btn btn-success right disabled";
        };
    }
}
class AutoOrdersContainer extends SingleViewContainer {
    private static instance: AutoOrdersContainer = new AutoOrdersContainer();
    constructor() {
        if (AutoOrdersContainer.instance) {
            return AutoOrdersContainer.instance;
        }
        super();
        this.IsDefault = false;
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
class OrderContainer extends SingleViewContainer {
    private static instance: OrderContainer = new OrderContainer();
    constructor() {
        if (OrderContainer.instance) {
            return OrderContainer.instance;
        }
        super();
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

