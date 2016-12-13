module RegularExpression {
    export var StandardBindingWrapper: RegExp = /{|}/g,
        StandardBindingPattern: RegExp = /{(\w+(\.\w+)*)}/g,
        MethodPattern: RegExp = /\w+(\.\w+)*\(/g,
        ObjectAndMethod: RegExp = /{(\w+(\.\w+)*)}\.\w+\(\)/g,
        ObjectMethod: RegExp = /\.\w+\(\)/g,
        PropertyName: RegExp = /^\w+\w$/,
        ParameterPattern: RegExp = /\(.*(,\s*.*)*\)/g,
        ZDate: RegExp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g,
        UTCDate: RegExp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/i;

    export function Replace(patternToLookFor: RegExp, sourceString: string, sourceObjectOrArray?: any, trimFromResultPattern?: boolean) {
        var matches = sourceString.match(patternToLookFor);
        if (matches) {

            var regMatches = new Array();
            matches.forEach(m=> {
                regMatches.push({
                    Match: m,
                    PropertyName: m.replace(RegularExpression.StandardBindingWrapper, "")
                });
            });
            if (Is.Array(sourceObjectOrArray)) {
                regMatches.forEach(r=> {
                    for (var j = 0; j < sourceObjectOrArray.length; j++) {
                        if (sourceObjectOrArray[j] &&
                            sourceObjectOrArray[j].hasOwnProperty(r.PropertyName)) {
                            sourceString = sourceString.replace(r.Match, sourceObjectOrArray[j][r.PropertyName])
                            break;
                        }
                    }
                });
            }
            else {
                for (var i = 0; i < regMatches.length; i++) {
                    if (sourceObjectOrArray &&
                        sourceObjectOrArray.hasOwnProperty(regMatches[i].PropertyName)) {
                        sourceString = sourceString.replace(regMatches[i].Match, sourceObjectOrArray[regMatches[i].PropertyName])
                    }
                }
            }
        }
        return sourceString;
    }
}