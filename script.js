const socket = io('https://desolate-wildwood-68412-29d0cf041e23.herokuapp.com/'); 
let clientID

let gameBoardArray = []
let turn = false 
let lettersPlayed = 0
let lastCoord = []
let valid = false
let lastRow
let lastColumn
let emptyBag = false
let justPassed = false
let gameEnded = false

let playerNumber


//prevHand is the hand of letters the current player had at the beginning of their current turn 
let prevHand

//currentPlay is the set of tiles being placed by the current player before submittting
let currentPlay = Array(7)

//playedWord is an array representing the word currently being played
let playedWord = []

//currentWords is an array of words currently being played
let currentWords = []

const player = {

    score : 0,
    hand : ["","","","","","",""],
    

}



const wordFactory = (column,row,direction) => {

    let word = ""
    playedWord = []
    let i = 0;
    
    while (column != -1 && row != -1 && gameBoardArray[column][row] != ""){
        word += gameBoardArray[column][row].letter

        playedWord.push(word.charAt(i))
        i++

        switch(direction){
            case 'left': column--
            break;
            case 'right': column++
            break;
            case 'up': row--
            break;
            case 'down': row++
            break;
        }
    }

    return {word}
}


function tile (letter,pointValue,row,column){

    this.letter = letter
    this.pointValue = pointValue
    this.row = row
    this.column = column


}


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

// const letterOccurrences = new Map([
//     ['a', 9],
//     ['b', 2],
//     ['c', 2],
//     ['d', 4],
//     ['e', 12],
//     ['f', 2],
//     ['g', 3],
//     ['h', 2],
//     ['i', 9],
//     ['j', 1],
//     ['k', 1],
//     ['l', 4],
//     ['m', 2],
//     ['n', 6],
//     ['o', 8],
//     ['p', 2],
//     ['q', 1],
//     ['r', 6],
//     ['s', 4],
//     ['t', 6],
//     ['u', 4],
//     ['v', 2],
//     ['w', 2],
//     ['x', 1],
//     ['y', 2],
//     ['z', 1]
//   ]);


// const keysArray = Array.from(letterOccurrences.keys());


//Adds a letter to the player.hand array at a specified index
// function addLetterToHand(player,index,tile){
//     if(lettersPlayed >= 100){
//         return
//     }

//     if(letterOccurrences.get(tile.letter) > 0){
//         letterOccurrences.set(tile.letter,letterOccurrences.get(tile.letter)-1)
//         player.hand[index] = tile
//     }

// }




//Fills in all the gaps in a players hand and decrements letter occurrences accordingly
function populateHand(hand,player){

    player.hand = hand

    prevHand = [...player.hand]

}






for(let i = 0;i < 15;i++){

    gameBoardArray[i]= []

    for(let j = 0; j < 15;j++){


        gameBoardArray[i][j] = ""

    }

}



function playTile(player,tileIndex,x,y){

    let leftValid = false
    let rightValid = false
    let upValid = false
    let downValid = false

    let playedTile = player.hand[tileIndex]

    eraseValidBorder()

    lastCoord = [x,y]

    if( gameBoardArray[x][y] != ""){
        return
    }
    if(player.hand[tileIndex] != ""){
        gameBoardArray[x][y] = player.hand[tileIndex]
        currentPlay[tileIndex] = player.hand[tileIndex]

        gameBoardArray[x][y].column = x
        gameBoardArray[x][y].row = y

        let leftTrue = adjacentLeft(playedTile)
        let rightTrue = adjacentRight(playedTile)
        let upTrue = adjacentUp(playedTile)
        let downTrue = adjacentDown(playedTile)

        vertDirection = leftTrue || rightTrue
        horDirection = upTrue || downTrue

        let downWord
        let upWord
        let leftWord
        let rightWord

        let conJoinedWord
        let conJoinFactory

        if(leftTrue && rightTrue){
           
            

           if (validateWord(conJoinFactory.conjoinedWord)){
            leftValid = true
            rightValid = true
            conJoinedWord = conJoinFactory.conjoinedWord
            currentWords.push(conJoinedWord)   

           }
        
                 


         } else  if(leftTrue){
                  


            

            leftWord = wordFactory(x,y,"left").word
            leftWord = reverseString(leftWord)
            if(validateWord(leftWord)){
            leftValid = true
            currentWords.push(leftWord)
            }

            } else if (rightTrue){


            rightWord = wordFactory(x,y,"right").word
            if(validateWord((rightWord))){
            rightValid = true
            currentWords.push(rightWord)
            }
        }
    

        
        if(upTrue && downTrue){


            conJoinFactory = conjoinWords(x,y,"vertical")
            if(validateWord(conJoinFactory.conjoinedWord)){
                upValid = true
                downValid = true
                conJoinedWord = conJoinFactory.conjoinedWord
                currentWords.push(conJoinedWord)
            }
                
        } else if (downTrue){


            downWord = wordFactory(x,y,"down").word
        
                if (validateWord(downWord)){
                    currentWords.push(downWord)
                    downValid = true
                } 
        }else  if(upTrue){


                upWord = wordFactory(x,y,"up").word
                if (validateWord(reverseString(upWord))){
                    upValid = true
                    upWord = reverseString(upWord)
                    currentWords.push(upWord)
                } 
        }

        valid = upValid || downValid || leftValid || rightValid || leftValid

        if(leftValid && rightValid){
            drawValidBorder(conJoinFactory.column,conJoinFactory.row,conJoinedWord,"right")
        } 
         if(upValid && downValid){
            drawValidBorder(conJoinFactory.column,conJoinFactory.row,conJoinedWord,"down")
        } 
         if(leftValid && upValid){
            drawValidBorder(x,y,leftWord,"left")
            drawValidBorder(x,y,upWord,"up")
            eraseRedundantBorder(x,y,"left")
            eraseRedundantBorder(x,y,"top")
        }  
        if(rightValid && upValid){
            drawValidBorder(x,y,rightWord,"right")
            drawValidBorder(x,y,upWord,"up")
            eraseRedundantBorder(x,y,"right")
            eraseRedundantBorder(x,y,"top")
        }  
        if(leftValid && downValid){
            drawValidBorder(x,y,leftWord,"left")
            drawValidBorder(x,y,downValid,"down")
            eraseRedundantBorder(x,y,"left")
            eraseRedundantBorder(x,y,"bottom")
        }  
        if(rightValid && downValid){
            drawValidBorder(x,y,rightValid,"right")
            drawValidBorder(x,y,downValid,"down")
            eraseRedundantBorder(x,y,"right")
            eraseRedundantBorder(x,y,"bottom")
        }  
        if(leftValid){
            if(rightTrue || downTrue || upTrue){
                valid = true
                return
            } else {
                drawValidBorder(x,y,leftWord,"left")
            }
        } 
        if(rightValid){
            if(leftTrue || downTrue || upTrue){
                valid = true
                return
            } else {
                drawValidBorder(x,y,rightWord,"right")
            }
        }   
         if(upValid){
            if(leftTrue || rightTrue || downTrue){
                valid = true
                return
                } else {
                drawValidBorder(x,y,upWord,"up")
            }
        } 
        if(downValid){
            if(leftTrue || rightTrue || upTrue){
                valid = true
                return
                } else {
                drawValidBorder(x,y,downWord,"down")
            }
        }

    }
        player.hand[tileIndex] = ""
            
    
        lettersPlayed += 1


    }

    








/////HTML stuff/////



const handDiv = document.querySelector('.player-hand')
const boardDiv = document.querySelector('.board')


function drawBoard(){

    for(let i = 0; i < gameBoardArray.length;i++){

        for(let j = 0; j < gameBoardArray[i].length; j++){
    
            let tile = document.createElement('div')
            tile.dataset.row = j
            tile.dataset.column = i
            tile.innerHTML = ''
            tile.classList.add('tile')
            tile.addEventListener('dragover', (e)=>{

                e.preventDefault()
                if(!tile.hasChildNodes()){
                    tile.classList.add('drag-over')

                }
            })
            tile.addEventListener('dragleave', (e)=>{
                e.preventDefault()
                tile.classList.remove('drag-over')
            })
            tile.addEventListener('drop', (e)=>{
                e.preventDefault()

                if(!tile.hasChildNodes()){
                    tile.classList.remove('drag-over')

                    let row = e.target.dataset.row
                    let column = e.target.dataset.column
                    
                    const playIndex = e.dataTransfer.getData('text/plain');
    
                    let letter = player.hand[ parseInt(playIndex)].letter
    
                    if(turn === true){
    
    
    
                        playTile(player,playIndex,row,column)
        
                        drawHand(player)
                        addToBoard(row,column)
    
                        socket.emit('tile played',clientID,row,column, letter)
    
    
    
                    }
                }
                

                

            })

                boardDiv.appendChild(tile)
            
    
        }
    }
}


function upDateBoard(){

    for(let i = 0; i < gameBoardArray.length;i++){

        for(let j = 0; j < gameBoardArray[i].length; j++){
    
            let tile = document.querySelector('[data-row="'+i+'"][data-column="'+j+'"]');
            
            if(gameBoardArray[i][j] != ""){

                addToBoard(i,j)
                
            }
    
        }
    }


}




function drawHand(player){

    let tileList = Array.from(document.querySelector('.player-hand').children)

    for(let i in tileList){
        if(player.hand[i] != ""){
            tileList[i].classList.add("letter")
            tileList[i].draggable = 'true'
            
            tileList[i].innerHTML = player.hand[i].letter
            tileList[i].addEventListener('dragstart',(e) =>{

                e.dataTransfer.setData('text/plain', i);
   
            })

            currentPlay.push()
        } else {
            tileList[i].classList.remove("letter")
            tileList[i].classList.add("invisible")
            tileList[i].draggable = 'false'
            tileList[i].innerHTML = ""


        }        
    }
}

function addToBoard(row,column){
    const tile = document.querySelector('[data-row="'+row+'"][data-column="'+column+'"]');
            
            let addedTile = document.createElement('div')
            addedTile.classList.add('occupiedTile')
            addedTile.innerText = gameBoardArray[row][column].letter
            

            tile.appendChild(addedTile)
  
}


function addOtherPlayersTileToBoard(row,column,letter){
    const tile = document.querySelector('[data-row="'+row+'"][data-column="'+column+'"]');
    
    if(!tile.classList.contains('occupiedTile') && !tile.classList.contains('highlighted')){
        let addedTile = document.createElement('div')
        addedTile.classList.add('highlighted')
        addedTile.innerText = letter
    
        tile.appendChild(addedTile)
    }
    

}

function removeFromBoard(row,column){
    const tile = document.querySelector('[data-row="'+row+'"][data-column="'+column+'"]');

            gameBoardArray[row][column] = ""
            const letter = tile.children[0]
            tile.removeChild(letter)

}

function getWordPointValue(word){

    let sum = 0

    for (let i = 0; i < word.length;i++){
        sum += letterValues.get(word[i]) 
    }
    return sum
}

function submitWord(word){


    player.score += getWordPointValue(word)

    if(playerNumber == 1){
        player1Score.innerHTML = `Player1: ${player.score}` 
    } else {
        player2Score.innerHTML = `Player2: ${player.score}` 
    }


 
}




const submitButton = document.querySelector('.play-button')

submitButton.addEventListener('click',()=>{
    

    

    if(valid && turn){

        for(let i = 0; i < currentWords.length;i++){
            submitWord(currentWords[i])
        }   

        

        nextTurn()


        if(emptyBag){
            socket.emit('empty hand',clientID)
        }



    }
    
})


const recallButton = document.querySelector('.recall-button')
recallButton.addEventListener('click',recallLetters)


function recallLetters(){

    currentWords = []

    for (i in currentPlay){
        player.hand[i] = currentPlay[i]
        removeFromBoard(player.hand[i].column,player.hand[i].row)

    }
    eraseValidBorder()
    currentPlay = Array(7)
    drawHand(player)


    socket.emit('recall',clientID)
}

const passButton = document.querySelector('.pass-button')

passButton.addEventListener('click',()=>{

    justPassed = true
    
    socket.emit('pass',(clientID))


    if(!gameEnded){
        nextTurn()

    }

    
})




async function nextTurn(){

    currentWords = []
    
    if(playerNumber == 1){
            turnIndicator.innerText = 'Other players turn'
    } else {
        turnIndicator.innerText = 'Your turn'

    }

    eraseValidBorder()

    turn = !turn

    const response = await updateServer(clientID,player.score,gameBoardArray,player.hand)

    player.hand = response.body

    currentPlay = Array(7)
    playedWord = []

    drawHand(player)
}

async function updateServer(clientID,score,gameBoardArray,hand){

    //fetch request to server

    const data = {

        clientID: clientID,
        score: score,
        gameBoardArray: gameBoardArray,
        hand: hand

    }

    const jsonData = JSON.stringify(data)

    const response = await fetch('/update', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
          },
        body: jsonData
    })

    const newHand = await response.json()


    return newHand
}




function validateWord(word) {

    if(dictionary.includes(word.toUpperCase())){
        return true
    }
    
}


 
function adjacentUp(tile){

    const row = parseInt(tile.row)
    const column = parseInt(tile.column)

    if(row != 0 && gameBoardArray[column][row-1] != ""  ){
        return true
    }

    return false
    
}

function adjacentDown(tile){

    const row = parseInt(tile.row)
    const column = parseInt(tile.column)

    if(row != 14 && gameBoardArray[column][row+1] != ""  ){
        return true
    }

    return false
    
}

function adjacentLeft(tile){

    const row = parseInt(tile.row)
    const column = parseInt(tile.column)

    if(column != 0 && column != 14 && gameBoardArray[column-1][row] != ""  ){
        return true
    }

    return false
}

function adjacentRight(tile){

    const row = parseInt(tile.row)
    const column = parseInt(tile.column)

    if(column != 0  && column != 14 && gameBoardArray[column+1][row] != "" ){
        return true
    }

    return false
}

const conjoinWords = (column,row, direction) => {

    column = parseInt(column)
    row = parseInt(row)

    let conjoinedWord

    currentTile = gameBoardArray[column][row]

    if(direction === "horizontal"){
        while(currentTile != ""){
            column--
            currentTile = gameBoardArray[column][row]
        }
        conjoinedWord = wordFactory(column+1,row,"right").word
        column++
    } else if (direction === "vertical"){
        while(currentTile != ""){
            row--
            currentTile = gameBoardArray[column][row]

        }
        conjoinedWord = wordFactory(column,row+1,"down").word
        row++
    }

    return {conjoinedWord, column, row}

}



function reverseString(word){
    let splitWord = word.split("")
    let reverseArray = splitWord.reverse()
    let joinArray = reverseArray.join("")
    return joinArray
}

function drawValidBorder(column,row,word,direction){

    column = parseInt(column)
    row = parseInt(row)

    const tile = boardDiv.children

    if(direction === "up"){
        tile[(row*15)+column].classList.add('validWordBottom')
        tile[((row)*15)+column].classList.add('validWordLeft')
        tile[((row)*15)+column].classList.add('validWordRight')
    } else if(direction === "down"){
        tile[(row*15)+column].classList.add('validWordTop')
        tile[((row)*15)+column].classList.add('validWordLeft')
        tile[((row)*15)+column].classList.add('validWordRight')
    } else if(direction === "left"){
        tile[(row*15)+column].classList.add('validWordRight')
        tile[(row*15)+column].classList.add('validWordBottom')
        tile[(row*15)+column].classList.add('validWordTop')
    } else {
        tile[(row*15)+column].classList.add('validWordLeft')
        tile[(row*15)+column].classList.add('validWordBottom')
        tile[(row*15)+column].classList.add('validWordTop')

    }

    for(let i = 0; i < word.length-2; i++){

        if(direction === "up"){
            row -= 1
            tile[((row)*15)+column].classList.add('validWordLeft')
            tile[((row)*15)+column].classList.add('validWordRight')

        } else if (direction === "down") {
            row++
            tile[((row)*15)+column].classList.add('validWordLeft')
            tile[((row)*15)+column].classList.add('validWordRight')
        } else if(direction === "left"){
            column -= 1
            tile[((row)*15)+column].classList.add('validWordTop')
            tile[((row)*15)+column].classList.add('validWordBottom')

        } else {
            column++
            tile[((row)*15)+column].classList.add('validWordTop')
            tile[((row)*15)+column].classList.add('validWordBottom')        }
    }

    if(direction === "up"){
        row -= 1
        tile[((row)*15)+column].classList.add('validWordTop')
        tile[((row)*15)+column].classList.add('validWordLeft')
        tile[((row)*15)+column].classList.add('validWordRight')

    } else if(direction === "down"){
        row++
        tile[((row)*15)+column].classList.add('validWordBottom')
        tile[((row)*15)+column].classList.add('validWordLeft')
        tile[((row)*15)+column].classList.add('validWordRight')

    } else if(direction === "left"){
        column -= 1
        tile[((row)*15)+column].classList.add('validWordLeft')
        tile[((row)*15)+column].classList.add('validWordTop')
        tile[((row)*15)+column].classList.add('validWordBottom')


    } else {
        column++
        tile[((row)*15)+column].classList.add('validWordRight')
        tile[((row)*15)+column].classList.add('validWordTop')
        tile[((row)*15)+column].classList.add('validWordBottom')
    }


}

function eraseValidBorder(){
    let tiles = boardDiv.children

  


    for(let i = 0;i< 225; i++){
        tiles[i].classList.remove('validWordRight')
        tiles[i].classList.remove('validWordHorizontal')
        tiles[i].classList.remove('validWordLeft')
        tiles[i].classList.remove('validWordBottom')
        tiles[i].classList.remove('validWordTop')
        tiles[i].classList.remove('validWordVertical')

    }
}

function eraseRedundantBorder(column,row,direction){
    
    column = parseInt(column)
    row = parseInt(row)

    direction = direction.charAt(0).toUpperCase() + direction.slice(1);


    let tiles = boardDiv.children
    tiles[((row)*15)+column].classList.remove(`validWord${direction}`)

}

// Get references to the modal and button elements
const createGameButton = document.querySelector('.createGameButton')
const joinGameButton = document.querySelector('.joinGameButton')
const roomIDInput = document.querySelector('.roomIDInput')
const modal = document.querySelector('.modal')
const modalContent = document.querySelector('.modal-content')

const player1Score = document.querySelector('.player1-score')
const player2Score = document.querySelector('.player2-score')
const turnIndicator = document.querySelector('.turn')



 clientID = generateID()

createGameButton.addEventListener('click',()=>{

    modalContent.innerHTML = ''

    let roomID = document.createElement('div')
    roomID.classList.add('roomID')

    modalContent.append(roomID)



    roomID.innerText = `Room ID: ${clientID}` 

    socket.emit('room create request',(clientID))

    
})

joinGameButton.addEventListener('click',()=>{
    let IDinput = parseInt(roomIDInput.value)

    if(isNaN(IDinput) || IDinput == ''){
        roomIDInput.value =''

        roomIDInput.placeholder = 'Enter a valid room ID'
    } 


    //check if its trying to join its own room
    if(clientID === IDinput){
        roomIDInput.value =''

        roomIDInput.placeholder = 'Enter a valid room ID'
    } else {
        socket.emit('room join request',IDinput,clientID)
    }

    roomIDInput.value =''
    roomIDInput.placeholder = 'Room not found'

    
})

socket.on('room joined',()=>{
    modal.style.display = 'none'
})

socket.on('other player tile',(x,y,letter)=>{
    
    addOtherPlayersTileToBoard(x,y,letter)
})

socket.on('populate hand', (hand)=>{

    populateHand(hand,player)
})

socket.on('other player recall',()=>{
    otherPlayerRecall()
})

socket.on('change turn',(board,newScore,emptyBag)=>{


    if(!gameEnded){

        if(playerNumber == 2){
            turnIndicator.innerText = 'Your turn'
        } else {
        turnIndicator.innerText = 'Other players turn'
    
        }
    
        turn = !turn
    
        if(playerNumber == 1){
            player2Score.innerHTML = `Player2: ${newScore}` 
        } else {
            player1Score.innerHTML = `Player1: ${newScore}` 
        }
    
        otherPlayerRecall()
    
        gameBoardArray = board
    
        upDateBoard()



    }
    
    

})

socket.on('bag empty', ()=>{
    emptyBag = true
})

socket.on('end game',(message)=>{

    turn = false

    gameEnded = true

    turnIndicator.innerText = message

})




function otherPlayerRecall(){
    for(let i = 0; i < gameBoardArray.length;i++){

        for(let j = 0; j < gameBoardArray[i].length; j++){

            const tile = document.querySelector('[data-row="'+i+'"][data-column="'+j+'"]');

             if(tile.firstChild){
                removeFromBoard(i,j)
             }

        }
    }
}


function generateID(){

    return Math.floor(Math.random() * 9000000000) + 1000000000;

  
  }






/////HTML stuff/////



socket.on('begin game', (currentTurn,playerNo)=>{
    
    playerNumber = playerNo

    turn = currentTurn

    drawBoard()
    drawHand(player)

    if(playerNumber == 1){
        turnIndicator.innerText = 'Your turn'
    } else {
        turnIndicator.innerText = 'Other players turn'
    }


})


let dictionary

fetch('/data.txt') 
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(text => {
        // Handle the content of the text file
        dictionary = text
         dictionary = dictionary.split('\n');


      })
      .catch(error => {
        console.error('Error fetching text file:', error);
      });







