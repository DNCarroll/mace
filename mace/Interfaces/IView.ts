﻿interface IView extends IEventDispatcher<IView> {
    Url: () => string;
    Show: (route: ViewInstance) => void;
    ContainerID: () => string;
    CacheStrategy: CacheStrategy;
    Cache: (strategy: CacheStrategy) => void;
}
interface IBinder extends IEventDispatcher<IBinder> {
    Add(obj: IObjectState);
    Execute: (viewInstance: ViewInstance) => void;
    Dispose: () => void;
    Element: HTMLElement;
    DataObjects: Array<IObjectState>;
    Save(obj: IObjectState);
    SaveDirty();
    RunWhenObjectsChange: () => void;
    OnBindingComplete: () => void;
    Delete(sender: HTMLElement, ajaxDeleteFunction: (a: CustomEventArg<Ajax>) => void);
}