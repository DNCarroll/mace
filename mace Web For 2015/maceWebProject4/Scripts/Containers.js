var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
Initializer.WindowLoaded = function (e) {
    DataObject.DefaultAlternatingRowClass = "formattedTableHighlight";
};
var OrdersContainer = (function (_super) {
    __extends(OrdersContainer, _super);
    function OrdersContainer() {
        var _this = this;
        if (OrdersContainer.instance) {
            return OrdersContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.IsDefault = true;
        return _this;
    }
    return OrdersContainer;
}(SingleViewContainer));
OrdersContainer.instance = new OrdersContainer();
//# sourceMappingURL=Containers.js.map