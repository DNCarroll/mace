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
var NotAllowedContainer = (function (_super) {
    __extends(NotAllowedContainer, _super);
    function NotAllowedContainer() {
        var _this = this;
        if (NotAllowedContainer.instance) {
            return NotAllowedContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.IsDefault = false;
        return _this;
    }
    NotAllowedContainer.instance = new NotAllowedContainer();
    return NotAllowedContainer;
}(SingleViewContainer));
//# sourceMappingURL=NotAllowed.js.map