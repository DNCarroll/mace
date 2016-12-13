var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ViewContent = (function (_super) {
    __extends(ViewContent, _super);
    function ViewContent() {
        _super.call(this);
    }
    ViewContent.prototype.ViewUrl = function () { return "/Views/TestContent.html"; };
    ;
    ViewContent.prototype.ContainerID = function () {
        return "content";
    };
    return ViewContent;
}(View));
//# sourceMappingURL=ViewContent.js.map