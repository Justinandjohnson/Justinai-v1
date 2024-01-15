// Global variable to track the state of the text-to-speech feature
let isTextToSpeechEnabled = false;

// Function to toggle text-to-speech feature
function toggleTextToSpeech() {
    isTextToSpeechEnabled = !isTextToSpeechEnabled;
    console.log("Text-to-Speech Toggled: " + isTextToSpeechEnabled);
}

// Function to speak text
function speakText(text) {
    if (isTextToSpeechEnabled) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    }
}

// Function to create a button
function createButton(text) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.position = 'absolute';
    button.style.display = 'none';
    button.style.zIndex = '1000';
    document.body.appendChild(button);
    return button;
}

// Create the buttons
const stopButton = createButton('Stop Speech');
const summarizeButton = createButton('Summarize');
const sayItButton = createButton('Say It');

// Create the summary div
const summaryDiv = document.createElement('div');
summaryDiv.style.position = 'absolute';
summaryDiv.style.display = 'none';
summaryDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black background
summaryDiv.style.color = 'white'; // White text color
summaryDiv.style.padding = '10px';
summaryDiv.style.borderRadius = '5px';
summaryDiv.style.maxWidth = '300px';
summaryDiv.style.wordWrap = 'break-word';
summaryDiv.style.zIndex = '1001';
document.body.appendChild(summaryDiv);

// Function to update button positions and visibility
function updateButtonPositions(rangeRect) {
    stopButton.style.left = `${rangeRect.left + window.scrollX}px`;
    stopButton.style.top = `${rangeRect.top + window.scrollY - stopButton.offsetHeight}px`;
    stopButton.style.display = 'block';

    summarizeButton.style.left = `${rangeRect.right + window.scrollX}px`;
    summarizeButton.style.top = `${rangeRect.top + window.scrollY}px`;
    summarizeButton.style.display = 'block';

    sayItButton.style.left = `${rangeRect.left + window.scrollX}px`;
    sayItButton.style.top = `${rangeRect.bottom + window.scrollY + 5}px`;
    sayItButton.style.display = 'block';
}

// Event listener for text selection
document.addEventListener('mouseup', event => {
    let selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
        let range = window.getSelection().getRangeAt(0).getBoundingClientRect();
        updateButtonPositions(range);
    } else {
        stopButton.style.display = 'none';
        summarizeButton.style.display = 'none';
        sayItButton.style.display = 'none';
        summaryDiv.style.display = 'none';
    }
});

// Event listener for the "Say It" button
sayItButton.addEventListener('click', () => {
    let selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        toggleTextToSpeech();
        speakText(selectedText);
    }
    stopButton.style.display = 'none';
    summarizeButton.style.display = 'none';
    sayItButton.style.display = 'none';
});

// Add click event to the stop button to stop speech and hide the button
stopButton.addEventListener('click', () => {
    speechSynthesis.cancel();
    stopButton.style.display = 'none';
    summarizeButton.style.display = 'none';
    sayItButton.style.display = 'none';
    summaryDiv.style.display = 'none';
});

// Event listener for the summarize button
summarizeButton.addEventListener('click', () => {
    let selectedText = window.getSelection().toString().trim();
    if  (selectedText) {
    chrome.runtime.sendMessage({type: 'summarizeText', text: selectedText}, (response) => {
        if (response && response !== 'Error: Unexpected response structure') {
            displaySummary(response, window.getSelection().getRangeAt(0).getBoundingClientRect());
        } else {
            console.error('No summary received:', response);
        }
    });
    stopButton.style.display = 'none';
    summarizeButton.style.display = 'none';
    sayItButton.style.display = 'none';
}
});

// Function to display the summary
function displaySummary(summary, rangeRect) {
    summaryDiv.textContent = summary;
    summaryDiv.style.left = `${rangeRect.left + window.scrollX}px`;
    summaryDiv.style.top = `${rangeRect.bottom + window.scrollY + 5}px`;
    summaryDiv.style.display = 'block';
}

// Create the Assistant Search button
const assistantButton = createButton('Assistant Search');
document.body.appendChild(assistantButton);

// Function to create a popup overlay
function createPopupOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'assistantSearchOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1002';
    overlay.style.display = 'none';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.textAlign = 'center';
    overlay.style.padding = '20px';

    // Close button for the overlay
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '20px';
    closeButton.addEventListener('click', () => {
        overlay.style.display = 'none';
    });
    overlay.appendChild(closeButton);
    return overlay;
}

// Create the popup overlay and append to body
const assistantSearchOverlay = createPopupOverlay();
document.body.appendChild(assistantSearchOverlay);

function updateButtonPositions(rangeRect) {
    stopButton.style.left = `${rangeRect.left + window.scrollX}px`;
    stopButton.style.top = `${rangeRect.top + window.scrollY - stopButton.offsetHeight}px`;
    stopButton.style.display = 'block';

    summarizeButton.style.left = `${rangeRect.right + window.scrollX}px`;
    summarizeButton.style.top = `${rangeRect.top + window.scrollY}px`;
    summarizeButton.style.display = 'block';

    sayItButton.style.left = `${rangeRect.left + window.scrollX}px`;
    sayItButton.style.top = `${rangeRect.bottom + window.scrollY + 5}px`;
    sayItButton.style.display = 'block';

    assistantButton.style.left = `${rangeRect.right + window.scrollX}px`;
    assistantButton.style.top = `${rangeRect.bottom + window.scrollY + 5}px`;
    assistantButton.style.display = 'block';
}
assistantButton.addEventListener('click', () => {
    let selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        chrome.runtime.sendMessage({type: 'assistantSearch', text: selectedText}, (response) => {
            if (response) {
                assistantSearchOverlay.textContent = "Assistant Response: " + response;
                assistantSearchOverlay.style.display = 'flex';
            } else {
                console.error('No response received from the Assistant');
            }
        });
    }
    hideAllButtons();
});

function hideAllButtons() {
    stopButton.style.display = 'none';
    summarizeButton.style.display = 'none';
    sayItButton.style.display = 'none';
    assistantButton.style.display = 'none';
}