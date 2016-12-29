module Is {
    export function Array(value): boolean {
        return Object.prototype.toString.call(value) === '[object Array]';
    }

    export function Chrome(): boolean {
        var w = <any>window;
        return w.chrome;
    }
    export function EmptyObject(obj): boolean {
        for (var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }
        return true;
    }
    export function FireFox(): boolean {
        if (navigator) {
            return /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent);
        }
        return false;
    }
    export function Function(obj): boolean {
        var getType = {};
        return obj && getType.toString.call(obj) === '[object Function]';
    }
    export function NullOrEmpty(value): boolean {
        if (value == null) {
            return true;
        }
        else if (value.length == 0) {
            return true;
        }
    }
    export function Numeric(input: string): boolean {
        var RE = /^-{0,1}\d*\.{0,1}\d+$/;
        return (RE.test(input));
    }

    export function Object(value) {
        return value && typeof value === 'object';
    }
    export function Property(property, inObject): boolean {
        try {
            return typeof (inObject[property]) !== 'undefined';
        } catch (e) {
            window.Exception(e);
        }
        return false;
    }
    export function String(value) {
        return typeof value === 'string';
    }    
    export function Style(value: string) {
        for (var prop in document.body.style) {
            if (prop.toLowerCase() === value.toLowerCase()) {
                return true;
            }
        }
        return false;
    }
    export function ValidDate(value) {
        try {
            if (Object.prototype.toString.call(value) === "[object Date]") {
                return isNaN(value.getTime()) ? false : true;
            }
            else if (String(value)) {
                var objDate = new Date(value);
                var parts = value.split("/");
                var year = parseInt(parts[2]);
                var month = parseInt(parts[0].indexOf("0") == 0 ? parts[0].substring(1) : parts[0]);
                var day = parseInt(parts[1].indexOf("0") == 0 ? parts[1].substring(1) : parts[1]);
                return objDate.getFullYear() != year || objDate.getMonth() != month - 1 || objDate.getDate() != day ? false : true;
            }

        } catch (e) {
            window.Exception(e);
        }
        return false;
    }
    export function ValidEmail(address: string) {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        return !reg.test(address) ? false : true;
    }
} 