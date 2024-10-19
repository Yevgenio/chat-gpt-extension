// Utility function to create an element with properties
function buildElement(tag, props = {}) {
    const elem = document.createElement(tag);
    Object.assign(elem, props);  // Assign properties
    return elem;
}

function traverseDOM(root, path) {
    let currentElement = root;

    // Iterate through the path and access the specific children
    for (let i = 0; i < path.length; i++) {
        if (currentElement && currentElement.children && currentElement.children.length > path[i]) {
            currentElement = currentElement.children[path[i]];
        } else {
            console.log("not found path: ", root, path)
            return null; // Return null if the path is invalid
        }
    }
    return currentElement;
}


// Observer to monitor dynamic content (new messages or conversation changes)
const observer = new MutationObserver((mutations) => {
    let newContentDetected = false;

    mutations.forEach(mutation => {
        // Check added nodes for new articles or any changes within existing articles
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
                if (node.tagName.toLowerCase() === 'article') {
                    newContentDetected = true;  // Detect new articles
                } else if (node.querySelectorAll && node.querySelectorAll('article').length > 0) {
                    newContentDetected = true;  // Detect any container that contains articles
                }
            }
        });

        // Check if articles were removed
        mutation.removedNodes.forEach(node => {
            if (node.nodeType === 1 && node.querySelectorAll && node.querySelectorAll('article').length > 0) {
                newContentDetected = true;  // Detect when articles are removed (e.g., conversation switch)
            }
        });
    });

    // If any relevant mutations are detected, update the shortcut container
    if (newContentDetected) {
        manipulateMessages();  // Re-run to update shortcuts and proxy buttons
    }
});

// Start observing the document for changes
observer.observe(document.body, { childList: true, subtree: true });

// ========================================================================================================






const elementLibrary = {
    bodyContainer: null, //actual body element
    layoutContainer: null, //container with the sidebar and chat
    sidebarRootContainer: null, //all chats sidebar container
    chatRootContainer: null, 
    chatScrollContainer: null, 
    chatArticlesContainer: null, //all articles container
    articles: [] // List to store articles by identifier
}

function initializeElementLibrary() {
    const bodyContainer = document.body;
    const layoutContainer = traverseDOM(bodyContainer, [1]);
    const sidebarRootContainer = traverseDOM(layoutContainer, [0]);
    const chatRootContainer = traverseDOM(layoutContainer, [1]);
    const chatScrollContainer = traverseDOM(chatRootContainer, [2,0,0,0,0]);
    const chatArticlesContainer = traverseDOM(chatScrollContainer, [0,0]);

    elementLibrary.bodyContainer = bodyContainer;
    elementLibrary.layoutContainer = layoutContainer;
    elementLibrary.sidebarRootContainer = sidebarRootContainer;
    elementLibrary.chatRootContainer = chatRootContainer;
    elementLibrary.chatScrollContainer = chatScrollContainer;
    elementLibrary.chatArticlesContainer = chatArticlesContainer;
}

function updateArticleList() {
    
    if(!elementLibrary.chatArticlesContainer)
        initializeElementLibrary();

    const chatArticlesContainer = elementLibrary.chatArticlesContainer;

    const articles = [];

    // Iterate over all the direct children of the parentElement
    for (let i = 0; i < chatArticlesContainer.children.length; i++) {
        const child = chatArticlesContainer.children[i];
        // Check if the child is an article element
        if (child.tagName === 'ARTICLE') {
            articles.push(child);
        }
    }

    elementLibrary.articles = articles;
}

// Function to manipulate articles (create scrollable container and shortcuts)
function manipulateMessages() {

    updateArticleList();
    handleShortcutContainer();
}

// Function to create or update the shortcut container
function handleShortcutContainer() {
    const layoutContainer = elementLibrary.layoutContainer;

    // Check if the shortcutContainer already exists
    let shortcutContainer = document.getElementById('shortcutContainer');
    
    if (!shortcutContainer) { //if doesent exist
        shortcutContainer = buildElement('div',{id: 'shortcutContainer'});
        const resizerElement = buildElement('div',{id: 'resizer'});
        layoutContainer.appendChild(resizerElement);
        layoutContainer.appendChild(shortcutContainer);
    }

    // Create the article shortcuts inside the shortcut container
    createArticleShortcuts(shortcutContainer);
}

// Create shortcut buttons for each article inside the container
function createArticleShortcuts(shortcutContainer) {
    const articles = elementLibrary.articles;

    const chatContainer = articles ? articles[0].parentElement.parentElement : null;
    
    // Clear the existing contents of the shortcut container
    shortcutContainer.innerHTML = '';

    [...articles].slice(1).forEach((article, index) => {
        createControlPanel(article, index, articles, chatContainer);

        const shortcutButton = buildElement('div', {classList: 'shortcutButton', innerText: index + 1});
        
        // Scroll to the article when the shortcut button is clicked
        shortcutButton.addEventListener('click', () => {
            scrollToArticle(article, articles[0].parentElement.parentElement);
        });
        
        shortcutContainer.appendChild(shortcutButton);

        // Find the "Previous response" and "Next response" buttons in the article
        const previousResponseButton = article.querySelector('button[aria-label="Previous response"]');
        const nextResponseButton = article.querySelector('button[aria-label="Next response"]');

        if(previousResponseButton || nextResponseButton) {
            const proxyBranches = previousResponseButton.parentElement.cloneNode(true);
            const previousProxyButton = proxyBranches.querySelector('button[aria-label="Previous response"]');
            const nextProxyButton = proxyBranches.querySelector('button[aria-label="Next response"]');
            
            previousProxyButton.addEventListener('click', () => {
                previousResponseButton.click();  // Simulate the click on the original button
            });
            nextProxyButton.addEventListener('click', () => {
                nextResponseButton.click();  // Simulate the click on the original button
            });

            handleBranchChange(previousResponseButton, article, chatContainer, shortcutContainer)
            handleBranchChange(nextResponseButton, article, chatContainer, shortcutContainer)

            // shortcutButton.appendChild(proxyBranches);
            shortcutContainer.appendChild(proxyBranches);
        }
    });

    if (chatContainer) {
        chatContainer.addEventListener('scroll', updateShortcutPositions);
        chatContainer.addEventListener('scroll', handleControlPanelScroll);
    }

    updateShortcutPositions();  // Initially position the buttons
}

// Function to prevent default scrolling when clicking the next or previous buttons
function handleBranchChange(branchButton, article, chatContainer, shortcutContainer) {
    branchButton.addEventListener('click', (event) => {
        // Prevent the default scroll behavior
        event.preventDefault();

        // Simulate the original button's functionality
        branchButton.click();  // Trigger the original click event on the button

        // Restore the previous scroll position
        setTimeout(() => {
            scrollToArticle(article, chatContainer);
        }, 2000);  // Delay to allow the DOM update

        setTimeout(() => {
            createArticleShortcuts(shortcutContainer);  // Refresh the shortcut container on response change
        }, 300);  // Add a short delay
    });
}


// Function to scroll to a specific article
function scrollToArticle(article, chatContainer) {
    const articleRect = article.getBoundingClientRect();
    const containerRect = chatContainer.getBoundingClientRect();
    const windowHeight = chatContainer.clientHeight;

    // Calculate the target scroll position inside the chat container so that the article's top is 20% from the top
    const targetScrollPosition = chatContainer.scrollTop + (articleRect.top - containerRect.top) - (windowHeight * 0.15);

    // Scroll the chat container smoothly to the calculated position
    chatContainer.scrollTo({
        top: targetScrollPosition,
        behavior: 'smooth'
    });

    let articleResponse = article.children[1];
    const agentTurn = articleResponse.querySelector('.agent-turn');
    // ================================================================================================
    //    const userMessages = document.querySelectorAll('[data-message-author-role="user"]');
    //    const agentMessages = document.querySelectorAll('[data-message-author-role="assistant"]');
    // ================================================================================================
    if(agentTurn) {
        articleResponse = article.children[1]?.children[0]?.children[1];
    }
    else {
        for (let index = 0; index < 7; index++) {
            articleResponse = articleResponse.children[0];
        }
    }  

    //if(isInView) {} // NEEDS WORK
    setTimeout(() => {
        applyGlowEffect(articleResponse);
    }, 1000); 
}

// Update shortcut button positions based on scroll, using `in-view` class for styling
function updateShortcutPositions() {
    const articles = elementLibrary.articles;
    const shortcutButtons = document.querySelectorAll('.shortcutButton');
    const windowHeight = window.innerHeight;
    const viewTop = windowHeight * 0.2; //windowHeight * 0.3;
    const viewBottom = windowHeight * 0.2;// * 0.7;

    let firstInViewIndex = null;

    articles.forEach((article, index) => {
        const articleRect = article.getBoundingClientRect();
        const shortcutButton = shortcutButtons[index];

        // Check if the article is in view
        const articleInView = !(articleRect.bottom < viewTop || articleRect.top > viewBottom);

        if (articleInView) {
            shortcutButton.classList.add('in-view');  // Add class when the article is in view
            if (firstInViewIndex === null) 
                firstInViewIndex = index;  // Track the first article in view
        } else {
            shortcutButton.classList.remove('in-view');  // Remove class when the article is not in view
        }
    });

    // Scroll the shortcut container so that the first in-view button is visible
    if (firstInViewIndex !== null) {
        scrollToShortcut(firstInViewIndex);
    }
}

// Function to scroll the shortcut container to make the button of the first article in view visible
function scrollToShortcut(index) {
    const shortcutContainer = document.getElementById('shortcutContainer');
    const shortcutButton = document.querySelectorAll('.shortcutButton')[index];

    // Scroll the shortcut container to make the button visible
    const shortcutButtonTop = shortcutButton.offsetTop;
    const shortcutContainerScrollTop = shortcutContainer.scrollTop;
    const shortcutContainerHeight = shortcutContainer.clientHeight;
    const shortcutContainerMarginTop = shortcutContainerHeight * 0.3;
    const shortcutContainerMarginBottom = shortcutContainerHeight * 0.7;

    if (shortcutButtonTop < shortcutContainerScrollTop + shortcutContainerMarginTop) {
        // Scroll the container to bring the button into view
        shortcutContainer.scrollTo({
            top: shortcutButtonTop - shortcutContainerMarginTop,  // Center the button vertically
            behavior: 'smooth'
        });
    }

    else if (shortcutButtonTop > shortcutContainerScrollTop + shortcutContainerMarginBottom) {
        shortcutContainer.scrollTo({
            top: shortcutButtonTop - shortcutContainerMarginBottom,  // Center the button vertically
            behavior: 'smooth'
        });
    }
}

// Create control panel for each article with "up" and "down" buttons
function createControlPanel(article, index, articles, chatContainer) {
    // Avoid re-creating panel if exists in article
    if (article.querySelector('.controlPanelContainer')) return;  
    // Create the control panel container
    const controlPanelContainer = buildElement('div',{classList: 'controlPanelContainer'});
    const controlPanel = buildElement('div',{classList: 'controlPanel'});


    // Create the "Up" button
    const upButton = buildElement('button',{classList: 'upButton', innerText: '↑'});

    // Add event listener to scroll to the previous article when "up" is clicked
    upButton.addEventListener('click', () => {
        if (index > 0) {
            const previousArticle = articles[index - 1];
            scrollToArticle(previousArticle, chatContainer);
        }
    });

    // Create the "Down" button
    const downButton = buildElement('button',{classList: 'downButton', innerText: '↓'});

    // Add event listener to scroll to the next article when "down" is clicked
    downButton.addEventListener('click', () => {
        if (index < articles.length - 1) {
            const nextArticle = articles[index + 1];
            scrollToArticle(nextArticle, chatContainer);
        }
    });

    // Add the buttons to the control panel
    controlPanel.appendChild(upButton);
    controlPanel.appendChild(downButton);

    controlPanelContainer.appendChild(controlPanel);

    // Append the control panel to the article
    const targetElement = article.children[1].children[0];

    // Append controlPanel to the target element if it exists
    if (targetElement) {
        targetElement.appendChild(controlPanelContainer);
    } else {
        console.error('Target element not found.');
    }
}

// Function to position the control panel dynamically within its container
function adjustControlPanelPosition(controlPanelContainer, controlPanel) {
    // Get the boundaries of the controlPanelContainer
    const containerRect = controlPanelContainer.getBoundingClientRect();

    // Calculate available space for the control panel to move within the container
    const containerTop = containerRect.top;
    const containerBottom = containerRect.bottom;
    const containerHeight = containerRect.height;
    const panelHeight = controlPanel.getBoundingClientRect().height;

    // Calculate the scroll position and the window height
    const windowHeight = window.innerHeight; // NEED WORK => chatContainer?
    const scrollY = window.scrollY;

    // Calculate the new position for the control panel
    // let newTop = (windowHeight / 2) + scrollY - panelHeight / 2;
    let newTop = (windowHeight * 0.22) + scrollY - panelHeight / 2;

    // Ensure that the control panel stays within the container's top and bottom bounds
    if (newTop < containerTop + scrollY) {
        newTop = containerTop + scrollY;
    }
    if (newTop + panelHeight > containerBottom + scrollY) {
        newTop = containerBottom + scrollY - panelHeight;
    }

    // Apply the new position
    controlPanel.style.position = 'absolute';
    controlPanel.style.top = `${newTop - containerTop}px`;  // Position relative to the container
}

// Function to handle adjusting the control panel on page scroll
function handleControlPanelScroll() {
    const controlPanelContainers = document.querySelectorAll('.controlPanelContainer');

    controlPanelContainers.forEach((container) => {
        const controlPanel = container.querySelector('.controlPanel');
        if (controlPanel) {
            adjustControlPanelPosition(container, controlPanel);
        }
    });
}

// Function to apply a glow effect to an element
function applyGlowEffect(element) {

    if(!element) return;

    element.classList.add('glowPulseEffect');

    // Remove the glow class after the animation completes to avoid multiple triggers
    setTimeout(() => {
        element.classList.remove('glowPulseEffect');
    }, 1000);  // Matches the CSS animation duration (1s)
}