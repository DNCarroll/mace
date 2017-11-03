module Is {
    export function Array(value): boolean {
        return Object.prototype.toString.call(value) === '[object Array]';
    }
    export function NullOrEmpty(value): boolean {
        return value === undefined ||
            value === null ||
            (typeof value === "string" && value.length === 0);
    }
} 
module Has {
    export function Properties(inObject: any, ...properties): boolean {
        var p = properties;
        for (var i = 0; i < p.length; i++) {
            if (inObject[p[i]] === undefined) {
                return false;
            }
        }
        return true;
    }
}