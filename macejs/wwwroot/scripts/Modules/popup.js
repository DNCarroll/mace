var Popup;
(function (Popup) {
    function Show(ele, coord) {
        var cpup = Popup.Element;
        document.removeEventListener('click', Popup.Click);
        if (cpup !== ele) {
            Is.Alive(cpup) ? cpup.style.display = "none" : null;
            Popup.Element = ele;
        }
        else if (cpup.style.display === "") {
            Popup.Hide();
            return;
        }
        ele.style.display = coord && coord.displayOverride ? coord.displayOverride : "";
        ele.focus();
        if (Is.Alive(coord)) {
            Popup.SetCoord(ele, "left", coord);
            Popup.SetCoord(ele, "right", coord);
            Popup.SetCoord(ele, "top", coord);
            Popup.SetCoord(ele, "bottom", coord);
        }
        setTimeout(function () {
            document.addEventListener('click', Popup.Click);
        }, 1);
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
            Popup.Element.style.display = 'none';
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