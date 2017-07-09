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
var BareBonesContainer = (function (_super) {
    __extends(BareBonesContainer, _super);
    function BareBonesContainer() {
        var _this = this;
        if (BareBonesContainer.instance) {
            return BareBonesContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new View(CacheStrategy.View, "content", "/Views/BareBones.html"));
        return _this;
    }
    BareBonesContainer.instance = new BareBonesContainer();
    return BareBonesContainer;
}(ViewContainer));
//# sourceMappingURL=BareBonesContainer.js.map