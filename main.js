
// Download Function Start.
function downloadEditorContent() {
    const editorContent = document.getElementById('editor').innerHTML;
    const blob = new Blob([editorContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'content.html'; // Default file name
    a.click();

    // Revoke the object URL to free memory
    URL.revokeObjectURL(url);
}
// Download Function Ends.

window.onload = () => {
    const editorContent = document.getElementById('editor');
    if (editorContent) {
        const editorData = localStorage.getItem('editorContent');
        if (editorData) {
            editorContent.innerHTML = editorData;
        }
    }
};

setInterval(function() {
    const editorContent = document.getElementById('editor');
    if (editorContent) {
        const content = editorContent.innerHTML;
        localStorage.setItem('editorContent', content);
    }
}, 1000);



// Format Function Start.
function formatText(command) {
    document.execCommand(command, false, null);
}
// Format Function End.

function insertLink() {
    var url = prompt("Enter the URL:", "https://");
    if (url) {
        document.execCommand('createLink', false, url);
    }
}

function blockquoteText(command) {
    // Get the selected text and the range of the selection
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    // Get the first selected range

    // Create a blockquote element
    const blockquote = document.createElement('blockquote');

    // Wrap the selected text in the blockquote element
    blockquote.appendChild(range.extractContents());

    // Insert the blockquote element back into the document at the selection's position
    range.insertNode(blockquote);
}


// Insert Table Function Start.
function insertTable(rows, cols) {
    // Check if the values are valid
    if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
        alert("Please enter valid row and column values.");
        return;
    }

    // Create table HTML
    let table = '<table border="1" style="width:100%;" class="table table-bordered table-striped">';

    // Generate rows and columns for the table
    for (let i = 0; i < rows; i++) {
        table += '<tr>';
        for (let j = 0; j < cols; j++) {
            table += `<td contenteditable="true">Row ${i + 1}, Col ${j + 1}</td>`;
        }
        table += '</tr>';
    }

    table += '</table>';

    // Get the editor element
    const editor = document.getElementById('editor');

    // Ensure that there is a selection in the editor before attempting to insert
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    // If the selection is empty, alert the user to place the cursor in the editor
    if (selection.rangeCount === 0) {
        alert('Please place the cursor in the editor before inserting a table.');
        return;
    }

    // Create a temporary div element and set its innerHTML to the table
    const div = document.createElement('div');
    div.innerHTML = table;

    // Insert the table at the current selection position
    range.deleteContents();  // Delete any selected content (if any)
    range.insertNode(div.firstChild);  // Insert the table element

    // Move the cursor to the end of the inserted table
    const newRange = document.createRange();
    newRange.setStartAfter(div.firstChild);
    newRange.setEndAfter(div.firstChild);
    selection.removeAllRanges();
    selection.addRange(newRange);

    // Focus back on the editor
    editor.focus();
}


// Insert Table Function End.

// Add heading or paragraph
document.getElementById('headingSelector').addEventListener('change', function () {
    const tagName = this.value;
    if (tagName) {
        document.execCommand('formatBlock', false, tagName);
    }
});

// Align text using the selected button
function alignText(command) {
    document.execCommand(command, false, null);
}

function showAlignmentOptions() {
    const option = document.getElementById('alignment-options');
    option.classList.add('show');
}

function hideAlignmentOptions() {
    const option = document.getElementById('alignment-options');
    option.classList.remove('show');
}


function applyList(type) {
    if (type === 'ordered') {
        document.execCommand('insertOrderedList');
    } else if (type === 'unordered') {
        document.execCommand('insertUnorderedList');
    }
}


// Function to insert the buttons dynamically
function insertTablesDynamically() {
    const container = document.getElementById('table-options');
    const rows = 6; // Number of rows
    const cols = 6; // Number of columns

    // Clear any existing buttons
    container.innerHTML = '';

    // Loop to create rows and columns of buttons
    for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= cols; col++) {
            // Create a button element
            const button = document.createElement('button');
            button.classList.add('table-button-select');
            button.innerHTML = `<i class="fa-regular fa-square"></i>`;


            button.setAttribute('data-row', row);
            button.setAttribute('data-col', col);

            button.addEventListener("click", function () {
                insertTable(row, col);
            })

            // Add hover effect to highlight buttons on hover
            button.addEventListener('mouseenter', function () {
                highlightButtons(row, col);
            });

            button.addEventListener('mouseleave', function () {
                removeHighlight();
            });

            // Append button to the container
            container.appendChild(button);
        }
    }
}

// Function to highlight buttons in the grid that form a rectangle
function highlightButtons(row, col) {
    const buttons = document.querySelectorAll('.table-button-select');

    // Loop over all buttons to apply highlights
    buttons.forEach((button) => {
        const buttonRow = parseInt(button.getAttribute('data-row'));
        const buttonCol = parseInt(button.getAttribute('data-col'));

        // Highlight all buttons that are in the rectangle from (1,1) to (row,col)
        if (buttonRow <= row && buttonCol <= col) {
            button.classList.add('highlighted');
        } else {
            button.classList.remove('highlighted');
        }
    });
}

// Function to remove the highlight from all buttons
function removeHighlight() {
    const buttons = document.querySelectorAll('.table-button-select');
    buttons.forEach((button) => {
        button.classList.remove('highlighted');
    });
}

// Call the insertTablesDynamically function to generate the buttons
insertTablesDynamically();


document.getElementById('editor').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const currentNode = range.startContainer;

        // If the cursor is inside a blockquote, handle the Enter key press
        if (currentNode.nodeType === 3 && currentNode.parentNode.tagName === 'BLOCKQUOTE') {
            event.preventDefault(); // Prevent default behavior (inserting <br>)

            // Create a new paragraph element
            const newPara = document.createElement('p');
            newPara.innerHTML = '&nbsp;'; // Add a non-breaking space to make it visible

            // Insert the new paragraph after the blockquote
            const blockquote = currentNode.parentNode;
            blockquote.parentNode.insertBefore(newPara, blockquote.nextSibling);

            // Move the cursor to the new paragraph
            const selection = window.getSelection();
            const range = document.createRange();
            range.setStart(newPara, 0);
            range.setEnd(newPara, 0);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
});

// Function to wrap selected text in a blockquote
function blockquoteText(command) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const blockquote = document.createElement('blockquote');

    // Wrap the selected text in the blockquote element
    blockquote.appendChild(range.extractContents());

    // Insert the blockquote element back into the document
    range.insertNode(blockquote);

}





function showImageUploadFeature() {
    const option = document.getElementById('upload-options');
    option.classList.add('showImageUploadFeature');
}

function hideImageUploadFeature() {
    const option = document.getElementById('upload-options');
    option.classList.remove('showImageUploadFeature');
}

function showTableOptions() {
    const option = document.getElementById('table-options');
    option.classList.add('show');
}

function hideTableOptions() {
    const option = document.getElementById('table-options');
    option.classList.remove('show');
}



function googleSearch(query) {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank');  // Opens the search in a new tab
}

