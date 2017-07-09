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
class AutoOrdersContainer extends ViewContainer {
    private static instance: AutoOrdersContainer = new AutoOrdersContainer();
    constructor() {
        if (AutoOrdersContainer.instance) {
            return AutoOrdersContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "/mace/AutoOrders.html"));
        this.IsDefault = false;
        this.Name = "mace/AutoOrders";
    }
}
class OrdersContainer extends ViewContainer {
    private static instance: OrdersContainer = new OrdersContainer();
    constructor() {
        if (OrdersContainer.instance) {
            return OrdersContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "/mace/Orders.html"));
        this.IsDefault = false;
        this.Name = "mace/Orders";
    }
}
class DefaultTypeNameContainer extends SingleViewContainer {
    private static instance: DefaultTypeNameContainer = new DefaultTypeNameContainer();
    constructor() {
        if (DefaultTypeNameContainer.instance) {
            return DefaultTypeNameContainer.instance;
        }
        super();
        this.IsDefault = false;
    }
}

class OverviewContainer extends ViewContainer {
    private static instance: OverviewContainer = new OverviewContainer();
    constructor() {
        if (OverviewContainer.instance) {
            return OverviewContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "/mace/Landing.html"));
        this.IsDefault = true;
        this.Name = "mace";
    }
}
class OrderContainer extends ViewContainer {
    private static instance: OrderContainer = new OrderContainer();
    constructor() {
        if (OrderContainer.instance) {
            return OrderContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "/mace/Order.html"));
        this.IsDefault = false;
        this.Name = "mace/Order";
    }
}
class ContactContainer extends ViewContainer {
    private static instance: ContactContainer = new ContactContainer();
    constructor() {
        if (ContactContainer.instance) {
            return ContactContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "/mace/Contact.html"));
        this.IsDefault = false;
        this.Name = "mace/Contact";
    }
}

module Main {    
    export function Navigate<T extends IViewContainer>(type: { new (): T; }, ...parameters: any[]) {        
        (<HTMLInputElement>"menu-btn".Element()).checked = false;
        window.Show(type, parameters);        
    }

}
HistoryManager.AddListener(EventType.Completed, (e) => {
    var header = e.Sender.Name.replace("mace/", "");
    "ViewHeader".Element().innerHTML = header == "mace" ? "Overview" : header;
});e