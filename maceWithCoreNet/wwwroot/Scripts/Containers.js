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
var Order = (function (_super) {
    __extends(Order, _super);
    function Order(serverObject) {
        var _this = _super.call(this, serverObject) || this;
        _this.AddObjectStateListener(_this.objectStateChanged.bind(_this));
        return _this;
    }
    Order.prototype.objectStateChanged = function (obj) {
        this.InstigatePropertyChangedListeners("SaveButtonClass", false);
    };
    Object.defineProperty(Order.prototype, "SaveButtonClass", {
        get: function () {
            return this.ObjectState === ObjectState.Dirty ? "btn btn-warning right" : "btn btn-success right disabled";
        },
        enumerable: true,
        configurable: true
    });
    return Order;
}(DataObject));
var OrderView = (function (_super) {
    __extends(OrderView, _super);
    function OrderView() {
        return _super.call(this, CacheStrategy.View, "content") || this;
    }
    OrderView.Save = function (sender) {
        //kick off the binder for the save?
    };
    return OrderView;
}(View));
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
        _this.Views.push(new OrderView());
        _this.IsDefault = false;
        return _this;
    }
    return OrderContainer;
}(ViewContainer));
OrderContainer.instance = new OrderContainer();
var Main;
(function (Main) {
    //export function Execute(e?) {
    function Navigate(type) {
        var parameters = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            parameters[_i - 1] = arguments[_i];
        }
        //are we trying to figure out the who?
        //parameters here is probably a problem
        //most likely it will stick the array of parameter in the first
        "menu-btn".Element().checked = false;
        window.Show(type, parameters);
    }
    Main.Navigate = Navigate;
})(Main || (Main = {}));
//# sourceMappingURL=Containers.js.map