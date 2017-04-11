var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DummyViewManager = (function (_super) {
    __extends(DummyViewManager, _super);
    function DummyViewManager() {
        var _this = this;
        if (DummyViewManager.instance) {
            return DummyViewManager.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new DummyContent());
        _this.Views.push(new ViewHeader());
        _this.Views.push(new ViewFooter());
        DummyViewManager.instance = _this;
        return _this;
    }
    DummyViewManager.prototype.DocumentTitle = function (route) { return "Dummy Content"; };
    DummyViewManager.prototype.Url = function (route) { return "DummyView/DummyParameter"; };
    DummyViewManager.prototype.UrlPattern = function () { return "dummypattern|dummy"; };
    DummyViewManager.prototype.UrlTitle = function (route) { return "Dummy Page"; };
    return DummyViewManager;
}(ViewContainer));
//# sourceMappingURL=DummyViewManager.js.map