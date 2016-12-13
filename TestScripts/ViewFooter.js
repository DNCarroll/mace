var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ViewFooter = (function (_super) {
    __extends(ViewFooter, _super);
    function ViewFooter() {
        _super.call(this);
    }
    ViewFooter.prototype.ViewUrl = function () { return "/Views/footer.html"; };
    ;
    ViewFooter.prototype.ContainerID = function () {
        return "footer";
    };
    return ViewFooter;
}(View));
//# sourceMappingURL=ViewFooter.js.map