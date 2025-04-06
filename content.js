let currentVolume = 0.8;
let audioBuffer = null;

// Preload the audio file
fetch(chrome.runtime.getURL('audio/notification.mp3'))
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
        audioBuffer = arrayBuffer;
    })
    .catch(error => console.error('Error loading audio file:', error));

// Function to play notification sound
function playNotificationSound(isTest = false) {
    try {
        const audioContext = new AudioContext();
        audioContext.decodeAudioData(audioBuffer.slice(0), (buffer) => {
            const source = audioContext.createBufferSource();
            const gainNode = audioContext.createGain();
            
            source.buffer = buffer;
            gainNode.gain.value = currentVolume;
            
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            source.start(0);
        });
    } catch (error) {
        console.error('Error playing sound:', error);
    }
}

let stopButtonPresent = false;

// Monitor for Claude.ai responses
const observer = new MutationObserver((mutations) => {
    // Check current state of stop button using Claude.ai's button attributes
    const stopButton = document.querySelector('button[aria-label="Stop Response"]');
    const currentStopButtonPresent = !!stopButton;
    
    // If stop button was present before but now is gone, play sound
    if (stopButtonPresent && !currentStopButtonPresent) {
        playNotificationSound();
    }
    
    // Update state
    stopButtonPresent = currentStopButtonPresent;
});

// Start observing the chat container
function startObserving() {
    // Observe the entire body for maximum coverage
    observer.observe(document.body, { 
        childList: true, 
        subtree: true
    });
}

// Initialize when the page loads
startObserving();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'UPDATE_VOLUME') {
        currentVolume = message.volume / 100;
    } else if (message.type === 'TEST_SOUND') {
        playNotificationSound(true);
    }
});

// Re-initialize when navigation occurs (for single-page app)
document.addEventListener('navigationend', () => {
    startObserving();
});
