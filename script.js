const gameBoardArray = []


const player1 = {

    score : 0,
    hand : ["","","","","","",""],
    

}

const player2 = {

    score : 0,
    hand : ["","","","","","",""],

}

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


function populateHand(player){
    for(let i = 0; i < 7; i++ ){
        let x = Math.floor(Math.random()*26)
        let currentLetter = keysArray[x]

        if(player.hand[i] === "" && letterOccurrences.get(currentLetter) > 0){
            player.hand[i] = new tile(currentLetter,letterValues.get(keysArray[x]))
            letterOccurrences.set(currentLetter,letterOccurrences.get(keysArray[x])-1)
        }
    }
}




for(let i = 0;i < 15;i++){

    gameBoardArray[i]= []

    for(let j = 0; j < 15;j++){

        gameBoardArray[i][j] = ""

    }

}

function playTile(player,tile,x,y){
    if(player.hand.includes(tile)){
        gameBoardArray[x][y] = tile
    }
}

populateHand(player1)
populateHand(player2)


playTile(player1,player1.hand[0],7,10)