var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MaceTestObject = (function (_super) {
    __extends(MaceTestObject, _super);
    function MaceTestObject(serverObject) {
        return _super.call(this, serverObject) || this;
    }
    return MaceTestObject;
}(DataObject));
