//reviewed and updated NC - 2015-04-02
interface Date {
    Add(y?: number, m?: number, d?: number, h?: number, mm?: number, s?: number): Date;            
}
Date.prototype.Add = function (y?: number, m?: number, d?: number, h?: number, mm?: number, s?: number): Date {
    y = y ? y : 0;
    m = m ? m : 0;
    d = d ? d : 0;
    h = h ? h : 0;
    mm = mm ? mm : 0;
    s = s ? s : 0;
    var t = this;
    return new Date(t.getFullYear() + y, t.getMonth() + m, t.getDate() + d, t.getHours() + h,
        t.getMinutes() + mm, t.getSeconds() + s, t.getMilliseconds());
};
