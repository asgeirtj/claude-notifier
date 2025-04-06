// Get DOM elements
const volumeSlider = document.getElementById('volume');
const volumeValue = document.getElementById('volume-value');
const testButton = document.getElementById('test-sound');

// Create audio element
const audio = new Audio(chrome.runtime.getURL('audio/notification.mp3'));
const defaultVolume = 80;

// Set initial values
volumeSlider.value = defaultVolume;
volumeValue.textContent = defaultVolume;
audio.volume = defaultVolume / 100;

// Update volume display and notify content script
volumeSlider.addEventListener('input', function() {
    const newVolume = this.value;
    volumeValue.textContent = newVolume;
    audio.volume = newVolume / 100;
    
    // Notify content script if we're on claude.ai
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].url?.includes('claude.ai')) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'UPDATE_VOLUME',
                volume: newVolume
            });
        }
    });
});

// Test sound button
testButton.addEventListener('click', function() {
    audio.currentTime = 0;
    audio.play();
});
