Date.prototype.Add = function (years, months, days, hours, minutes, seconds) {
    years = years ? years : 0;
    months = months ? months : 0;
    days = days ? days : 0;
    hours = hours ? hours : 0;
    minutes = minutes ? minutes : 0;
    seconds = seconds ? seconds : 0;
    var t = this;
    return new Date(t.getFullYear() + years, t.getMonth() + months, t.getDate() + days, t.getHours() + hours, t.getMinutes() + minutes, t.getSeconds() + seconds, t.getMilliseconds());
};
//# sourceMappingURL=Date.js.map