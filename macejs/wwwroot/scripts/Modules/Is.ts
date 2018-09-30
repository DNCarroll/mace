module Is {
    export function Array(value): boolean {
        return Object.prototype.toString.call(value) === '[object Array]';
    }
    export function NullOrEmpty(value): boolean {
        return value === undefined ||
            value === null ||
            (typeof value === "string" && value.length === 0);
    }
    export function Number(value): boolean {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
    export function String(value): boolean {
        return typeof value === "string";
    }
    export function Alive(value): boolean {
        return value !== undefined && value !== null;
    }
    export function HTMLElement(o): boolean {
        return Is.Alive(o["tagName"]);
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