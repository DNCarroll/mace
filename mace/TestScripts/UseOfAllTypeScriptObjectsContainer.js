var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
