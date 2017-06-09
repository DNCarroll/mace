var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
        return _this;
    }
    return OrdersContainer;
}(SingleViewContainer));
OrdersContainer.instance = new OrdersContainer();
var LandingContainer = (function (_super) {
    __extends(LandingContainer, _super);
    function LandingContainer() {
        var _this = this;
        if (LandingContainer.instance) {
            return LandingContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.IsDefault = true;
        return _this;
    }
    return LandingContainer;
}(SingleViewContainer));
LandingContainer.instance = new LandingContainer();
var OrderContainer = (function (_super) {
    __extends(OrderContainer, _super);
    function OrderContainer() {
        var _this = this;
        if (OrderContainer.instance) {
            return OrderContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.IsDefault = false;
        return _this;
    }
    return OrderContainer;
}(SingleViewContainer));
OrderContainer.instance = new OrderContainer();
//# sourceMappingURL=Containers.js.map