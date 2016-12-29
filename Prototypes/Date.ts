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
    var y = this.getFullYear() + years;
    var m = this.getMonth() + months;
    var d = this.getDate() + days;
    var h = this.getHours() + hours;
    var mm = this.getMinutes() + minutes;
    var s = this.getSeconds() + seconds;
    var ms = this.getMilliseconds();
    return new Date(y, m, d, h, mm, s, ms);
};
