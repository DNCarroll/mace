var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DummyContent = (function (_super) {
    __extends(DummyContent, _super);
    function DummyContent() {
        _super.call(this);
    }
    DummyContent.prototype.ViewUrl = function () { return "/Views/DummyContent.html"; };
    ;
    DummyContent.prototype.ContainerID = function () {
        return "content";
    };
    return DummyContent;
}(View));
//# sourceMappingURL=DummyContent.js.map