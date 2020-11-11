var Placement;
(function (Placement) {
    Placement[Placement["LeftTop"] = 0] = "LeftTop";
    Placement[Placement["LeftBottom"] = 1] = "LeftBottom";
    Placement[Placement["RightTop"] = 2] = "RightTop";
    Placement[Placement["RightBottom"] = 3] = "RightBottom";
    Placement[Placement["CenterLeft"] = 4] = "CenterLeft";
    Placement[Placement["CenterRight"] = 5] = "CenterRight";
})(Placement || (Placement = {}));
var Popup;
(function (Popup) {
    function Show(ele, coord) {
        var cpup = Popup.Element;
        document.removeEventListener('click', Popup.Click);
        Is.Alive(cpup) ? cpup.style.visibility = "hidden" : null;
        Popup.Element = ele;
        var isFun = Is.Alive(coord) && Is.Func(coord);
        ele.style.visibility = "visible";
        var tempC = Is.Alive(coord) && Is.Func(coord) ? coord() : coord;
        if (Is.Alive(tempC)) {
            Popup.SetCoord(ele, "left", tempC);
            Popup.SetCoord(ele, "right", tempC);
            Popup.SetCoord(ele, "top", tempC);
            Popup.SetCoord(ele, "bottom", tempC);
        }
        setTimeout(function () {
            document.addEventListener('click', Popup.Click);
        }, 1);
        ele.focus();
    }
    Popup.Show = Show;
    function SetCoord(ele, attr, coord) {
        if (Is.Alive(coord) &&
            Is.Alive(coord[attr]) &&
            coord[attr] > 0) {
            ele.style[attr] = coord[attr] + "px";
        }
    }
    Popup.SetCoord = SetCoord;
    function Hide() {
        if (Popup.Element) {
            Popup.Element.style.visibility = 'hidden';
            Popup.Element = null;
        }
    }
    Popup.Hide = Hide;
    function Click(event) {
        var cpup = Popup.Element;
        if (Is.Alive(cpup) && !cpup.contains(event.target)) { // or use: event.target.closest(selector) === null            
            Popup.Hide();
            document.removeEventListener('click', Popup.Click);
        }
    }
    Popup.Click = Click;
})(Popup || (Popup = {}));
//# sourceMappingURL=popup.js.map