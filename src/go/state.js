import { useState } from "react";

import { evaluateBoard } from "./boardStateEvaluation";
import { isGameFinished, checkFinalPoints } from "./boardFinishEvaluation";
import { calculateMinMaxMove } from "./calculateBestMove";
import { calculateMinMaxAlphaBetaPrunedMove } from "./calculateBestMoveAlphaBeta";
import { getRandomInt } from "./boardTest";
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

export const CALCULATION_DEPTH = 3;
export const ALGORITHM_TYPE = algorithmTypes.MIN_MAX;
export const BOARD_SIZE = 9;

export const useGo = () => {
  const initialBoard = getArray(BOARD_SIZE).map((i) => getArray(BOARD_SIZE).map((j) => colours.NONE));

  const [board, setBoard] = useState(initialBoard);
  const [currentColour, setCurrentColour] = useState(colours.WHITE);
  const [firstPlayerCalculationTimes, setFirstPlayerCalculationTimes] = useState([]);
  const [secondPlayerCalculationTimes, setSecondPlayerCalculationTimes] = useState([]);

  const hasStone = (colour) => colour.value > 0;

  const changeColour = () => {
    if (currentColour === colours.WHITE) {
      setCurrentColour(colours.BLACK);
    } else if (currentColour === colours.BLACK) {
      setCurrentColour(colours.WHITE);
    }
  };

  const getOpponentColour = () => {
    if (currentColour === colours.WHITE) {
      return colours.BLACK;
    } else if (currentColour === colours.BLACK) {
      return colours.WHITE;
    }
  };

  const getColourAt = (i, j, hover = false) => {
    const colour = board[i][j];

    if (hover) {
      return hasStone(colour) ? colour : currentColour;
    }

    return board[i][j];
  };

  const boardToValues = (board) => {
    return board.map((x) => x.map((y) => y.value));
  };

  const valuesToBoard = (values) => {
    return board.map((x) => x.map((y) => Object.values(colours).find((c) => c.value === y)));
  };

  const click = (i, j) => {
    let valuesToOperate = boardToValues(board);

    valuesToOperate = placeStoneAndEvaluate(currentColour.value, i, j, valuesToOperate);

    if (isGameFinished(valuesToOperate, BOARD_SIZE)) {
      console.log("GAME FINISHED");
      const [whitePoints, blackPoints] = checkFinalPoints(valuesToOperate, BOARD_SIZE);
      console.log(`white points: ${whitePoints}, black points: ${blackPoints}`);
      onFinishGame(whitePoints, blackPoints);

      return;
    }

    changeColour();

    let valuesToCalculate = valuesToOperate;

    const opponentColour = getOpponentColour();

    const start = +new Date();

    const { outcome, y, x } = calculateMoveWithAlgorithm(
      valuesToCalculate,
      opponentColour.value,
      BOARD_SIZE,
      CALCULATION_DEPTH
    );
    const end = +new Date();
    const diffTime = end - start;
    setSecondPlayerCalculationTimes([...secondPlayerCalculationTimes, diffTime]);

    console.log(`calculateMinMaxMove - outcome:${outcome} y:${y} x:${x}`);
    console.log(`calculateMinMaxMove - time spend:${diffTime}`);

    valuesToOperate = placeStoneAndEvaluate(
      opponentColour.value,
      y + 1,
      x + 1,
      valuesToOperate
    );

    if (isGameFinished(valuesToOperate, BOARD_SIZE)) {
      console.log("GAME FINISHED");
      const [whitePoints, blackPoints] = checkFinalPoints(valuesToOperate, BOARD_SIZE);
      console.log(`white points: ${whitePoints}, black points: ${blackPoints}`);
      onFinishGame(whitePoints, blackPoints);
    }
  };

  const placeStoneAndEvaluate = (color, i, j, valuesToOperate) => {
    valuesToOperate[i - 1][j - 1] = color;
    setBoard(valuesToBoard(valuesToOperate));

    let valuesToEvaluate = valuesToOperate.map((arr) => arr.slice());

    let [currentValuesChanged, evaluatedValues] = evaluateBoard(valuesToEvaluate, BOARD_SIZE);

    if (currentValuesChanged) {
      setBoard(valuesToBoard(evaluatedValues));
      valuesToOperate = evaluatedValues;
    }

    return valuesToOperate;
  };

  const onFinishGame = (whitePoints, blackPoints) => {
    // TODO
  };

  const emptyBoard = () => {
    const emptyBoardValues = getArray(BOARD_SIZE).map(i => getArray(BOARD_SIZE).map(j => 0));

    setBoard(valuesToBoard(emptyBoardValues));
    setCurrentColour(colours.BLACK);
    setFirstPlayerCalculationTimes([]);
    setSecondPlayerCalculationTimes([]);
  };

  const calculateMoveWithAlgorithm = (
    valuesToCalculate,
    opponentColor,
    BOARD_SIZESelected,
    calculationDepthSelected
  ) => {
    if (ALGORITHM_TYPE === algorithmTypes.MIN_MAX) {
      return calculateMinMaxMove(
        valuesToCalculate,
        opponentColor,
        BOARD_SIZESelected,
        calculationDepthSelected
      );
    } else {
      return calculateMinMaxAlphaBetaPrunedMove(
        valuesToCalculate,
        opponentColor,
        BOARD_SIZESelected,
        calculationDepthSelected
      );
    }
  };

  // const testAllAlgorithmsFiveTimes = () => {
  //   /**
  //    * Play 5 times each algorithm depth -> each algorithm depth will have 5 games played i.e. 5 values of games
  //    */
  //   for (let i = 0; i < 5; i++) {
  //     const { testGamesValuesForWhiteForDepths, testGamesTimesForDepths } =
  //       testAllAlgorithms();

  //     for (let secondPlayerDepth = 1; secondPlayerDepth <= 3; secondPlayerDepth++) {
  //       for (let firstPlayerDepth = 1; firstPlayerDepth <= 3; firstPlayerDepth++) {
  //         ALLtestGamesValuesForWhiteForDepths[secondPlayerDepth - 1][firstPlayerDepth - 1][i] =
  //           testGamesValuesForWhiteForDepths[secondPlayerDepth - 1][firstPlayerDepth - 1];
  //         if (firstPlayerDepth === secondPlayerDepth)
  //           ALLtestGamesTimesForDepths[secondPlayerDepth - 1][i] =
  //             testGamesTimesForDepths[secondPlayerDepth - 1];
  //       }
  //     }

  //     console.log(`###   ALL ALGORITHMS TESTES game:${i + 1}   ###`);
  //   }

  //   /**
  //    * Calculate mean values of each algorithm depth from 5 games
  //    */
  //   for (let secondPlayerDepth = 1; secondPlayerDepth <= 3; secondPlayerDepth++) {
  //     for (let firstPlayerDepth = 1; firstPlayerDepth <= 3; firstPlayerDepth++) {
  //       const ALLvalues =
  //         ALLtestGamesValuesForWhiteForDepths[secondPlayerDepth - 1][firstPlayerDepth - 1];
  //       const sumValues = ALLvalues.reduce((a, b) => a + b);
  //       const avgValues = sumValues / ALLvalues.length;
  //       MEANtestGamesValuesForWhiteForDepths[secondPlayerDepth - 1][firstPlayerDepth - 1] =
  //         avgValues;
  //       if (firstPlayerDepth === secondPlayerDepth) {
  //         const ALLtimes = ALLtestGamesTimesForDepths[secondPlayerDepth - 1];
  //         const sumTimes = ALLtimes.reduce((a, b) => a + b);
  //         const avgTimes = sumTimes / ALLtimes.length;
  //         MEANtestGamesTimesForDepths[secondPlayerDepth - 1] = avgTimes;
  //       }
  //     }
  //   }

  //   console.log(MEANtestGamesValuesForWhiteForDepths);
  //   console.log(MEANtestGamesTimesForDepths);
  // };

  // const testAllAlgorithms = () => {
  //   for (let secondPlayerDepth = 1; secondPlayerDepth <= 3; secondPlayerDepth++) {
  //     for (let firstPlayerDepth = 1; firstPlayerDepth <= 3; firstPlayerDepth++) {
  //       emptyBoard();

  //       const firstPlayer = {
  //         firstColor: colors.BLACK,
  //         firstDepth: firstPlayerDepth,
  //       };
  //       const secondPlayer = {
  //         secondColor: colors.WHITE,
  //         secondDepth: secondPlayerDepth,
  //       };

  //       console.log(
  //         `Start first(color:${firstPlayer.firstColor} depth:${firstPlayer.firstDepth}), second(color:${secondPlayer.secondColor} depth: ${secondPlayer.secondDepth})`
  //       );

  //       const { gameValuePointsForWhite, gameTwoPlayersTime } = testTwoAlgorithms(
  //         firstPlayer,
  //         secondPlayer
  //       );

  //       testGameWonsPlayers_FOR_HELP_TO_DETERMINE_PLAYERS[secondPlayerDepth - 1][
  //         firstPlayerDepth - 1
  //       ] = firstPlayerDepth;
  //       testGamesValuesForWhiteForDepths[secondPlayerDepth - 1][firstPlayerDepth - 1] =
  //         gameValuePointsForWhite;
  //       if (firstPlayerDepth === secondPlayerDepth)
  //         testGamesTimesForDepths[secondPlayerDepth - 1] = gameTwoPlayersTime / 2; // Mean value
  //     }
  //   }

  //   return {
  //     testGamesValuesForWhiteForDepths: testGamesValuesForWhiteForDepths,
  //     testGamesTimesForDepths: testGamesTimesForDepths,
  //   };
  // };

  // const testTwoAlgorithms = (firstPlayer, secondPlayer) => {
  //   const { firstColor, firstDepth } = firstPlayer;
  //   const { secondColor, secondDepth } = secondPlayer;

  //   const firstX = getRandomInt(0, BOARD_SIZESelected - 1);
  //   const firstY = getRandomInt(0, BOARD_SIZESelected - 1);

  //   let valuesToOperate = values.map((arr) => arr.slice());

  //   placeStoneAndEvaluate(firstColor, firstY + 1, firstX + 1, valuesToOperate);

  //   let currentColor = secondColor;
  //   let currentDepth = secondDepth;

  //   let firstPlayerGameTime = 0;
  //   let secondPlayerGameTime = 0;

  //   do {
  //     let valuesToCalculate = valuesToOperate.map((arr) => arr.slice());

  //     const start = +new Date();
  //     const { outcome, y, x } = calculateMoveWithAlgorithm(
  //       valuesToCalculate,
  //       currentColor,
  //       BOARD_SIZESelected,
  //       currentDepth
  //     );
  //     const end = +new Date();
  //     const diffTime = end - start;

  //     // console.log(`calculateMinMaxMove - outcome:${outcome} y:${y} x:${x}`)
  //     // console.log(`calculateMinMaxMove - time spend:${diffTime}`)

  //     valuesToOperate = placeStoneAndEvaluate(currentColor, y + 1, x + 1);

  //     if (currentColor === firstColor) {
  //       firstPlayerGameTime += diffTime;
  //       currentDepth = secondDepth;
  //       currentColor = secondColor;
  //     } else {
  //       secondPlayerGameTime += diffTime;
  //       currentDepth = firstDepth;
  //       currentColor = firstColor;
  //     }
  //   } while (!isGameFinished(valuesToOperate, BOARD_SIZESelected));

  //   console.log("GAME FINISHED");
  //   const [whitePoints, blackPoints] = checkFinalPoints(valuesToOperate, BOARD_SIZESelected);
  //   const winnerColor = whitePoints >= blackPoints ? colors.WHITE : colors.BLACK; // Komi rule - if points are equal then white win
  //   console.log(`white points: ${whitePoints}, black points: ${blackPoints}`);
  //   console.log(
  //     `white game calculation time: ${secondPlayerGameTime}, black game calculation time: ${firstPlayerGameTime}`
  //   );

  //   return {
  //     gameValuePointsForWhite: whitePoints - blackPoints,
  //     gameTwoPlayersTime: firstPlayerGameTime + secondPlayerGameTime,
  //   };
  // };

  return [getColourAt, click];
};
