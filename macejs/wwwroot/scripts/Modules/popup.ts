enum Placement {
    LeftTop, LeftBottom, RightTop, RightBottom, CenterLeft, CenterRight
}
module Popup {
    export var Element: HTMLElement;
    export function Show(ele: HTMLElement, coord?: any) {
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
        setTimeout(() => {
            document.addEventListener('click', Popup.Click);
        }, 1);
        ele.focus();
    }
    export function SetCoord(ele: HTMLElement, attr: string, coord?: { left?: number, right?: number, top?: number, bottom?: number }) {
        if (Is.Alive(coord) &&
            Is.Alive(coord[attr]) &&
            coord[attr] > 0) {
            ele.style[attr] = coord[attr] + "px";
        }
    }
    export function Hide() {
        if (Popup.Element) {
            Popup.Element.style.visibility = 'hidden';
            Popup.Element = null;
        }
    }
    export function Click(event) {
        var cpup = Popup.Element;
        if (Is.Alive(cpup) && !cpup.contains(event.target)) { // or use: event.target.closest(selector) === null            
            Popup.Hide();
            document.removeEventListener('click', Popup.Click);
        }
    }
}