window["IsDebug"] = true;
class OrdersView extends View {
    constructor() {
        super(CacheStrategy.View, "content");        
    }
}
class Order extends DataObject {
    constructor(serverObject) {
        super(serverObject, ["SaveButtonClass", "SaveOccurring"]);
    }
    get SaveButtonClass(): string {
        return this.ObjectState === ObjectState.Dirty ?
            "btn btn-warning right" :
            this.ObjectState === ObjectState.Cleaning ?
                "btn btn- warning disabled" :
                "btn btn-success right disabled";
    }    
    saveOccurring = "off";
    get SaveOccurring(): string {
        var t = this;
        if (t.ObjectState === ObjectState.Dirty) {
            t.saveOccurring = "blink";
            t.runTimeout();
        }
        return t.saveOccurring;
    }
    runTimeout() {
        var t = this;
        setTimeout(function () {
            if (t.ObjectState !== ObjectState.Clean) {
                t.runTimeout();
            }
            t.saveOccurring = "off";
            t.InstigatePropertyChangedListeners("SaveOccurring", false);
        }, 1250);
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
    export function Navigate<T extends IViewContainer>(type: { new (): T; }, ...parameters: any[]) {        
        (<HTMLInputElement>"menu-btn".Element()).checked = false;
        window.Show(type, parameters);        
    }

}
HistoryManager.AddListener(EventType.Completed, (e) => {    
    "ViewHeader".Element().innerHTML = e.Sender.Name;
});