interface Document {
    NewE<T extends string>(tagName: T): Caster<T>;
    NewE<T extends string>(tagName: T, objectProperties?: any): Caster<T>;
}
Document.prototype.NewE = function <T extends string>(tagName: T, objectProperties?: any): Caster<T> {
    var ele = document.createElement(tagName.toUpperCase()), op = objectProperties;
    if (op) {
        ele.Set(op);
    }
    return <Caster<T>>ele;
};