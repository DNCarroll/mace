var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DummyViewManager = (function (_super) {
    __extends(DummyViewManager, _super);
    function DummyViewManager() {
        if (DummyViewManager.instance) {
            return DummyViewManager.instance;
        }
        _super.call(this);
        this.Views.push(new DummyContent());
        this.Views.push(new ViewHeader());
        this.Views.push(new ViewFooter());
        this.IsDefault = true;
        DummyViewManager.instance = this;
    }
    DummyViewManager.prototype.DocumentTitle = function (route) { return "Dummy Content"; };
    DummyViewManager.prototype.Url = function (route) { return "DummyView/DummyParameter"; };
    DummyViewManager.prototype.UrlPattern = function () { return "dummypattern|dummy"; };
    DummyViewManager.prototype.UrlTitle = function (route) { return "Dummy Page"; };
    return DummyViewManager;
}(ViewContainer));
//# sourceMappingURL=DummyViewManager.js.map