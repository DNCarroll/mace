var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ContentWithShowByUrlContainer = (function (_super) {
    __extends(ContentWithShowByUrlContainer, _super);
    function ContentWithShowByUrlContainer() {
        var _this = this;
        if (ContentWithShowByUrlContainer.instance) {
            return ContentWithShowByUrlContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new ContentWithShowByUrlContent());
        _this.Views.push(new ViewHeader());
        _this.Views.push(new ViewFooter());
        ContentWithShowByUrlContainer.instance = _this;
        return _this;
    }
    ContentWithShowByUrlContainer.prototype.DocumentTitle = function (route) { return this.UrlTitle(route); };
    ContentWithShowByUrlContainer.prototype.Url = function (route) { return "ShowByUrl"; };
    ContentWithShowByUrlContainer.prototype.UrlPattern = function () { return "contentByUrl"; };
    ContentWithShowByUrlContainer.prototype.UrlTitle = function (route) { return "Content with Show By URL"; };
    return ContentWithShowByUrlContainer;
}(ViewContainer));
