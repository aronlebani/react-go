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

export const CALCULATION_DEPTH = 2; // 1, 2, or 3
export const ALGORITHM_TYPE = algorithmTypes.MIN_MAX;
export const BOARD_SIZE = 9; // 5, 9, 11, 13, 17, or 19
export const PLAYER_COLOUR = colours.WHITE;
export const COMPUTER_COLOUR = colours.BLACK;

export const useGo = () => {
  const initialBoard = getArray(BOARD_SIZE).map((i) =>
    getArray(BOARD_SIZE).map((j) => colours.NONE)
  );

  const [board, setBoard] = useState(initialBoard);

  const boardToValues = (board) => {
    return board.map((x) => x.map((y) => y.value));
  };

  const valuesToBoard = (values) => {
    return values.map((x) => x.map((y) => colours.find(c => c.value === y)));
  };

  const click = (i, j) => {
    placeStoneAndEvaluate(PLAYER_COLOUR, i, j);

    if (isGameFinished(boardToValues(board), BOARD_SIZE)) {
      console.log("GAME FINISHED");
      const [whitePoints, blackPoints] = checkFinalPoints(
        boardToValues(board),
        BOARD_SIZE
      );
      console.log(`white points: ${whitePoints}, black points: ${blackPoints}`);
      onFinishGame(whitePoints, blackPoints);

      return;
    }

    const { outcome, y, x } = calculateMoveWithAlgorithm(board, COMPUTER_COLOUR);

    console.log(`calculateMinMaxMove - outcome:${outcome} y:${y} x:${x}`);

    placeStoneAndEvaluate(COMPUTER_COLOUR, y, x);

    if (isGameFinished(boardToValues(board), BOARD_SIZE)) {
      console.log("GAME FINISHED");
      const [whitePoints, blackPoints] = checkFinalPoints(
        boardToValues(board),
        BOARD_SIZE
      );
      console.log(`white points: ${whitePoints}, black points: ${blackPoints}`);
      onFinishGame(whitePoints, blackPoints);
    }
  };

  const placeStone = (colour, i, j) => {
    let newBoard = board;

    newBoard[i][j] = colour;

    setBoard(newBoard);
  };

  const placeStoneAndEvaluate = (colour, i, j) => {
    placeStone(colour, i, j);

    const [currentValuesChanged, evaluatedValues] = evaluateBoard(boardToValues(board), BOARD_SIZE);

    if (currentValuesChanged) {
      setBoard(valuesToBoard(evaluatedValues));
    }
  };

  const onFinishGame = (whitePoints, blackPoints) => {
    // TODO
  };

  const calculateMoveWithAlgorithm = (valuesToCalculate, colour) => {
    if (ALGORITHM_TYPE === algorithmTypes.MIN_MAX) {
      return calculateMinMaxMove(
        boardToValues(valuesToCalculate),
        colour.value,
        BOARD_SIZE,
        CALCULATION_DEPTH
      );
    } else {
      return calculateMinMaxAlphaBetaPrunedMove(
        boardToValues(valuesToCalculate),
        colour.value,
        BOARD_SIZE,
        CALCULATION_DEPTH
      );
    }
  };

  return [board, click];
};
