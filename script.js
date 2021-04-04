let originalBoard;
const humanPlayer = {
    id: 'human',
    letter: 'O',
    icon: 'fa-user',
    image: 'assets/imgs/human.png',
};

const aiPlayer = {
    id: 'robot',
    letter: 'X',
    icon: 'fa-robot',
    image: 'assets/imgs/robot.png',
};;

const winCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

const dificcultySelector = document.getElementById('dificculty');
const themeSelector = document.getElementById('theme');
let theme = 'icon';
const cells = document.querySelectorAll('.cell');
const endGame = document.getElementById('endGame');

startGame();

function resetGame() {
    if (themeSelector.value === 'image') {
        theme = 'image';
    } else if (themeSelector.value === 'letter') {
        theme = 'letter';
    } else if (themeSelector.value === 'icon') {
        theme = 'icon';
    }

    endGame.style.display = 'none';

    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];

        cell.innerText = '';
        cell.style.removeProperty('background-color');
        cell.addEventListener('click', turnClick, false);
    }
}

function turnClick(square) {
    if (typeof originalBoard[square.target.id] === 'number') {
        turn(square.target.id, humanPlayer);

        if (!checkTie()) {
            turn(bestSpot(), aiPlayer);
        }
    }
}

function turn(squareId, player) {
    originalBoard[squareId] = player.id;

    if (theme === 'image') {
        const img = document.createElement('img');
        img.src = player.image;
        img.className = 'player-image';
        // img.style.height = '100px';
        // img.style.width = '100px';

        document.getElementById(squareId).appendChild(img);
    } else if (theme === 'letter') {
        document.getElementById(squareId).innerHTML = player.letter;
    } else if (theme === 'icon') {
        document.getElementById(squareId).innerHTML = `<i class="fas ${player.icon}"></i>`;
    }

    let gameWon = checkWin(originalBoard, player.id);

    if (gameWon) {
        gameOver(gameWon);
    }
}

function checkWin(board, player) {
    let gameWon = null;

    let plays = board.reduce((acumulator, element, index) =>
        (element === player) ? acumulator.concat(index) : acumulator, []);

    for (const [index, win] of winCombinations.entries()) {
        if (win.every((element) => plays.indexOf(element) > -1)) {
            gameWon = {
                player,
                index,
            }

            break;
        }
    }

    return gameWon;
}

function gameOver(gameWon) {
    for (const index of winCombinations[gameWon.index]) {
        document.getElementById(index).style.backgroundColor =
            gameWon.player === humanPlayer.id ? 'blue' : 'red';
    }

    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];

        cell.removeEventListener('click', turnClick, false);
    }

    declareWinner(gameWon.player === humanPlayer.id ? 'You win!' : 'You lose.')
}

function emptySquares() {
    return originalBoard.filter(square => typeof square === 'number')
}

function bestSpot() {
    if (dificcultySelector.value === 'easy') {
        return emptySquares()[0];
    } else if (dificcultySelector.value === 'normal') {
        return emptySquares()[randomIntegerNumber(0, emptySquares().length)];
    } else {
        return minimax(originalBoard, aiPlayer.id).index;
    }
}

function minimax(newBoard, player) {
    let availableSpots = emptySquares();

    if (checkWin(newBoard, humanPlayer.id)) {
        return { score: -10 };
    } else if (checkWin(newBoard, aiPlayer.id)) {
        return { score: 10 };
    } else if (availableSpots.length === 0) {
        return { score: 0 }
    }

    let moves = [];
    for (let i = 0; i < availableSpots.length; i++) {
        const spot = availableSpots[i];

        let move = {};
        move.index = newBoard[spot];
        newBoard[spot] = player;

        if (player === aiPlayer.id) {
            if (checkWin(newBoard, aiPlayer.id)) {
                move.score = 10;
                newBoard[spot] = move.index;
                return move;
            }

            let result = minimax(newBoard, humanPlayer.id);
            move.score = result.score;
        } else {
            let result = minimax(newBoard, aiPlayer.id);
            move.score = result.score;
        }

        newBoard[spot] = move.index;
        moves.push(move);
    }

    let bestMove;
    if (player === aiPlayer.id) {
        let bestScore = -10000;

        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];

            if (move.score > bestScore) {
                bestScore = move.score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;

        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];

            if (move.score < bestScore) {
                bestScore = move.score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function randomIntegerNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function checkTie() {
    if (emptySquares().length === 0) {
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];

            cell.style.backgroundColor = 'green';
            cell.removeEventListener('click', turnClick, false);
        }

        declareWinner('Tie Game!');
        return true;
    }

    return false;
}

function declareWinner(winner) {
    document.getElementById('endGame').style.display = 'flex';
    document.getElementById('text').innerText = winner;
}

function startGame() {
    resetGame();

    originalBoard = Array.from(Array(9).keys());
}