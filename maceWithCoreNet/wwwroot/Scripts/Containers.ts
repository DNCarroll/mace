Initializer.WindowLoaded = (e) => {
    DataObject.DefaultAlternatingRowClass = "formattedTableHighlight";
};
class OrdersContainer extends SingleViewContainer {
    public static instance: OrdersContainer = new OrdersContainer();
    constructor() {
        if (OrdersContainer.instance) {
            return OrdersContainer.instance;
        }
        super();
        this.IsDefault = true;
    }
}
