var RegularExpression;
(function (RegularExpression) {
    RegularExpression.StandardBindingWrapper = /{|}/g, RegularExpression.StandardBindingPattern = /{(\w+(\.\w+)*)}/g, RegularExpression.MethodPattern = /\w+(\.\w+)*\(/g, RegularExpression.ObjectAndMethod = /{(\w+(\.\w+)*)}\.\w+\(\)/g, RegularExpression.ObjectMethod = /\.\w+\(\)/g, RegularExpression.PropertyName = /^\w+\w$/, RegularExpression.ParameterPattern = /\(.*(,\s*.*)*\)/g, RegularExpression.ZDate = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, RegularExpression.UTCDate = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/i;
    function Replace(patternToLookFor, sourceString, sourceObjectOrArray, trimFromResultPattern) {
        var matches = sourceString.match(patternToLookFor);
        if (matches) {
            var regMatches = new Array();
            matches.forEach(function (m) {
                regMatches.push({
                    Match: m,
                    PropertyName: m.replace(RegularExpression.StandardBindingWrapper, "")
                });
            });
            if (Is.Array(sourceObjectOrArray)) {
                regMatches.forEach(function (r) {
                    for (var j = 0; j < sourceObjectOrArray.length; j++) {
                        if (sourceObjectOrArray[j] &&
                            sourceObjectOrArray[j].hasOwnProperty(r.PropertyName)) {
                            sourceString = sourceString.replace(r.Match, sourceObjectOrArray[j][r.PropertyName]);
                            break;
                        }
                    }
                });
            }
            else {
                for (var i = 0; i < regMatches.length; i++) {
                    if (sourceObjectOrArray &&
                        sourceObjectOrArray.hasOwnProperty(regMatches[i].PropertyName)) {
                        sourceString = sourceString.replace(regMatches[i].Match, sourceObjectOrArray[regMatches[i].PropertyName]);
                    }
                }
            }
        }
        return sourceString;
    }
    RegularExpression.Replace = Replace;
})(RegularExpression || (RegularExpression = {}));
//# sourceMappingURL=RegularExpression.js.map