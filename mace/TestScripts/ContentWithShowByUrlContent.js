var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ContentWithShowByUrlContent = (function (_super) {
    __extends(ContentWithShowByUrlContent, _super);
    function ContentWithShowByUrlContent() {
        return _super.call(this) || this;
    }
    ContentWithShowByUrlContent.prototype.Url = function () { return "/Views/ContentWithShowByUrl.html"; };
    ;
    ContentWithShowByUrlContent.prototype.ContainerID = function () {
        return "content";
    };
    return ContentWithShowByUrlContent;
}(View));
