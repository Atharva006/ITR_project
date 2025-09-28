// Get references to the HTML elements
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const myIdSpan = document.getElementById('my-id');
const peerIdInput = document.getElementById('peer-id-input');
const callBtn = document.getElementById('call-btn');
const remotePeerTitle = document.getElementById('remote-peer-title');

let localStream;
let peer;

// Initialize PeerJS. The undefined first argument lets the server assign a random ID.
// The host and port point to the free PeerJS cloud server.
peer = new Peer(undefined, {
    host: '0.peerjs.com',
    port: 443,
    path: '/'
});

// --- 1. Event listener for when our Peer connection is open ---
peer.on('open', id => {
    // When we connect to the signaling server, display our unique ID
    console.log('My PeerJS ID is:', id);
    myIdSpan.textContent = id;
});

// --- 2. Get user's camera and microphone access ---
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    // Store our stream so we can send it to the other person
    localStream = stream;
    // Display our own video in the 'local-video' element
    localVideo.srcObject = stream;
}).catch(error => {
    console.error("Failed to get local stream", error);
    alert("You must allow access to your camera and microphone.");
});

// --- 3. Listen for incoming calls ---
peer.on('call', call => {
    console.log('Receiving a call from', call.peer);
    remotePeerTitle.textContent = `Participant (${call.peer})`;

    // When we receive a call, we must answer it and send our own video stream
    call.answer(localStream);

    // When the other person's video stream arrives, display it
    call.on('stream', remoteStream => {
        remoteVideo.srcObject = remoteStream;
    });
});

// --- 4. Handle the "Call" button click ---
callBtn.addEventListener('click', () => {
    const remotePeerId = peerIdInput.value.trim();
    if (remotePeerId) {
        console.log('Calling peer:', remotePeerId);
        remotePeerTitle.textContent = `Participant (${remotePeerId})`;
        // Start the call and send our local video stream
        const call = peer.call(remotePeerId, localStream);

        // When the other person's video stream arrives, display it
        call.on('stream', remoteStream => {
            remoteVideo.srcObject = remoteStream;
        });
    } else {
        alert("Please enter the participant's ID.");
    }
});

// --- 5. Handle errors ---
peer.on('error', err => {
    console.error('PeerJS error:', err);
    alert('An error occurred: ' + err.message);
});