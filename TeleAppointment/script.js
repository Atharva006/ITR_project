// Get references to the HTML elements
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const myIdSpan = document.getElementById('my-id');
const peerIdInput = document.getElementById('peer-id-input');
const callBtn = document.getElementById('call-btn');
const remotePeerTitle = document.getElementById('remote-peer-title');

let localStream;
let peer;

// --- Configuration ---
// The script will try the first ID. If it's taken, it will automatically use the second.
const testingIds = ['111111111', '222222222'];

let currentIdIndex = 0;

// Function to initialize PeerJS connection
function initializePeer(peerId) {
    peer = new Peer(peerId, {
        host: '0.peerjs.com',
        port: 443,
        path: '/'
    });

    // --- 1. Event listener for when our Peer connection is open ---
    peer.on('open', id => {
        console.log('My PeerJS ID is:', id);
        myIdSpan.textContent = id;
    });

    // --- 3. Listen for incoming calls ---
    peer.on('call', call => {
        console.log('Receiving a call from', call.peer);
        remotePeerTitle.textContent = `Participant (${call.peer})`;
        call.answer(localStream);
        call.on('stream', remoteStream => {
            remoteVideo.srcObject = remoteStream;
        });
    });
    
    // --- 5. Handle errors ---
    peer.on('error', err => {
        console.error('PeerJS error:', err);
        // If the ID is already taken, try the next one in the list
        if (err.type === 'unavailable-id' && currentIdIndex < testingIds.length - 1) {
            console.log(`ID ${testingIds[currentIdIndex]} is taken. Trying the next one.`);
            currentIdIndex++;
            initializePeer(testingIds[currentIdIndex]);
        } else {
             alert('An error occurred: ' + err.message);
        }
    });
}


// --- 2. Get user's camera and microphone access ---
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    localStream = stream;
    localVideo.srcObject = stream;
    // --- START THE CONNECTION ---
    // Now that we have the camera, try to connect with the first ID
    initializePeer(testingIds[currentIdIndex]);
}).catch(error => {
    console.error("Failed to get local stream", error);
    alert("You must allow access to your camera and microphone.");
});


// --- 4. Handle the "Call" button click ---
callBtn.addEventListener('click', () => {
    const remotePeerId = peerIdInput.value.trim();
    if (remotePeerId) {
        console.log('Calling peer:', remotePeerId);
        remotePeerTitle.textContent = `Participant (${remotePeerId})`;
        const call = peer.call(remotePeerId, localStream);
        call.on('stream', remoteStream => {
            remoteVideo.srcObject = remoteStream;
        });
    } else {
        alert("Please enter the participant's ID.");
    }
});