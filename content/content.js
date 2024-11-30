// Cache for the article elements and the observer flag
let articleElements = null;
let articlesCacheValid = false; // Keeps track of whether the cache is valid
let articleObserver = null;

// Cache for shortcut container and buttons
let shortcutContainer = null;
let shortcutButtons = null;

// Function to initialize the MutationObserver
function setupArticleObserver() {
    const mainContainer = getMainContainer();
    if (!mainContainer) return; // If main container not found, exit

    // Create a new MutationObserver
    articleObserver = new MutationObserver(() => {
        // Invalidate the cache when changes are detected
        articlesCacheValid = false;
        buttonCacheValid = false;
    });

    // Start observing the main container for changes in its child elements
    articleObserver.observe(mainContainer, { childList: true, subtree: true });
}

function getMainContainer() {
    if (!getMainContainer.container || !document.body.contains(getMainContainer.container)) {
        getMainContainer.container = document.body.querySelector("main");
        if (getMainContainer.container) {
            // Set up the MutationObserver when the main container is found
            setupArticleObserver();
        }
    }
    return getMainContainer.container;
}

function getArticleElements() {
    if (!articleElements || !articlesCacheValid) {
        // Re-query the articles if the cache is invalid
        const container = getMainContainer();
        if (container) {
            articleElements = Array.from(container.getElementsByTagName("article"));
            articlesCacheValid = true; // Mark the cache as valid
        } else {
            articleElements = []; // Return an empty array if the container is not found
        }
    }
    return articleElements;
}

function getShortcutContainer() {
    // Cache shortcut container if not already cached
    if (!shortcutContainer) {
        shortcutContainer = document.getElementById("shortcutContainer");
        if (!shortcutContainer) { //if doesent exist
            const pageContainer = document.body.children[2];
            shortcutContainer = buildElement('div',{id: 'shortcutContainer'});
            pageContainer.appendChild(shortcutContainer);
        }
        shortcutButtons = null; // Reset buttons cache if shortcut container is updated
    }
    return shortcutContainer;
}

function getShortcutButtons() {
    // If shortcut buttons are already cached, return them
    if (!shortcutButtons || !buttonCacheValid) { //not refreshing!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        const container = getShortcutContainer();
        if (container) {
            // Cache buttons as a static array
            shortcutButtons = Array.from(container.getElementsByClassName("shortcutButton"));
            buttonCacheValid = true;
        } else {
            shortcutButtons = []; // Return an empty array if container not found
        }
    }
    return shortcutButtons;
}


// Utility function to create an element with properties
function buildElement(tag, props = {}) {
    const elem = document.createElement(tag);
    Object.assign(elem, props);  // Assign properties
    return elem;
}

let timer;

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
        clearTimeout(timer);
        timer = setTimeout(() => {
            pageLoaded();
        } , 300)
    }
});

// Start observing the document for changes
observer.observe(document.body, { childList: true, subtree: true });

// Function to manipulate articles (create scrollable container and shortcuts)
function pageLoaded() {
    handleShortcutContainer();
}

// Function to create or update the shortcut container
function handleShortcutContainer() {
    // Check if the shortcutContainer already exists
    const shortcutContainer = getShortcutContainer();
    
    // Create the article shortcuts inside the shortcut container
    createArticleShortcuts(shortcutContainer);
}

// Create shortcut buttons for each article inside the container
function createArticleShortcuts(shortcutContainer) {
    const articles = getArticleElements();

    if(!articles[0])
        return;

    const chatContainer = articles[0].parentElement.parentElement;

    // Clear the existing contents of the shortcut container
    shortcutContainer.innerHTML = '';

    articles.forEach((article, index) => {
        createControlPanel(article, index, articles, chatContainer);

        // Determine if the article belongs to the user or the agent
        
        const isUser = index % 2 !== 1;

        const className = isUser ? 'shortcutButton user' : 'shortcutButton agent';
        const shortcutButton = buildElement('div', { classList: className, innerText: index + 1 });

        shortcutContainer.appendChild(shortcutButton);
        
        // Scroll to the article when the shortcut button is clicked
        shortcutButton.addEventListener('click', () => {
            scrollToArticle(article, chatContainer);
        });

        handleShortcutHover(article, shortcutButton,isUser);
        handleBranchShortcuts(article, chatContainer, shortcutContainer);
    });

    if (chatContainer) {
        chatContainer.addEventListener('scroll', updateShortcutPositions);
    }

    updateShortcutPositions();  // Initially position the buttons
}

function handleShortcutHover(article, shortcutButton, isUser) {
    // Create the preview popup element as a sibling of the shortcut button
    const className = isUser ? 'previewPopup user' : 'previewPopup agent';
    const previewPopup = buildElement('div', { classList: className});

    shortcutButton.appendChild(previewPopup);

    // Fetch the content for the preview on hover
    shortcutButton.addEventListener('mouseenter', () => {
    // ================================================================================================
    // const messageElement = article.querySelector('[data-message-author-role]');
    // const isUser = messageElement?.getAttribute('data-message-author-role') === 'user';     
    // ================================================================================================

        const response = article.querySelector('[data-message-author-role]');
        previewPopup.innerHTML = isUser ? response.firstChild.firstChild.innerHTML : response.innerHTML;
        //error: Cannot read properties of null (reading 'firstChild')
        previewPopup.style.display = "block";
        const rect = shortcutButton.getBoundingClientRect();
        previewPopup.style.top = `${rect.top}px`;
        previewPopup.style.left = `${rect.left - previewPopup.offsetWidth}px`; // Position to the left of the button

    
    });

    // Clear the preview content when the mouse leaves
    shortcutButton.addEventListener('mouseleave', () => {
        previewPopup.innerHTML = '';
        previewPopup.style.display = "none"
    });

}

function handleBranchShortcuts(article, chatContainer, shortcutContainer) {
    // Handle "Previous response" and "Next response" buttons
    const previousResponseButton = article.querySelector('button[aria-label="Previous response"]');
    const nextResponseButton = article.querySelector('button[aria-label="Next response"]');

    if (previousResponseButton || nextResponseButton) {
        const proxyBranches = previousResponseButton.parentElement.cloneNode(true);
        const previousProxyButton = proxyBranches.querySelector('button[aria-label="Previous response"]');
        const nextProxyButton = proxyBranches.querySelector('button[aria-label="Next response"]');

        previousProxyButton.addEventListener('click', () => {
            previousResponseButton.click();  // Simulate the click on the original button
        });
        nextProxyButton.addEventListener('click', () => {
            nextResponseButton.click();  // Simulate the click on the original button
        });

        handleBranchClick(previousResponseButton, article, chatContainer, shortcutContainer);
        handleBranchClick(nextResponseButton, article, chatContainer, shortcutContainer);

        shortcutContainer.appendChild(proxyBranches);
    }
}

// Function to prevent default scrolling when clicking the next or previous buttons
function handleBranchClick(branchButton, article, chatContainer, shortcutContainer) {
    branchButton.addEventListener('click', (event) => {
        
        // const defaultClassName = chatContainer.className;
        // console.log(`button clicked: ${defaultClassName}`);
        // chatContainer.className = "";

        // Prevent the default scroll behavior
        event.preventDefault();

        // Simulate the original button's functionality
        branchButton.click();  // Trigger the original click event on the button

        // Restore the previous scroll position
        // setTimeout(() => {
        //     scrollToArticle(article, chatContainer);
        // }, 2000);  // Delay to allow the DOM update

        setTimeout(() => {
            createArticleShortcuts(shortcutContainer);  // Refresh the shortcut container on response change
        }, 300);  // Add a short delay

        // chatContainer.className = defaultClassName;
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
    const articles = getArticleElements();
    
    const shortcutButtons = getShortcutButtons();

    const windowHeight = window.innerHeight;
    const viewTop = windowHeight * 0.2; //windowHeight * 0.3;
    const viewBottom = windowHeight * 0.2;// * 0.7;

    articles.forEach((article, index) => {
        
        const articleRect = article.getBoundingClientRect();
        const shortcutButton = shortcutButtons[index];

        if(!shortcutButton) {
            return;
        }
        // Check if the article is in view
        const articleInView = !(articleRect.bottom < viewTop || articleRect.top > viewBottom);

        if (articleInView) {
            shortcutButton.classList.add('in-view');  // Add class when the article is in view
            scrollToShortcut(shortcutButton);
        } else {
            shortcutButton.classList.remove('in-view');  // Remove class when the article is not in view
        }
    });
}

// Function to scroll the shortcut container to make the button of the first article in view visible
function scrollToShortcut(shortcutButton) {
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
    if (targetElement) 
        targetElement.appendChild(controlPanelContainer);

    chatContainer.addEventListener('scroll', handleControlPanelScroll);
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
    const articles = getArticleElements();

    if(!articles || !articles[0]) return;

    const chatContainer = articles[0].parentElement;
    const controlPanelContainers = chatContainer.querySelectorAll('div.controlPanelContainer');

    controlPanelContainers.forEach((container) => {
        const controlPanel = container.querySelector('div.controlPanel');
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

// const REGEX_CLASS_SCROLL_TO_BOTTOM = /react-scroll-to-bottom/g,
//     SELECTOR_SCROLL_TO_BOTTOM = '[class^="react-scroll-to-bottom"]',
//     CLASS_REPLACEMENT = "dont-scroll-to-bottom";

// // Scroll-to-bottom mutation observer
// new MutationObserver(() => {
//     document.querySelectorAll(SELECTOR_SCROLL_TO_BOTTOM).forEach((element) => {
//         element.className = element.className.replace(REGEX_CLASS_SCROLL_TO_BOTTOM, CLASS_REPLACEMENT);
//         element.style.overflowY = "auto";
//     });

// }).observe(document.body, { childList: true, subtree: true });

// function disableAutoScroll() {
//     const defaultChatScrollElement = nodeMain.getElement([0,0,0,0,0]);
//     defaultChatScrollElement.className = "scroll-bar";
//     console.log(defaultChatScrollElement);

//     const newChatScrollElement = defaultChatScrollElement.parentElement;
//     newChatScrollElement.style.overflowY = "auto";
//     console.log(newChatScrollElement);
// }


//////////////////////////////////////////////////////////
// const container = getMainContainer();
// const observer2 = new MutationObserver((mutations) => {
//     for (const mutation of mutations) {
//         if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
//             // Temporarily disable scrolling by saving and restoring scroll position
//             const currentScroll = container.scrollTop;
//             console.log(mutation);

//             // Check if the scroll is at the bottom to selectively disable
//             if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
//                 container.scrollTop = currentScroll; // Reset scroll position to prevent scroll to bottom
//             }
//         }
//     }
// });

// // Start observing
// observer2.observe(container, { attributes: true, attributeFilter: ['class'] });
