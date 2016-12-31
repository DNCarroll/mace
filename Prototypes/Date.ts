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
    return new Date(this.getFullYear() + years, this.getMonth() + months, this.getDate() + days, this.getHours() + hours,
        this.getMinutes() + minutes, this.getSeconds() + seconds, this.getMilliseconds());
};
