module Popup {
    export var Element: HTMLElement;
    export function Show(ele: HTMLElement, coord?: { left?: number, right?: number, top?: number, bottom?: number, displayOverride?: string }) {
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
        setTimeout(() => {
            document.addEventListener('click', Popup.Click);
        }, 1);
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
            Popup.Element.style.display = 'none'
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