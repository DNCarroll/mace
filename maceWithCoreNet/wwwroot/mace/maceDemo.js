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
window["IsDebug"] = true;
var OrdersView = (function (_super) {
    __extends(OrdersView, _super);
    function OrdersView() {
        return _super.call(this, CacheStrategy.View, "content") || this;
    }
    return OrdersView;
}(View));
var Order = (function (_super) {
    __extends(Order, _super);
    function Order(serverObject) {
        var _this = _super.call(this, serverObject, ["SaveButtonClass", "SaveOccurring"]) || this;
        _this.saveOccurring = "off";
        return _this;
    }
    Object.defineProperty(Order.prototype, "SaveButtonClass", {
        get: function () {
            return this.ObjectState === ObjectState.Dirty ?
                "btn btn-warning right" :
                this.ObjectState === ObjectState.Cleaning ?
                    "btn btn- warning disabled" :
                    "btn btn-success right disabled";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Order.prototype, "SaveOccurring", {
        get: function () {
            var t = this;
            if (t.ObjectState === ObjectState.Dirty) {
                t.saveOccurring = "blink";
                t.runTimeout();
            }
            return t.saveOccurring;
        },
        enumerable: true,
        configurable: true
    });
    Order.prototype.runTimeout = function () {
        var t = this;
        setTimeout(function () {
            if (t.ObjectState !== ObjectState.Clean) {
                t.runTimeout();
            }
            t.saveOccurring = "off";
            t.InstigatePropertyChangedListeners("SaveOccurring", false);
        }, 1250);
    };
    return Order;
}(DataObject));
var OrdersBinder = (function (_super) {
    __extends(OrdersBinder, _super);
    function OrdersBinder() {
        var _this = _super.call(this, ['Id'], '/Api/Orders') || this;
        _this.RunWhenObjectsChange = function () {
            var e = "SaveOrders".Element();
            e.className = _this.DataObjects.First(function (o) { return o.ObjectState === ObjectState.Dirty; }) != null ? "btn btn-warning right" : "btn btn-success right disabled";
        };
        return _this;
    }
    return OrdersBinder;
}(Binder));
var AutoOrdersContainer = (function (_super) {
    __extends(AutoOrdersContainer, _super);
    function AutoOrdersContainer() {
        var _this = this;
        if (AutoOrdersContainer.instance) {
            return AutoOrdersContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new View(CacheStrategy.View, "content", "/mace/AutoOrders.html"));
        _this.IsDefault = false;
        _this.Name = "mace/AutoOrders";
        return _this;
    }
    AutoOrdersContainer.instance = new AutoOrdersContainer();
    return AutoOrdersContainer;
}(ViewContainer));
var OrdersContainer = (function (_super) {
    __extends(OrdersContainer, _super);
    function OrdersContainer() {
        var _this = this;
        if (OrdersContainer.instance) {
            return OrdersContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new View(CacheStrategy.View, "content", "/mace/Orders.html"));
        _this.IsDefault = false;
        _this.Name = "mace/Orders";
        return _this;
    }
    OrdersContainer.instance = new OrdersContainer();
    return OrdersContainer;
}(ViewContainer));
var OverviewContainer = (function (_super) {
    __extends(OverviewContainer, _super);
    function OverviewContainer() {
        var _this = this;
        if (OverviewContainer.instance) {
            return OverviewContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new View(CacheStrategy.View, "content", "/mace/Landing.html"));
        _this.IsDefault = true;
        _this.Name = "mace";
        return _this;
    }
    OverviewContainer.instance = new OverviewContainer();
    return OverviewContainer;
}(ViewContainer));
var OrderContainer = (function (_super) {
    __extends(OrderContainer, _super);
    function OrderContainer() {
        var _this = this;
        if (OrderContainer.instance) {
            return OrderContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new View(CacheStrategy.View, "content", "/mace/Order.html"));
        _this.IsDefault = false;
        _this.Name = "mace/Order";
        return _this;
    }
    OrderContainer.instance = new OrderContainer();
    return OrderContainer;
}(ViewContainer));
var ContactContainer = (function (_super) {
    __extends(ContactContainer, _super);
    function ContactContainer() {
        var _this = this;
        if (ContactContainer.instance) {
            return ContactContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new View(CacheStrategy.View, "content", "/mace/Contact.html"));
        _this.IsDefault = false;
        _this.Name = "mace/Contact";
        return _this;
    }
    ContactContainer.instance = new ContactContainer();
    return ContactContainer;
}(ViewContainer));
var Main;
(function (Main) {
    function Navigate(type) {
        var parameters = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            parameters[_i - 1] = arguments[_i];
        }
        "menu-btn".Element().checked = false;
        window.Show(type, parameters);
    }
    Main.Navigate = Navigate;
})(Main || (Main = {}));
HistoryManager.AddListener(EventType.Completed, function (e) {
    var header = e.Sender.Name.replace("mace/", "");
    "ViewHeader".Element().innerHTML = header == "mace" ? "Overview" : header;
});
//# sourceMappingURL=maceDemo.js.map