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
    var f = function (v) {
        return (v <= 9 ? '0' : '') + v.toString();
    };
    var d = f(this.getDate()), m = f(this.getMonth() + 1), y = this.getFullYear(), h = f(this.getHours()), M = f(this.getMinutes()), s = f(this.getSeconds());
    return '' + y + '-' + m + '-' + d + ' ' + h + ":" + M + ":" + s;
};
//# sourceMappingURL=Date.js.map