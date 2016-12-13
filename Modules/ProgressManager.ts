module ProgressManager {
    export var ProgressElement: HTMLElement = null;
    export function Show() {
        if (ProgressManager.ProgressElement) {
            ProgressManager.ProgressElement.style.display = "inline";
        }
    }
    export function Hide() {
        if (ProgressManager.ProgressElement != null) {
            ProgressManager.ProgressElement.style.display = "none";
        }
    }
}