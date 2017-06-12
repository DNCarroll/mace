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
var HighLevelContainer = (function (_super) {
    __extends(HighLevelContainer, _super);
    function HighLevelContainer() {
        var _this = this;
        if (HighLevelContainer.instance) {
            return HighLevelContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new View(CacheStrategy.View, "content", "/Documentation/HighLevel.html"));
        _this.IsDefault = false;
        return _this;
    }
    return HighLevelContainer;
}(ViewContainer));
HighLevelContainer.instance = new HighLevelContainer();
var BinderContainer = (function (_super) {
    __extends(BinderContainer, _super);
    function BinderContainer() {
        var _this = this;
        if (BinderContainer.instance) {
            return BinderContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new View(CacheStrategy.View, "content", "/Documentation/Binder.html"));
        _this.IsDefault = false;
        return _this;
    }
    return BinderContainer;
}(ViewContainer));
BinderContainer.instance = new BinderContainer();
var DataObjectContainer = (function (_super) {
    __extends(DataObjectContainer, _super);
    function DataObjectContainer() {
        var _this = this;
        if (DataObjectContainer.instance) {
            return DataObjectContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new View(CacheStrategy.View, "content", "/Documentation/DataObject.html"));
        _this.IsDefault = false;
        return _this;
    }
    return DataObjectContainer;
}(ViewContainer));
DataObjectContainer.instance = new DataObjectContainer();
var ViewContainerContainer = (function (_super) {
    __extends(ViewContainerContainer, _super);
    function ViewContainerContainer() {
        var _this = this;
        if (ViewContainerContainer.instance) {
            return ViewContainerContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new View(CacheStrategy.View, "content", "/Documentation/ViewContainer.html"));
        _this.IsDefault = false;
        return _this;
    }
    return ViewContainerContainer;
}(ViewContainer));
ViewContainerContainer.instance = new ViewContainerContainer();
//# sourceMappingURL=documentation.js.map