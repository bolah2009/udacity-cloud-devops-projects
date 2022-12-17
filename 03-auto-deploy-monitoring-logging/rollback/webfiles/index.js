const player = (name, sign) => ({ name, sign });

const cellsElement = document.querySelectorAll('.cell');
const htmlcontainer = document.querySelector('div.info');
const playerOneInput = document.querySelector('#playerone-name');
const playerTwoInput = document.querySelector('#playertwo-name');
const playerComputerYes = document.querySelector('#yes');
const playerComputerNo = document.querySelector('#no');
const computerCheckbox = document.querySelector('.computer-player');
const difficultLevelCheckbox = document.querySelector('.difficulty-level');
const difficultLevelContainer = document.querySelector('label.level');
const controlPanelElement = document.querySelector('.control-panel');
const inputElements = document.querySelectorAll('input');
const boardElement = document.querySelector('.board');

const displayController = () => {
  const sendmsg = (contextmsg) => {
    htmlcontainer.textContent = contextmsg;
  };

  const isLevelHard = difficultLevelCheckbox.checked;

  const markBoard = ({ mark = '', index = '', type = '' } = {}) => {
    switch (type) {
      case 'clear':
        cellsElement.forEach((element) => {
          element.classList.remove('playero', 'playerx', 'win', 'draw');
        });
        break;
      case 'win':
        cellsElement.forEach((element) => {
          element.classList.remove('playero', 'playerx');
          element.classList.add('win');
        });
        break;
      case 'draw':
        cellsElement.forEach((element) => {
          element.classList.remove('playero', 'playerx');
          element.classList.add('draw');
        });
        break;
      case 'play':
        cellsElement[index].textContent = mark;
        cellsElement[index].classList.add(`player${mark}`);
        break;
      default:
        break;
    }
  };

  const disableInputs = (disable = true) => {
    if (disable) {
      inputElements.forEach((e) => e.setAttribute('disabled', ''));
    } else {
      inputElements.forEach((e) => e.removeAttribute('disabled', ''));
    }
    controlPanelElement.classList.toggle('hide', disable);
  };

  const isPlayerNameValid = (inputOne, inputTwo) => {
    const playerOne = inputOne.value;
    const isComputer = computerCheckbox.checked;
    const playerTwo = isComputer ? 'Computer' : inputTwo.value;
    const valid = () => playerOne !== playerTwo && playerOne !== '' && playerTwo !== '';
    return {
      valid,
      playerOne,
      playerTwo,
    };
  };

  const showBoard = () => boardElement.classList.remove('hide');
  const hideBoard = () => boardElement.classList.add('hide');

  return {
    sendmsg,
    markBoard,
    isPlayerNameValid,
    disableInputs,
    isLevelHard,
    showBoard,
    hideBoard,
  };
};

const gameLogic = () => {
  const isWinner = (cellsValue) => {
    const winPos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    let win = false;
    let winner = 0;

    winPos.forEach((pos) => {
      if (
        cellsValue[pos[0]] &&
        cellsValue[pos[0]] === cellsValue[pos[1]] &&
        cellsValue[pos[0]] === cellsValue[pos[2]]
      ) {
        win = true;
        winner = cellsValue[pos[0]] === 'X' ? 10 : -10;
      }
    });
    return { win, winner };
  };

  const validMoves = (board) => board.filter((i) => i !== 'X' && i !== 'O');
  const isValid = (index, board) => validMoves(board).includes(Number.parseInt(index, 10));
  const isDraw = (board) => validMoves(board).length < 1;

  return {
    isValid,
    validMoves,
    isWinner,
    isDraw,
  };
};

const computerPlayer = () => {
  const { validMoves, isWinner, isDraw } = gameLogic();

  const evaluateBoard = (board) => isWinner(board).winner;

  const minmax = (board, depth, isMax) => {
    const score = evaluateBoard(board);
    let best;
    if (score === 10 || score === -10) {
      return score;
    }
    if (isDraw(board)) {
      return 0;
    }
    if (isMax) {
      best = -1000;
      validMoves(board).forEach((i) => {
        const tempBoard = board.slice();
        tempBoard[i] = 'X';
        best = Math.max(best, minmax(tempBoard, depth + 1, !isMax));
      });
      return best;
    }
    best = 1000;
    validMoves(board).forEach((i) => {
      const tempBoard = board.slice();
      tempBoard[i] = 'O';
      best = Math.min(best, minmax(tempBoard, depth + 1, !isMax));
    });
    return best;
  };

  const findBestMove = (board) => {
    let bestValue = -1000;
    let bestMove;
    validMoves(board).forEach((i) => {
      const tempBoard = board.slice();
      tempBoard[i] = 'X';
      const moveVal = minmax(tempBoard, 0, false);
      if (bestValue < moveVal) {
        bestValue = moveVal;
        bestMove = i;
      }
    });
    return bestMove;
  };

  const choosePosition = (_validMoves) => {
    const randomIndex = Math.floor(Math.random() * _validMoves.length);
    return _validMoves[randomIndex];
  };
  const findEasyMove = (board) => choosePosition(validMoves(board));

  const computerPlay = (board) => {
    const { isLevelHard: hard } = displayController();
    if (hard) {
      return findBestMove(board);
    }
    return findEasyMove(board);
  };
  return { computerPlay };
};

const gameBoard = (boardCells) => {
  const { isValid, validMoves, isWinner, isDraw } = gameLogic();
  const { computerPlay } = computerPlayer();
  const cells = boardCells;
  const { sendmsg, markBoard, isPlayerNameValid, disableInputs, showBoard, hideBoard } =
    displayController();

  let started = false;
  let players = [];
  let playerturn = 0;

  const boardValuesxIsFilled = [];

  const clear = () => {
    started = false;
    players = [];
    playerturn = 0;
    markBoard({ type: 'clear' });
    cells.forEach((_item, index) => {
      cells[index].textContent = '';
      boardValuesxIsFilled.splice(index, 1, index);
    });
  };

  const reset = () => {
    clear();
    hideBoard();
    disableInputs(false);
  };

  const start = () => {
    clear();
    const { valid, playerOne, playerTwo } = isPlayerNameValid(playerOneInput, playerTwoInput);
    if (valid()) {
      disableInputs();
      showBoard();
      players = [player(playerOne, 'O'), player(playerTwo, 'X')];
      started = true;
      sendmsg(`Let's go ... ${players[0].name} :)`);
    } else {
      hideBoard();
      sendmsg('Please, enter a valid name...');
    }
  };

  const match = (cellindex) => {
    if (!started) {
      sendmsg('Game not started, press START button...');
      return;
    }
    if (isValid(cellindex, boardValuesxIsFilled)) {
      const currentPlayer = players[playerturn];
      markBoard({ mark: currentPlayer.sign, index: cellindex, type: 'play' });
      boardValuesxIsFilled[cellindex] = currentPlayer.sign;
      validMoves(boardValuesxIsFilled).splice(cellindex, 1);
      if (isWinner(boardValuesxIsFilled).win) {
        markBoard({ type: 'win' });
        sendmsg(`${currentPlayer.name} wins the game... `);
        started = false;
        return;
      }
      if (isDraw(boardValuesxIsFilled)) {
        markBoard({ type: 'draw' });
        sendmsg("It's a draw... seems like a tough one...");
        started = false;
        return;
      }
      playerturn = playerturn === 0 ? 1 : 0;
    }
    sendmsg(`It's your turn ${players[playerturn].name}... (Player: ${players[playerturn].sign})`);
    if (players[playerturn].name === 'Computer') {
      setTimeout(() => match(computerPlay(boardValuesxIsFilled)), 300);
    }
  };
  return { match, start, reset };
};

const Game = gameBoard(cellsElement);

const handlers = ({
  target: {
    dataset: { id },
  },
}) => {
  switch (id) {
    case 'start':
      Game.start();
      break;
    case 'reset':
      Game.reset();
      break;
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
      Game.match(id);
      break;
    default:
      break;
  }
};

document.addEventListener('click', handlers);

document
  .querySelector('input[type="checkbox"]')
  .addEventListener('click', ({ target: { checked } }) => {
    [playerComputerYes, playerTwoInput].forEach((e) => e.classList.toggle('checked', checked));
    playerComputerNo.classList.toggle('checked', !checked);
    if (checked) {
      setTimeout(() => playerTwoInput.classList.add('hide'), 200);
      difficultLevelContainer.classList.remove('hide');
    } else {
      playerTwoInput.classList.remove('hide');
      difficultLevelContainer.classList.add('hide');
    }
  });
