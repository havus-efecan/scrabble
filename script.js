const gameBoardArray = []
let lettersPlayed = 0
let prevHand
const player1 = {

    score : 0,
    hand : ["","","","","","",""],
    

}

const player2 = {

    score : 0,
    hand : ["","","","","","",""],

}

let currentPlayer = player1

function tile (letter,pointValue){

    this.letter = letter
    this.pointValue = pointValue

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

//Fills in all the gaps in a players hand and decrements letter occurrences accordingly
function populateHand(player){
    for(let i = 0; i < 7; i++ ){

        while(player.hand[i] === ""){

            if(lettersPlayed >= 100){
                return
            }

            let x = Math.floor(Math.random()*26)
            let currentLetter = keysArray[x]

            if(letterOccurrences.get(currentLetter) > 0){
                player.hand[i] = new tile(currentLetter,letterValues.get(keysArray[x]))
                letterOccurrences.set(currentLetter,letterOccurrences.get(keysArray[x])-1)
            }
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
                removeLetterFromHand(playIndex)

                updateBoard(row,column,true)

            })
    
            boardDiv.appendChild(tile)
        }
    }
}

function clearBoard(){
    for(let i = 0; i < gameBoardArray.length;i++){

        for(let j = 0; j < gameBoardArray[i].length; j++){
    
            updateBoard(i,j,false)

        }
    }
}



function drawHand(player){

    let tileList = Array.from(document.querySelector('.player-hand').children)

    for(let i in tileList){
        if(player.hand[i].letter != ""){
            tileList[i].classList.add("letter")
            tileList[i].draggable = 'true'
            
            tileList[i].innerHTML = player.hand[i].letter
            tileList[i].addEventListener('dragstart',(e) =>{

                e.dataTransfer.setData('text/plain', i);
   
            })
        }        
    }
}


function removeLetterFromHand(index){
    let tileList = Array.from(document.querySelector('.player-hand').children)
    tileList[index].classList.remove("letter")
    tileList[index].classList.add("invisible")

    tileList[index].innerHTML = ""
}


function updateBoard(row,column,add){


    
    const tile = document.querySelector('[data-row="'+row+'"][data-column="'+column+'"]');
            
        if(add){
            let addedTile = document.createElement('div')
            addedTile.classList.add('occupiedTile')
            addedTile.innerText = gameBoardArray[row][column].letter
            tile.appendChild(addedTile)
        } else {
            
            let tilesToRemove = tile.children
            if(tilesToRemove.length != 0){
                tile.removeChild(tilesToRemove[0])

            }

        }
                
               
    
}

const submitButton = document.querySelector('button')
submitButton.addEventListener('click',()=>{
    
    nextTurn()
})


const recallButton = document.querySelector('.recall-button')
recallButton.addEventListener('click',recallLetters)


function recallLetters(){
    currentPlayer.hand = prevHand
    drawHand(currentPlayer)

    for(let i = 0; i < gameBoardArray.length;i++){

        for(let j = 0; j < gameBoardArray[i].length; j++){
            gameBoardArray[i][j] = ""
        }
    
        clearBoard()


}
}



function nextTurn(){
    populateHand(currentPlayer)
    drawHand(currentPlayer)
}

 

/////HTML stuff/////
drawBoard()
populateHand(currentPlayer)
drawHand(currentPlayer)
