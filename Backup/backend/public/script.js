const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '0.peerjs.com',
  port: '443'
})
const { RTCPeerConnection } = window

const myVideo = document.createElement('video')
myVideo.muted = true
let myVideoStream;
const peers = {};

let peerConnection = null;

for(let i = 0; i < peers.length; i++){
  console.log('for-loopen funkar!');
  console.log(peers[i]);
}

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    console.log("connected");
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
  console.log("disconnected");
})

joinButton = () => {
  if(myPeer.id == null) {
    myPeer.id = undefined;
  }
  console.log('ROOM ID IS ' + ROOM_ID + ' WHEN JOINING');
  console.log('USER ID IS ' + myPeer.id);
  socket.emit('join-room', ROOM_ID, myPeer.id)
}

let button_is_pressed = 0; 
Boolean(button_is_pressed);

const buttonPress = () => {
  if(!button_is_pressed){
    console.log("Creating a room!");
    createRoom();
    button_is_pressed = 1;
  }
}

const disc = () => {
  socket.emit('exit', ROOM_ID, myPeer.id);
  console.log("exit function");
}

document.getElementById("connectButton").addEventListener("click", buttonPress);
document.getElementById("disconnectButton").addEventListener("click", disc);
document.getElementById("joinButton").addEventListener("click", joinButton);

const configuration = {
  isceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
}

async function createRoom(){
  console.log('Create room')
  peerConnection = new RTCPeerConnection(configuration);
  
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
    
  const roomWithOffer = {
    offer: {
      type: offer,
      sdp: offer.sdp
    }
  };
  socket.emit('Create room');
  console.log('Room was created with roomid: ' + roomId);
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}