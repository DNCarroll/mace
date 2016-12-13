var Formatters;
(function (Formatters) {
    var DateTime;
    (function (DateTime) {
        DateTime.Token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g;
        DateTime.Timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
        DateTime.TimezoneClip = /[^-+\dA-Z]/g;
        DateTime.i18n = {
            dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        };
        DateTime.Masks = {
            "default": "ddd mmm dd yyyy HH:MM:ss",
            shortDate: "m/d/yy",
            mediumDate: "mmm d, yyyy",
            longDate: "mmmm d, yyyy",
            fullDate: "dddd, mmmm d, yyyy",
            shortTime: "h:MM TT",
            mediumTime: "h:MM:ss TT",
            longTime: "h:MM:ss TT Z",
            isoDate: "yyyy-mm-dd",
            isoTime: "HH:MM:ss",
            isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
            isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
        };
        function Pad(val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len)
                val = "0" + val;
            return val;
        }
        DateTime.Pad = Pad;
        function Format(date, mask, utc) {
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }
            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date();
            if (isNaN(date))
                throw SyntaxError("invalid date");
            mask = String(DateTime.Masks[mask] || mask || DateTime.Masks["default"]);
            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }
            var _ = utc ? "getUTC" : "get", d = date[_ + "Date"](), D = date[_ + "Day"](), m = date[_ + "Month"](), y = date[_ + "FullYear"](), H = date[_ + "Hours"](), M = date[_ + "Minutes"](), s = date[_ + "Seconds"](), L = date[_ + "Milliseconds"](), o = utc ? 0 : date.getTimezoneOffset(), flags = {
                d: d,
                dd: DateTime.Pad(d),
                ddd: DateTime.i18n.dayNames[D],
                dddd: DateTime.i18n.dayNames[D + 7],
                m: m + 1,
                mm: DateTime.Pad(m + 1),
                mmm: DateTime.i18n.monthNames[m],
                mmmm: DateTime.i18n.monthNames[m + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: DateTime.Pad(H % 12 || 12),
                H: H,
                HH: DateTime.Pad(H),
                M: M,
                MM: DateTime.Pad(M),
                s: s,
                ss: DateTime.Pad(s),
                l: DateTime.Pad(L, 3),
                L: DateTime.Pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                Z: utc ? "UTC" : (String(date).match(DateTime.Timezone) || [""]).pop().replace(DateTime.TimezoneClip, ""),
                o: (o > 0 ? "-" : "+") + DateTime.Pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4)
            };
            return mask.replace(DateTime.Token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        }
        DateTime.Format = Format;
    })(DateTime = Formatters.DateTime || (Formatters.DateTime = {}));
    var Number;
    (function (Number) {
        function Comma(stringOrNumber) {
            stringOrNumber += '';
            var x = stringOrNumber.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        }
        Number.Comma = Comma;
        function Pad(value, length) {
            var str = '' + value;
            while (str.length < length) {
                str = '0' + str;
            }
            return str;
        }
        Number.Pad = Pad;
    })(Number = Formatters.Number || (Formatters.Number = {}));
})(Formatters || (Formatters = {}));
//# sourceMappingURL=Formatters.js.map