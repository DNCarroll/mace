class WindowLoaded {
    constructor(loadedEvent: (e, onCompleteCallback: () => void) => any, shouldRunBeforeNavigation: boolean) {
        this.LoadedEvent = loadedEvent;
        this.ShouldRunBeforeNavigation = shouldRunBeforeNavigation;
        Initializer.WindowLoaded = this;
    }
    LoadedEvent: (e, onCompleteCallback: () => void) => any;
    ShouldRunBeforeNavigation: boolean;
}