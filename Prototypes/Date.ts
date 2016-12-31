//reviewed and updated NC - 2015-04-02
interface Date {
    Add(years?:number, months?:number, days?:number, hours?:number, minutes?: number, seconds?:number): Date;            
}
Date.prototype.Add = function (years?: number, months?: number, days?: number, hours?: number, minutes?: number, seconds?: number): Date {
    years = years ? years : 0;
    months = months ? months : 0;
    days = days ? days : 0;
    hours = hours ? hours : 0;
    minutes = minutes ? minutes : 0;
    seconds = seconds ? seconds : 0;
    var t = this;
    return new Date(t.getFullYear() + years, t.getMonth() + months, t.getDate() + days, t.getHours() + hours,
        t.getMinutes() + minutes, t.getSeconds() + seconds, t.getMilliseconds());
};
