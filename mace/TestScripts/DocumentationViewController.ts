class DocumentationContainer extends SingleViewContainer {
    private static instance: DocumentationContainer = new DocumentationContainer();
    constructor() {
        if (DocumentationContainer.instance) {
            return DocumentationContainer.instance;
        }
        super();
        this.IsDefault = true;
    }
}
