

// Function to create a folder structure
function createFolder(folderName) {
    const sidebarContainer = document.getElementsByTagName('ol')[0].parentElement;

    const folderContainer = document.createElement('div');
    folderContainer.classList.add('folder');
    

    const folderHeader = document.createElement('div');
    folderHeader.classList.add('folder-header');
    folderHeader.classList.add('p-2');

    const arrowIcon = document.createElement('span');
    arrowIcon.classList.add('arrow');
    arrowIcon.style.transform = 'rotate(90deg)'; // Default pointing right
    // arrowIcon.textContent = '▼'; 

    const folderList = document.createElement('ul');
    folderList.classList.add('folder-list');
    folderList.style.display = 'none'; // Initially hidden

    // Set folder header text
    folderHeader.textContent = folderName;
    folderHeader.prepend(arrowIcon); // Add the arrow before the folder name
    folderContainer.appendChild(folderHeader);
    folderContainer.appendChild(folderList);

    // Toggle functionality for the folder
    folderHeader.addEventListener('click', () => {
        const isOpen = folderList.style.display === 'block';
        folderList.style.display = isOpen ? 'none' : 'block';
        arrowIcon.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(180deg)'; // Rotate arrow
    });

    // Add the folder to the sidebar
    sidebarContainer.appendChild(folderContainer);
    return folderList; // Return folder list for adding items later
}


// Move a chat item to a folder
function moveChatToFolder(chatItem, folderList) {
    folderList.appendChild(chatItem); // Move chatItem to the folder's list
}

function startFolders() {
    // Assuming your sidebar container has an ID 'sidebarContainer'
    const sidebarContainer = document.getElementsByTagName('ol')[0].parentElement.parentElement;
    // Example usage
    const sampleFolder = createFolder('My Folder');
    const chatItems = sidebarContainer.querySelectorAll('li'); // Assuming <li> elements are the chat items

    // Move the first chat item to the sample folder
    if (chatItems.length > 0) {
        console.log("chatItems.length > 0");
        moveChatToFolder(chatItems[0], sampleFolder);
        moveChatToFolder(chatItems[3], sampleFolder);
        moveChatToFolder(chatItems[4], sampleFolder);
    }
}

console.log("starting timer");
setTimeout(() => {
    console.log("doing the thing");
    startFolders();
    console.log("done");
}, 5000)