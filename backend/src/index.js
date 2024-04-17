const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

let roomId = null;

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', async (req, res) => {
  res.render('room', { roomId: roomId });
  //res.render('room', { roomId: req.params.room })
})


app.post('/createRoom', async (req, res) => {
  const roomId = await createRoom();
  res.json({ roomId });
})

io.on('connection', socket => {
  if(!roomId){
    roomId = uuidV4();
    socket.emit('roomID', roomId);
  }
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId); //join for the first time
    io.to(roomId).emit('user-connected', userId); 
    console.log('User id is ' + userId);   
    console.log('Joined room with id ' + roomId);

    socket.on('exit', () => {
      socket.leave(roomId); //disconnect
      io.to(roomId).emit('user-disconnected', userId);
      console.log('Disconnected from room with id ' + roomId);
    })

  })
})

server.listen(3001)