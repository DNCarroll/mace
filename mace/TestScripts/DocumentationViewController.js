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
var DocumentationContainer = (function (_super) {
    __extends(DocumentationContainer, _super);
    function DocumentationContainer() {
        var _this = this;
        if (DocumentationContainer.instance) {
            return DocumentationContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.IsDefault = true;
        return _this;
    }
    DocumentationContainer.instance = new DocumentationContainer();
    return DocumentationContainer;
}(SingleViewContainer));
//# sourceMappingURL=DocumentationViewController.js.map