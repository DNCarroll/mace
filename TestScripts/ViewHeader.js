var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ViewHeader = (function (_super) {
    __extends(ViewHeader, _super);
    function ViewHeader() {
        _super.call(this);
    }
    ViewHeader.prototype.ViewUrl = function () { return "/Views/header.html"; };
    ;
    ViewHeader.prototype.ContainerID = function () {
        return "header";
    };
    return ViewHeader;
}(View));
//# sourceMappingURL=ViewHeader.js.map