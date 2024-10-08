// Run `manipulateMessages` on page load to apply changes to existing messages
document.addEventListener('DOMContentLoaded', () => {
    manipulateMessages();
});

// Observer to monitor dynamic content (new messages or conversation changes)
const observer = new MutationObserver((mutations) => {
    let newContentDetected = false;

    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
                if (node.tagName.toLowerCase() === 'article') {
                    newContentDetected = true;  // Detect new articles
                } else if (node.querySelectorAll && node.querySelectorAll('article').length > 0) {
                    newContentDetected = true;  // Detect any container that contains articles
                }
            }
        });

        mutation.removedNodes.forEach(node => {
            if (node.nodeType === 1 && node.querySelectorAll && node.querySelectorAll('article').length > 0) {
                newContentDetected = true;  // Detect when articles are removed (e.g., conversation switch)
            }
        });
    });

    if (newContentDetected) {
        manipulateMessages();  // Apply changes when new or removed content is detected
    }
});

// Start observing the document for changes
observer.observe(document.body, { childList: true, subtree: true });

// Function to manipulate articles (create scrollable container and shortcuts)
function manipulateMessages() {
    createScrollPercentageCircle();
    handleShortcutContainer();
}

// Function to create or update the shortcut container
function handleShortcutContainer() {
    const pageContainer = document.querySelector('body')?.children[1];

    // Check if the shortcutContainer already exists
    let shortcutContainer = document.getElementById('shortcutContainer');
    
    if (!shortcutContainer) {
        // If it doesn't exist, create a new one
        shortcutContainer = document.createElement('div');
        shortcutContainer.id = 'shortcutContainer';
        pageContainer.appendChild(shortcutContainer);
    }

    // Clear the existing contents of the shortcut container
    shortcutContainer.innerHTML = '';

    // Create the article shortcuts inside the shortcut container
    createArticleShortcuts(shortcutContainer);
}

// Create shortcut buttons for each article inside the container
function createArticleShortcuts(shortcutContainer) {
    const articles = document.querySelectorAll('article');
    const chatContainer = articles[0].parentElement.parentElement;

    articles.forEach((article, index) => {
        console.log(article.node);
        const shortcutButton = document.createElement('div');
        shortcutButton.classList.add('shortcutButton');  // Apply styles via CSS
        shortcutButton.innerText = index + 1;  // Number the buttons
        
        // Scroll to the article when the shortcut button is clicked
        shortcutButton.addEventListener('click', () => {
            const articleRect = article.getBoundingClientRect();
            const containerRect = chatContainer.getBoundingClientRect();
            const windowHeight = chatContainer.clientHeight;

            // Calculate the target scroll position inside the chat container so that the article's top is 20% from the top
            const targetScrollPosition = chatContainer.scrollTop + (articleRect.top - containerRect.top) - (windowHeight * 0.2);

            // Scroll the chat container smoothly to the calculated position
            chatContainer.scrollTo({
                top: targetScrollPosition,
                behavior: 'smooth'
            });
        });

        // Find the "Previous response" and "Next response" buttons in the article
        const previousResponseButton = article.querySelector('button[aria-label="Previous response"]');
        const nextResponseButton = article.querySelector('button[aria-label="Next response"]');
        if(previousResponseButton) {
            const proxyBranches = previousResponseButton.parentElement.cloneNode(true);
            const previousProxyButton = proxyBranches.querySelector('button[aria-label="Previous response"]');
            const nextProxyButton = proxyBranches.querySelector('button[aria-label="Next response"]');
            
            previousProxyButton.addEventListener('click', () => {
                previousResponseButton.click();  // Simulate the click on the original button
            });
            nextProxyButton.addEventListener('click', () => {
                nextResponseButton.click();  // Simulate the click on the original button
            });
            //proxyButton.classList.add('proxyButton');  

            // Simulate click on the original button when proxy button is clicked
            //proxyButton.addEventListener('click', () => {
            //    originalButton.click();  // Simulate the click on the original button
            //});

            // Append the proxy buttons inside the shortcut button
            shortcutButton.appendChild(proxyBranches);

        }

        shortcutContainer.appendChild(shortcutButton);
    });

    if (chatContainer) {
        // Attach the scroll event listener to the chat container only (remove window listener)
        chatContainer.addEventListener('scroll', updateShortcutPositions);
    }

    updateShortcutPositions();  // Initially position the buttons
}

// Update shortcut button positions based on scroll, using `in-view` class for styling
function updateShortcutPositions() {
    const articles = document.querySelectorAll('article');
    const shortcutButtons = document.querySelectorAll('.shortcutButton');
    const windowHeight = window.innerHeight;
    const viewTop = windowHeight * 0.25;
    const viewBottom = windowHeight * 0.75;

    let firstInViewIndex = null;

    articles.forEach((article, index) => {
        const articleRect = article.getBoundingClientRect();
        const shortcutButton = shortcutButtons[index];

        // Check if the article is in view
        const articleInView = !(articleRect.bottom < viewTop || articleRect.top > viewBottom);

        if (articleInView) {
            shortcutButton.classList.add('in-view');  // Add class when the article is in view
            //if (firstInViewIndex === null) 
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

// Create the scroll percentage circle
function createScrollPercentageCircle() {
    if (document.getElementById('scrollPercentageCircle')) return;  // Avoid re-creating the scroll circle if it already exists

    const scrollCircle = document.createElement('div');
    scrollCircle.id = 'scrollPercentageCircle';
    document.body.appendChild(scrollCircle);

    const chatContainer = document.querySelector('article')?.parentElement.parentElement;

    if (chatContainer) {
        updateScrollPercentage(chatContainer);
        chatContainer.addEventListener('scroll', () => updateScrollPercentage(chatContainer));
    }
}

// Update the scroll percentage based on the container's scroll position
function updateScrollPercentage(container) {
    const scrollCircle = document.getElementById('scrollPercentageCircle');
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight - container.clientHeight;
    let scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);
    scrollPercentage = isNaN(scrollPercentage) ? 0 : scrollPercentage;

    // Display the percentage inside the circle
    scrollCircle.innerText = `${scrollPercentage}%`;
}
