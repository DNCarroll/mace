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


