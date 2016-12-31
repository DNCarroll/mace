Date.prototype.Add = function (years, months, days, hours, minutes, seconds) {
    years = years ? years : 0;
    months = months ? months : 0;
    days = days ? days : 0;
    hours = hours ? hours : 0;
    minutes = minutes ? minutes : 0;
    seconds = seconds ? seconds : 0;
    return new Date(this.getFullYear() + years, this.getMonth() + months, this.getDate() + days, this.getHours() + hours, this.getMinutes() + minutes, this.getSeconds() + seconds, this.getMilliseconds());
};
//# sourceMappingURL=Date.js.map