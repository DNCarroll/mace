var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ListBinder = (function (_super) {
    __extends(ListBinder, _super);
    function ListBinder() {
        _super.apply(this, arguments);
        this.DataObjects = new Array();
    }
    ListBinder.prototype.OnAjaxComplete = function (arg) {
        if (arg.EventType === EventType.Completed) {
            //presumably this should be an array
            var data = arg.Sender.GetRequestData();
            if (data) {
            }
        }
    };
    return ListBinder;
}(Binder));
//# sourceMappingURL=ListBinder.js.map