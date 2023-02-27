import { useState } from "react";

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

export const CALCULATION_DEPTH = 1; // 1, 2, or 3
export const ALGORITHM_TYPE = algorithmTypes.MIN_MAX;
export const BOARD_SIZE = 9; // 5, 9, 11, 13, 17, or 19
export const PLAYER_COLOUR = colours.WHITE;
export const COMPUTER_COLOUR = colours.BLACK;

export const useGo = (onFinishGame) => {
  const initialBoard = getArray(BOARD_SIZE).map((i) =>
    getArray(BOARD_SIZE).map((j) => colours.NONE)
  );

  const [board, setBoard] = useState(initialBoard);

  const boardToValues = (b) => {
    return b.map((x) => x.map((y) => y.value));
  };

  const valuesToBoard = (values) => {
    return values.map((row, i) =>
      row.map((col, j) => Object.values(colours).find((c) => c.value === col))
    );
  };

  const click = (e, i, j) => {
    const b = board.map((row, i) => row.map((col, j) => col));

    if (b[i][j].value !== colours.NONE.value) {
      return;
    }

    const playerBoard = playTurn(b, PLAYER_COLOUR, i, j);

    setBoard(playerBoard);

    const { _, y, x } = calculateMoveWithAlgorithm(playerBoard, COMPUTER_COLOUR);

    const computerBoard = playTurn(playerBoard, COMPUTER_COLOUR, y, x);
    setBoard(computerBoard);
  };

  const playTurn = (b, colour, i, j) => {
    const updatedBoard = placeStoneAndEvaluate(b, colour, i, j);

    if (isGameFinished(boardToValues(updatedBoard), BOARD_SIZE)) {
      const [whitePoints, blackPoints] = checkFinalPoints(boardToValues(updatedBoard), BOARD_SIZE);
      onFinishGame(whitePoints, blackPoints);
    }

    return updatedBoard;
  };

  const placeStoneAndEvaluate = (b, colour, x, y) => {
    const newBoard = b.map((row, i) => row.map((col, j) => (i === x && j === y ? colour : col)));

    const [currentValuesChanged, evaluatedValues] = evaluateBoard(
      boardToValues(newBoard),
      BOARD_SIZE
    );

    return currentValuesChanged ? valuesToBoard(evaluatedValues) : newBoard;
  };

  const calculateMoveWithAlgorithm = (b, colour) => {
    if (ALGORITHM_TYPE === algorithmTypes.MIN_MAX) {
      return calculateMinMaxMove(boardToValues(b), colour.value, BOARD_SIZE, CALCULATION_DEPTH);
    } else {
      return calculateMinMaxAlphaBetaPrunedMove(
        boardToValues(b),
        colour.value,
        BOARD_SIZE,
        CALCULATION_DEPTH
      );
    }
  };

  return [board, click];
};
