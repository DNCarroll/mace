module Is {
    export function Array(value): boolean {
        return Object.prototype.toString.call(value) === '[object Array]';
    }
    export function NullOrEmpty(value): boolean {
        return value == null || (value.length && value.length === 0);
    }
} 
module Has {
    export function Properties(inObject: any, ...properties): boolean {
        for (var i = 0; i < properties.length; i++) {
            if (inObject[properties[i]] === undefined) {
                return false;
            }
        }
        return true;
    }
}