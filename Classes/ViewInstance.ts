class ViewInstance {    
    Parameters: Array<any>;
    ViewContainer: IViewContainer;    
    constructor(parameters: Array<any>, viewContainer: IViewContainer) {
        this.Parameters = parameters;        
        this.ViewContainer = viewContainer;
    }
}
