
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path')
const fs = require('fs')

const app = express();

const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("./"))

app.use(express.json());

app.get('/',(req,res)=>{

  res.sendFile(path.join(__dirname, './skeleton.html'))

})

app.get('/data.txt', (req, res) => {
  // Send the text file as the response
  res.sendFile(path.join(__dirname, 'dictionary.txt'));
});

app.post('/update',(req,res)=>{

  let data = req.body

  updateServer(data)

  populateHand(clients.get(data.clientID))

  if (checkIfBagEmpty(clients.get(data.clientID).room)){

    clients.get(data.clientID).room.hostSocket.emit('bag empty')
    clients.get(data.clientID).room.joiningSocket.emit('bag empty')

  }




  let newHand = data.hand




  const responseData = {

    body : newHand

  }


  res.json(responseData)

})


 function updateServer(data){

  updatingClient = clients.get(data.clientID)

  updatingClient.score = data.score
  updatingClient.room.board = data.gameBoardArray
  updatingClient.hand = data.hand

  if(updatingClient.room.currentTurn == updatingClient.room.player1){
    updatingClient.room.currentTurn = updatingClient.room.player2
    updatingClient.room.notTurn = updatingClient.room.player1

  } else{
    updatingClient.room.currentTurn = updatingClient.room.player1
    updatingClient.room.notTurn = updatingClient.room.player2
  }



  notifyClient(updatingClient.room.currentTurn.ID,updatingClient.room.board,updatingClient.score,updatingClient.room.emptyBag)

  
}

function notifyClient(clientID,board,newScore,emptyBag){

  clientSocket = clients.get(clientID).socket

  clientSocket.emit('change turn',board,newScore)


}

function checkIfBagEmpty(room){

  let sum = 0

  for (const value of room.remainingLetters.values()){
    sum += value
  }

  if (sum == 0){
    return true
  }

  return false

}




const activeRooms = new Map()
const waitingRooms = new Map()
const clients = new Map()

const letterValues = new Map([
  ['a', 1],
  ['b', 3],
  ['c', 3],
  ['d', 2],
  ['e', 1],
  ['f', 4],
  ['g', 2],
  ['h', 4],
  ['i', 1],
  ['j', 8],
  ['k', 5],
  ['l', 1],
  ['m', 3],
  ['n', 1],
  ['o', 1],
  ['p', 3],
  ['q', 10],
  ['r', 1],
  ['s', 1],
  ['t', 1],
  ['u', 1],
  ['v', 4],
  ['w', 4],
  ['x', 8],
  ['y', 4],
  ['z', 10]
]);



function tile (letter,pointValue,row,column){

  this.letter = letter
  this.pointValue = pointValue
  this.row = row
  this.column = column


}



io.on('connection',(socket)=>{
  console.log('a user has connected')

  socket.on('room create request', (ID) =>{

    newRoomID = ID

    let newRoom = new room(newRoomID)

    newRoom.hostSocket = socket
    // newRoom.hostID = ID

    waitingRooms.set(newRoomID,newRoom)

    socket.join(`${newRoomID}`)


    console.log(`socket ${newRoomID} has created a room`)



  })

  socket.on('room joined',()=>{
    console.log('game has begun')
  })


  socket.on('room join request', (roomID,clientID) =>{

    if(waitingRooms.has(roomID)){
      let joiningRoom = waitingRooms.get(roomID)

      joiningRoom.joiningSocket = socket
      joiningRoom.joiningID = clientID

      //adding the joining socket to the room info
      activeRooms.set(roomID, joiningRoom)
      //removing room from waitlist and add it to list of active rooms
      waitingRooms.delete(roomID)
      console.log(`active room ${roomID}`)

      socket.join(`${roomID}`)


      io.to(`${roomID}`).emit('room joined')




      initializeGame(joiningRoom,joiningRoom.hostSocket,joiningRoom.joiningSocket)

    
    } else {
      console.log("Error: room not found")
    }


  })



  socket.on('tile played',(clientID,x,y,letter)=>{

    

    if(clients.has(clientID)){


      let playingClient = clients.get(clientID)

      if(playingClient.room.currentTurn === playingClient){
        playingClient = playingClient.room.currentTurn
        let nonPlayingClient = playingClient.room.notTurn
  
        nonPlayingClient.socket.emit('other player tile',x,y,letter)
  
        playingClient.room.board[x][y] = letter
      }
      

    }
  })



  socket.on('empty hand',(clientID)=>{


    client = clients.get(clientID)
    
    client.room.hostSocket.emit('end game')
    client.room.joiningSocket.emit('end game')


  })





  socket.on('recall',(clientID)=>{
    
    
    let playingClient = clients.get(clientID)

    if(playingClient.room.currentTurn === playingClient){
      playingClient = playingClient.room.currentTurn
      let nonPlayingClient = playingClient.room.notTurn

      nonPlayingClient.socket.emit('other player recall')

    }


  })



})




const PORT = process.env.PORT || 3000;


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



function room(roomID){

  this.roomID = roomID

}

function player(ID,room, score, hand,socket){

  this.ID = ID
  this.room = room,
  this.score = score,
  this.hand = hand
  this.socket = socket


}



function generateID(){

  return Math.floor(Math.random() * 10000)

}



function initializeGame(room,socket1,socket2){

  //room is a previously created active room, now that a game has started we initialize it with game related information and return the upgraded room object
  //adds info for two players (creates two player objects), 2D array for board, available letters

  let player1 = new player(room.roomID,room, 0, ["","","","","","",""],room.hostSocket)
  let player2 = new player(room.joiningID,room, 0, ["","","","","","",""],room.joiningSocket)

  room.player1 = player1
  room.player2 = player2

  room.emptyBag = false

  clients.set(player1.ID,player1)
  clients.set(player2.ID,player2)

  room.board = initializeBoard()

  room.currentTurn = room.player1
  room.notTurn = room.player2


  room.remainingLetters = new Map([
    ['a', 9],
    ['b', 2],
    ['c', 2],
    ['d', 4],
    ['e', 12],
    ['f', 2],
    ['g', 3],
    ['h', 2],
    ['i', 9],
    ['j', 1],
    ['k', 1],
    ['l', 4],
    ['m', 2],
    ['n', 6],
    ['o', 8],
    ['p', 2],
    ['q', 1],
    ['r', 6],
    ['s', 4],
    ['t', 6],
    ['u', 4],
    ['v', 2],
    ['w', 2],
    ['x', 1],
    ['y', 2],
    ['z', 1]
  ]);

  populateHand(room.player1)



  socket1.emit('populate hand',room.player1.hand)

  populateHand(room.player2)

  socket2.emit('populate hand',room.player2.hand)



  socket1.emit('begin game', true,1)
  socket2.emit('begin game', false,2)




}


function initializeBoard(){

  let gameBoardArray = []

  for(let i = 0;i < 15;i++){

    gameBoardArray[i]= []

    for(let j = 0; j < 15;j++){


        gameBoardArray[i][j] = ""

    }

}

  return gameBoardArray

}


function populateHand(player) {
  for (let i = 0; i < 7; i++) {
    let keysArray = Array.from(player.room.remainingLetters.keys());

    while (player.hand[i] === "") {

      let x = weightedRandomKey(player);

      if(x == null){
        break
      }

      if (letterValues.get(x) !== 0) {
        let newTile = new tile(x, letterValues.get(x), -1, -1);
        player.hand[i] = newTile;

        // Update the remaining letter count in the Map
        let letter = x;
        let remainingCount = player.room.remainingLetters.get(letter);
        player.room.remainingLetters.set(letter, remainingCount - 1);
        
        break;
      }
    }
  }
}


function weightedRandomKey(player) {
  // Step 1: Convert the map into an array of key-value pairs
  const keyValuePairs = Array.from(player.room.remainingLetters);

  // Step 2: Calculate the cumulative probability distribution
  let cumulativeProbabilities = [];
  let totalValue = 0;

  for (const [key, value] of keyValuePairs) {
    totalValue += value;
    cumulativeProbabilities.push({ key, cumulative: totalValue });
  }

  if(totalValue == 0){
    return null
  }
  // Step 3: Generate a random number between 0 and the sum of all values
  const randomValue = Math.random() * totalValue;

  // Step 4: Find the key corresponding to the random number
  for (const { key, cumulative } of cumulativeProbabilities) {
    if (randomValue <= cumulative) {
      return key;
    }
  }

  // In case something went wrong, return null or handle it as needed
  return null;
}







/*Server needs to store a map of active games
-each active game must store the following
  -players
    -player hands
    -player score
  -board state (what letters are present on the board, what squares are empty)
  -what letters are still available


-each client will store the following
  -its own hand
  -its own score



-each time a player places a letter, the client sends its board state to the
server
-server updates the board on the other players end
-when a player hits "submit", client  must validate move 

  server must have the following functions
    -updatePoints()
    -sendRedraw()
    -updateTurn()
    -updatePoints()
    -updateBoard()
    -checkForGameEnd()
  
  game flow:

  client:
    1. create list of available words
    2. player places letter
    3. client sends letter placement to server
    4. client checks if word is valid after each letter placement

  server: 
    1. server updates board state 
    2. server tells other client to redraw its board based on new letter placement
     

  client:
    1. client continues placing letters, eventually presses send
    2. clients verifies the word

  server:
    1. server recieves 'submit' event, if it was the right players turn,
    server tells clients to redraw
    2. server updates point value of player and turn value of game
    3. server updates the number of letters still available
    4. each time a move is completed, server checks if game is over (both players
      out of letters)


-the two primary functions of the server are to match letter placement to the 
other player and to continuously check if the game is over


  
*/




