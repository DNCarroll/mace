class UseOfAllTypeScriptObjectsContainer extends ViewContainer {
    private static instance: UseOfAllTypeScriptObjectsContainer = new UseOfAllTypeScriptObjectsContainer();
    constructor() {
        if (UseOfAllTypeScriptObjectsContainer.instance) {
            return UseOfAllTypeScriptObjectsContainer.instance;
        }
        super();
        this.Views.push(new UseOfAllTypeScriptObjectsView());        
    }
}