module RegularExpression {
    export var
        ZDate: RegExp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g,
        UTCDate: RegExp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/i;
}