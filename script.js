const gameBoardArray = []
let lettersPlayed = 0

//prevHand is the hand of letters the current player had at the beginning of their current turn 
let prevHand

//currentPlay is the set of tiles being placed by the current player before submittting
let currentPlay = Array(7)

const player1 = {

    score : 0,
    hand : ["","","","","","",""],
    

}

const player2 = {

    score : 0,
    hand : ["","","","","","",""],

}

let currentPlayer = player1

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

const letterOccurrences = new Map([
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


const keysArray = Array.from(letterOccurrences.keys());


//Adds a letter to the player.hand array at a specified index
function addLetterToHand(player,index,tile){
    if(lettersPlayed >= 100){
        return
    }

    if(letterOccurrences.get(tile.letter) > 0){
        letterOccurrences.set(tile.letter,letterOccurrences.get(tile.letter)-1)
        player.hand[index] = tile
    }

}




//Fills in all the gaps in a players hand and decrements letter occurrences accordingly
function populateHand(player){
    for(let i = 0; i < 7; i++ ){

        while(player.hand[i] === ""){
            let x = Math.floor(Math.random()*26)
            let newTile = new tile(keysArray[x],letterValues.get(keysArray[x]),-1,-1)
            

            addLetterToHand(player,i,newTile)
        }
        
    }


    prevHand = [...player.hand]

}






for(let i = 0;i < 15;i++){

    gameBoardArray[i]= []

    for(let j = 0; j < 15;j++){


        gameBoardArray[i][j] = ""

    }

}

function playTile(player,tileIndex,x,y){
    if( gameBoardArray[x][y] != ""){
        return
    }
    if(player.hand[tileIndex] != ""){
        gameBoardArray[x][y] = player.hand[tileIndex]
        currentPlay[tileIndex] = player.hand[tileIndex]

        gameBoardArray[x][y].column = x
        gameBoardArray[x][y].row = y

        player.hand[tileIndex] = ""
            
    }

    

    lettersPlayed += 1
}



fetch('dictionary.txt')
  .then(response => response.text())
  .then(data => {
    const wordsArray = data.split('\n');
    console.log(wordsArray);
  })
  .catch(error => {
    console.error('Error:', error);
  });


populateHand(player1)



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
                tile.classList.add('drag-over')
            })
            tile.addEventListener('dragleave', (e)=>{
                e.preventDefault()
                tile.classList.remove('drag-over')
            })
            tile.addEventListener('drop', (e)=>{
                e.preventDefault()
                tile.classList.remove('drag-over')

                let row = e.target.dataset.row
                let column = e.target.dataset.column
                
                const playIndex = e.dataTransfer.getData('text/plain');


                playTile(currentPlayer,playIndex,row,column)
                drawHand(currentPlayer)
                addToBoard(row,column)

            })
    
            boardDiv.appendChild(tile)
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

function removeFromBoard(row,column){
    const tile = document.querySelector('[data-row="'+row+'"][data-column="'+column+'"]');

            gameBoardArray[row][column] = ""
            const letter = tile.children[0]
            tile.removeChild(letter)

}

const submitButton = document.querySelector('button')
submitButton.addEventListener('click',()=>{
    

    nextTurn()
})


const recallButton = document.querySelector('.recall-button')
recallButton.addEventListener('click',recallLetters)


function recallLetters(){

    for (i in currentPlay){
        currentPlayer.hand[i] = currentPlay[i]
        removeFromBoard(currentPlayer.hand[i].column,currentPlayer.hand[i].row)

    }
    currentPlay = Array(7)
    drawHand(currentPlayer)
}




function nextTurn(){
    currentPlay = Array(7)
    populateHand(currentPlayer)
    drawHand(currentPlayer)
}

 

/////HTML stuff/////
drawBoard()
populateHand(currentPlayer)
drawHand(currentPlayer)
