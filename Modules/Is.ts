module Is {
    export function Array(value): boolean {
        return Object.prototype.toString.call(value) === '[object Array]';
    }
    export function NullOrEmpty(value): boolean {
        return value == null || (value.length && value.length === 0);
    }
    export function String(value) {
        return typeof value === 'string';
    }  
} 
module Has {
    export function Properties(inObject: any, ...properties: Array<string>) {
        var ret = true;
        try {
            for (var i = 0; i < properties.length; i++) {
                var value = inObject[properties[i]];
                if (inObject[properties[i]] === undefined) {
                    ret = false;
                    break;
                }
            }
        } catch (e) {
            if (window.Exception) {
                window.Exception(e);
            }
        }
        return ret;
    }
}
