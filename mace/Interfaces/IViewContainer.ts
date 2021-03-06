﻿interface IViewContainer {
    DocumentTitle: (route: ViewInstance) => string;
    IsDefault: boolean;
    Show: (route: ViewInstance) => void;
    Url: (route: ViewInstance) => string;
    UrlPattern: () => string;
    UrlReplacePattern: () => string;
    UrlTitle: (route: ViewInstance) => string;
    IsUrlPatternMatch: (url: string) => boolean;
    Views: Array<IView>;
    Name: string;
    Parameters:(url:string)=> Array<string>;
}