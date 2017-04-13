var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DefaultContentManager = (function (_super) {
    __extends(DefaultContentManager, _super);
    function DefaultContentManager() {
        var _this = this;
        if (DefaultContentManager.instance) {
            return DefaultContentManager.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new ViewContent());
        _this.Views.push(new ViewHeader());
        _this.Views.push(new ViewFooter());
        _this.IsDefault = true;
        DefaultContentManager.instance = _this;
        return _this;
    }
    DefaultContentManager.prototype.DocumentTitle = function (route) { return "Default content"; };
    DefaultContentManager.prototype.Url = function (route) { return "Default"; };
    DefaultContentManager.prototype.UrlPattern = function () { return "default"; };
    DefaultContentManager.prototype.UrlTitle = function (route) { return "Default Page"; };
    return DefaultContentManager;
}(ViewContainer));
