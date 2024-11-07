class ElementNode {
    constructor(name, element, rootNode, path) {
        this.name = name;
        this.element = element;
        this.rootNode = rootNode;
        this.path = path;
    }

    // Method to get the element, redefining if necessary
    getElement() {
        if (!this.element || this.element) {
            console.log(`Element ${this.name} is null, attempting to redefine.`);
            this.redefineElement();
        }
        return this.element;
    }

    // Redefine the element using the rootNode and path
    redefineElement() {
        if (!this.rootNode || !this.rootNode.getElement()) {
            console.log(`Root node or root node's element is undefined in element ${this.name}.`);
            return null;
        }

        if (!this.path) {
            // If no path is specified, use the root node's element directly
            this.element = this.rootNode.getElement();
        } else {
            // Attempt to traverse the DOM to find the element
            this.element = this.traverseDOM(this.rootNode.getElement(), this.path);
        }

        if (!this.element) {
            console.log(`Element ${this.name} could not be redefined.`);
        }
    }

    getChild(path) {
        const currentElement = this.getElement()
        if(!currentElement) {
            console.log(`Could not find child of ${this.name} element`)
            return null;
        }
        return this.traverseDOM(currentElement, path);

    }

    // Traverse the DOM to find the element based on the given path
    traverseDOM(root, path) {
        let currentElement = root;

        if (!root) {
            console.log(`Invalid root element for ${this.name}.`);
            return null;
        }

        for (let index of path) {
            if (currentElement && currentElement.children && currentElement.children.length > index) {
                currentElement = currentElement.children[index];
            } else {
                console.log(`In element ${this.name} path was not found: `, path);
                return null; // Return null if the path is invalid
            }
        }
        // console.log(`In element ${this.name} path was found: `, path);
        return currentElement;
    }
}


const nodeBodyContainer = new ElementNode("nodeBodyContainer", document.body, null, null);
const nodeLayoutContainer = new ElementNode("nodeLayoutContainer", null, nodeBodyContainer, [1]);
const nodeSidebarRootContainer = new ElementNode("nodeSidebarRootContainer", null, nodeLayoutContainer, [0]);
const nodeChatRootContainer = new ElementNode("nodeChatRootContainer", null, nodeLayoutContainer, [1]);
const nodeMain = new ElementNode("nodeMain", null, nodeChatRootContainer, [2]);
