var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
    return DocumentationContainer;
}(SingleViewContainer));
DocumentationContainer.instance = new DocumentationContainer();
//# sourceMappingURL=DocumentationViewController.js.map