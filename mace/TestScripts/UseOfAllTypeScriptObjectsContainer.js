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
var UseOfAllTypeScriptObjectsContainer = (function (_super) {
    __extends(UseOfAllTypeScriptObjectsContainer, _super);
    function UseOfAllTypeScriptObjectsContainer() {
        var _this = this;
        if (UseOfAllTypeScriptObjectsContainer.instance) {
            return UseOfAllTypeScriptObjectsContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new UseOfAllTypeScriptObjectsView());
        return _this;
    }
    return UseOfAllTypeScriptObjectsContainer;
}(ViewContainer));
UseOfAllTypeScriptObjectsContainer.instance = new UseOfAllTypeScriptObjectsContainer();
//# sourceMappingURL=UseOfAllTypeScriptObjectsContainer.js.map