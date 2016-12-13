interface IView extends IEventDispatcher<IView> {
    ViewUrl: () => string;
    Show: (route: ViewInstance) => void;
    ContainerID: () => string;
    
}
interface IBinder extends IEventDispatcher<IBinder> {
    Execute: () => void;
    Dispose: () => void;
    Element: HTMLElement;
}