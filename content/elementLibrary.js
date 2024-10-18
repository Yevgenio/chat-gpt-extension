class ElementNode {
    constructor(name, rootNode, path, relatedElements = {}) {
        this.name = name; // The name of the element (e.g., 'article')
        this.rootNode = rootNode; // The root element object that this element is based on
        this.path = path; // Array of child indices to define the path from the root
        this.relatedElements = relatedElements; // Any additional related elements (e.g., shortcut buttons)
        this.element = null; // The actual DOM element reference

        this.children = []; // Child ElementNodes
        this.parent = null; // Parent ElementNode

        this.initialize(); // Attempt to define the element on creation
    }


    element() {
        if(!this.element) 
            this.element = traverseDOM(this.rootNode, this.path);
        
        return this.element;
    }

    // Traverse the DOM to find the element based on the given path
    traverseDOM(rootNode, path) {
        let currentElement = rootNode.element();

        for (let index of path) {
            if (currentElement && currentElement.children && currentElement.children.length > index) {
                currentElement = currentElement.children[index];
            } else {
                return null; // Path is invalid, return null
            }
        }
        return currentElement;
    }

    // Method to add a child element
    addChild(childNode) {
        childNode.parent = this; // Set this node as the parent of the child
        this.children.push(childNode);
    }

    // Method to get a related element
    getRelatedElement(name) {
        return this.relatedElements[name] || null;
    }

    // Method to set a related element
    setRelatedElement(name, element) {
        this.relatedElements[name] = element;
    }

    // Utility to check if the element is defined
    isDefined() {
        return !!this.element;
    }
}

// Example usage:
// Define the root node (bodyContainer)
const bodyContainerNode = new ElementNode('bodyContainer', null, []);

// Define an article node, with bodyContainer as the root, and a specific path
const articleNode = new ElementNode('article', bodyContainerNode, [0, 1, 2]);

// Add articleNode as a child of bodyContainerNode
bodyContainerNode.addChild(articleNode);

// Accessing the article element
if (!articleNode.isDefined()) {
    articleNode.redefine(); // Try to redefine if not defined
}
console.log('Article element:', articleNode.element);



function traverseDOM(root, path) {
    let currentElement = root;

    // Iterate through the path and access the specific children
    for (let i = 0; i < path.length; i++) {
        if (currentElement && currentElement.children && currentElement.children.length > path[i]) {
            currentElement = currentElement.children[path[i]];
        } else {
            return null; // Return null if the path is invalid
        }
    }
    return currentElement;
}

// elementHelper.js
const elementLibrary = {
    bodyContainer: null,
    sidebarContainer: null,
    chatContainer: null,
    shortcutContainer: null,
    articleContainer: null,
    articles: new Map() // Map to store articles by some identifier
};

// Initialize references to the main containers
function initializeElementLibrary() {
    elementLibrary.bodyContainer = document.querySelector('body'); // Adjust the selector if needed
    elementLibrary.sidebarContainer = document.querySelector('.sidebar-container'); // Replace with actual selector
    elementLibrary.chatContainer = document.querySelector('.chat-container'); // Replace with actual selector
    elementLibrary.shortcutContainer = document.querySelector('.shortcut-container'); // Replace with actual selector
}

function updateArticles() {
    elementLibrary.articleContainer = document.querySelector('.shortcut-container'); // Replace with actual selector
} 

// Basic access functions
function getBodyContainer() {
    return elementLibrary.bodyContainer;
}

function getSidebarContainer() {
    return elementLibrary.sidebarContainer;
}

function getChatContainer() {
    return elementLibrary.chatContainer;
}

function getShortcutContainer() {
    return elementLibrary.shortcutContainer;
}

// Article-related functions
function addArticle(articleId, articleElement) {
    elementLibrary.articles.set(articleId, {
        element: articleElement,
        //controlPanel: articleElement.querySelector('.control-panel') // Adjust selector
    });
}

function getArticle(articleId) {
    return elementLibrary.articles.get(articleId);
}

function getArticleControlPanel(articleId) {
    const article = getArticle(articleId);
    return article ? article.controlPanel : null;
}

function isAgent(articleElement) {
    // Replace with actual logic to determine if an article is from the agent
    return articleElement.classList.contains('agent-response');
}

// Cache management
function refreshElementLibrary() {
    initializeElementLibrary(); // Re-initialize the cache if needed
}
