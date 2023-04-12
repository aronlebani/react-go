import { useState, useEffect } from "react";

import { evaluateBoard } from "./boardStateEvaluation";
import { isGameFinished, checkFinalPoints } from "./boardFinishEvaluation";
import { calculateMinMaxMove } from "./calculateBestMove";
import { calculateMinMaxAlphaBetaPrunedMove } from "./calculateBestMoveAlphaBeta";
import { getArray } from "../utils";

export const colours = {
  NONE: {
    value: 0,
    colour: "none",
    className: "--colour-none",
  },
  WHITE: {
    value: 1,
    colour: "white",
    className: "--colour-white",
  },
  BLACK: {
    value: 2,
    colour: "black",
    className: "--colour-black",
  },
};

export const algorithmTypes = {
  MIN_MAX: "min-max",
  MIN_MAX_A_B: "min-max (alpha-beta pruning)",
};

export const direction = {
  TOP: 1,
  RIGHT: 2,
  BOTTOM: 3,
  LEFT: 4,
};

export const PLAYER_COLOUR = colours.BLACK;
export const COMPUTER_COLOUR = colours.WHITE;

export const useGo = (onFinishGame, BOARD_SIZE, ALGORITHM_TYPE, CALCULATION_DEPTH) => {
  const initialBoard = {
    board: getArray(BOARD_SIZE).map((i) => getArray(BOARD_SIZE).map((j) => colours.NONE)),
    colour: PLAYER_COLOUR,
    move: [null, null],
    pass: 0,
  };

  const [board, setBoard] = useState(initialBoard);

  useEffect(() => {
    checkFinishGame();

    if (board.colour === PLAYER_COLOUR) {
      return;
    }

    const { _, y, x } = calculateMoveWithAlgorithm();
    placeStoneAndEvaluate(x, y);

    checkFinishGame();
  }, [board.colour]);

  useEffect(() => {
    if (board.pass === 2) {
      checkFinishGame(true);
    }
  }, [board.pass]);

  const calculateMoveWithAlgorithm = () => {
    const calculateMove =
      ALGORITHM_TYPE === algorithmTypes.MIN_MAX
        ? calculateMinMaxMove
        : calculateMinMaxAlphaBetaPrunedMove;

    return calculateMove(boardToValues(board), board.colour.value, BOARD_SIZE, CALCULATION_DEPTH);
  };

  const resetBoard = () => {
    setBoard(initialBoard);
  };

  const checkFinishGame = (force = false) => {
    if (isGameFinished(boardToValues(board), BOARD_SIZE) || force) {
      const [whitePoints, blackPoints] = checkFinalPoints(boardToValues(board), BOARD_SIZE);
      onFinishGame(whitePoints, blackPoints);
    }
  };

  const boardToValues = (b) => {
    return b.board.map((x) => x.map((y) => y.value));
  };

  const valuesToBoard = (values, colour, move) => {
    return {
      board: values.map((row, i) =>
        row.map((col, j) => Object.values(colours).find((c) => c.value === col))
      ),
      colour,
      move,
      pass: 0,
    };
  };

  const changeColour = (colour) => {
    if (colour === colours.BLACK) {
      return colours.WHITE;
    } else {
      return colours.BLACK;
    }
  };

  const click = (i, j) => {
    placeStoneAndEvaluate(j, i);
  };

  const pass = (y, x) => {
    setBoard({
      ...board,
      colour: changeColour(board.colour),
      move: [y, x],
      pass: board.pass + 1,
    });
  };

  const goAgain = (y, x) => {
    setBoard({ ...board, move: [y, x], pass: 0, });
  };

  const placeStoneAndEvaluate = (y, x) => {
    const newBoard = {
      board: board.board.map((row, i) =>
        row.map((col, j) => (i === x && j === y ? board.colour : col))
      ),
      colour: changeColour(board.colour),
      move: [y, x],
      pass: 0,
    };

    const [currentValuesChanged, evaluatedValues, isSuicide] = evaluateBoard(
      boardToValues(newBoard),
      BOARD_SIZE,
      board.colour.value,
      x,
      y
    );

    const hasStone = board.board[x][y].value !== colours.NONE.value;
    const isSameMove = y === board.move[0] && x === board.move[1];

    const computerShouldPass =
      board.colour.value === COMPUTER_COLOUR.value && (isSameMove || hasStone || isSuicide);

    if (computerShouldPass) {
      pass(y, x);
      return;
    }

    if (isSuicide || hasStone) {
      goAgain(y, x);
      return;
    }

    const boardToSet = currentValuesChanged
      ? valuesToBoard(evaluatedValues, changeColour(board.colour), [y, x])
      : newBoard;

    setBoard(boardToSet);
  };

  const isWaiting = board.colour.value === COMPUTER_COLOUR.value;

  const computerPassed = board.pass > 0 && !isWaiting

  return { board, click, pass, resetBoard, isWaiting, computerPassed };
};
