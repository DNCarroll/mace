Date.prototype.Add = function (y, m, d, h, mm, s) {
    y = y ? y : 0;
    m = m ? m : 0;
    d = d ? d : 0;
    h = h ? h : 0;
    mm = mm ? mm : 0;
    s = s ? s : 0;
    var t = this;
    return new Date(t.getFullYear() + y, t.getMonth() + m, t.getDate() + d, t.getHours() + h, t.getMinutes() + mm, t.getSeconds() + s, t.getMilliseconds());
};
Date.prototype.ToyyyymmddHHMMss = function () {
    var t = this;
    var f = function (v) {
        return (v <= 9 ? '0' : '') + v.toString();
    };
    var d = f(t.getDate()), m = f(t.getMonth() + 1), y = t.getFullYear(), h = f(t.getHours()), M = f(t.getMinutes()), s = f(t.getSeconds());
    return '' + y + '-' + m + '-' + d + ' ' + h + ":" + M + ":" + s;
};
//# sourceMappingURL=Date.js.map