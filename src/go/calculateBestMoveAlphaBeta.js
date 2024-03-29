import { evaluateBoard } from "./boardStateEvaluation";
import {
  isFieldSurroundedByJustOneColor,
  isGameFinished,
  checkFinalPoints,
} from "./boardFinishEvaluation";
import { checkCurrentPoints, isFieldSurroundedByNothing } from "./boardCurrentEvaluation";
import { colours } from "./hook";

/**
 * Returns object with outcome, x and y where player should set stone
 * to potentially obtain best results calculated by min-max algorithm
 */
export const calculateMinMaxAlphaBetaPrunedMove = (
  currValues,
  playerColor,
  boardSize,
  depth = 1
) => {
  return calculateBestMove(
    currValues,
    playerColor,
    boardSize,
    depth * 2,
    { outcome: Number.MIN_VALUE },
    { outcome: Number.MAX_VALUE }
  );
};

/**
 * It gives best (max) new values (worst for opponent)
 */
const calculateBestMove = (currValues, playerColor, boardSize, depthIteration, alpha, beta) => {
  const movesOutcomes = calculateMovesOutcomes(
    currValues,
    playerColor,
    boardSize,
    depthIteration,
    alpha,
    beta
  );

  if (!(movesOutcomes instanceof Array)) {
    return movesOutcomes;
  }

  const bestResult = movesOutcomes.reduce((prev, current) =>
    prev.outcome > current.outcome ? prev : current
  );

  return bestResult;
};

/**
 * It gives worst (min) new values (best for opponent)
 */
const calculateWorstCountermove = (
  currValues,
  playerColor,
  boardSize,
  depthIteration,
  alpha,
  beta
) => {
  const movesOutcomes = calculateMovesOutcomes(
    currValues,
    playerColor,
    boardSize,
    depthIteration,
    alpha,
    beta
  );

  if (!(movesOutcomes instanceof Array)) {
    return movesOutcomes;
  }

  const worstCounterresult = movesOutcomes.reduce((prev, current) =>
    prev.outcome < current.outcome ? prev : current
  );

  return worstCounterresult;
};

/**
 * It calculates possible values with their outcomes for player
 */
const calculateMovesOutcomes = (
  currValues,
  playerColor,
  boardSize,
  depthIteration,
  alpha,
  beta
) => {
  const boardSqrtSize = boardSize * boardSize;
  let movesOutcomes = new Array(boardSqrtSize);

  let deeperAlpha = alpha;
  let deeperBeta = beta;

  for (let i = 0; i < boardSqrtSize; i++) {
    const y = ~~(i / boardSize);
    const x = i % boardSize;
    const calculatedOutcome = calculateMoveMaxMinOutcome(
      currValues,
      playerColor,
      currValues[y][x],
      y,
      x,
      boardSize,
      depthIteration,
      deeperAlpha,
      deeperBeta
    );
    movesOutcomes[i] = calculatedOutcome;

    // for max calculations for opponent
    if (isEvenIteration(depthIteration)) {
      if (beta.outcome <= calculatedOutcome.outcome) {
        /**
         * The same as in odd iteration, but now we need to be sure here (in this taken strategy) we will not have any outcome higher then it was in previously
         * considered strategies. If we will have, then no need to consider another outcomes, and so return beta (previous outcome from previous strategy).
         */
        return beta;
      }
      if (deeperAlpha.outcome > calculatedOutcome.outcome) {
        deeperAlpha = {
          outcome: calculatedOutcome.outcome,
          y: calculatedOutcome.y,
          x: calculatedOutcome.x,
        };
      }
    } else {
      if (alpha.outcome >= calculatedOutcome.outcome) {
        /**
         * Do not check othet counter-player's outcomes, as there was previous strategy alpha which already gave better or the same outcome and
         * counter-player already will not give us better outcome (just may give worse as it will be better for him/her)
         *
         * return just alpha (previous worst outcome from best strategy), as strategy giving now calculated outcomes will not be considered at all, thus the whole movesOutcomes now doesn't matter
         */
        return alpha;
      }
      if (deeperBeta.outcome < calculatedOutcome.outcome) {
        deeperBeta = {
          outcome: calculatedOutcome.outcome,
          y: calculatedOutcome.y,
          x: calculatedOutcome.x,
        };
      }
    }
  }

  return movesOutcomes;
};

const calculateMoveMaxMinOutcome = (
  currValues,
  playerColor,
  val,
  y,
  x,
  boardSize,
  depthIteration,
  alpha,
  beta
) => {
  if (
    val === 0 &&
    !isFieldSurroundedByNothing(currValues, y, x, boardSize) &&
    !isFieldSurroundedByJustOneColor(currValues, y, x, boardSize)
  ) {
    return calculateMoveMaxOutcome(
      currValues,
      playerColor,
      y,
      x,
      boardSize,
      depthIteration,
      alpha,
      beta
    );
  } else {
    if (isEvenIteration(depthIteration)) {
      return { outcome: -1000, y: y, x: x };
    } else {
      return { outcome: 1000, y: y, x: x };
    }
  }
};

const calculateMoveMaxOutcome = (
  currValues,
  playerColor,
  y,
  x,
  boardSize,
  depthIteration,
  alpha,
  beta
) => {
  let newValues = currValues.map((arr) => arr.slice());

  newValues[y][x] = playerColor;

  // Evaluate new board
  let [currentValuesChanged, evaluatedValues] = evaluateBoard(
    newValues,
    boardSize,
    playerColor,
    y,
    x
  );
  if (currentValuesChanged) {
    newValues = evaluatedValues;
  }

  if (isGameFinished(newValues, boardSize)) {
    /**
     * Calculate final points at which the game will stopped
     */
    const [whitePoints, blackPoints] = checkFinalPoints(newValues, boardSize);
    const currentPoints = playerColor === colours.WHITE.value ? whitePoints : blackPoints;
    const opponentPoints = playerColor === colours.WHITE.value ? blackPoints : whitePoints;
    const points = evaluatePoints(currentPoints, opponentPoints);

    return { outcome: points, y: y, x: x };
  }

  if (depthIteration <= 1) {
    /**
     * Check points in current game tree state, i.e. this time when game is not yet in end state, but depth of calculations is reached
     */
    const [whitePoints, blackPoints] = checkCurrentPoints(newValues, boardSize);
    const currentPoints = playerColor === colours.WHITE.value ? whitePoints : blackPoints;
    const opponentPoints = playerColor === colours.WHITE.value ? blackPoints : whitePoints;
    const points = evaluatePoints(currentPoints, opponentPoints);

    return { outcome: points, y: y, x: x };
  }

  // Use this evaluated new board and calculate another set of move max outcomes for opponent, then take min from that set of opponent's outcomes
  if (isEvenIteration(depthIteration)) {
    const newDepthIteration = depthIteration - 1;
    const opponentColor =
      playerColor === colours.WHITE.vlaue ? colours.BLACK.value : colours.WHITE.value;
    const calculatedNextMove = calculateWorstCountermove(
      newValues,
      opponentColor,
      boardSize,
      newDepthIteration,
      alpha,
      beta
    );
    return { outcome: calculatedNextMove.outcome, y: y, x: x };
  } else {
    const newDepthIteration = depthIteration - 1;
    const currentColor =
      playerColor === colours.WHITE.value ? colours.BLACK.value : colours.WHITE.value;
    const calculatedNextMove = calculateBestMove(
      newValues,
      currentColor,
      boardSize,
      newDepthIteration,
      alpha,
      beta
    );
    return { outcome: calculatedNextMove.outcome, y: y, x: x };
  }
};

/**
 * Evaluate points from the current player perspective - if higher its better, if lower then its worse
 */
const evaluatePoints = (currentPoints, opponentPoints) => {
  return opponentPoints - currentPoints;
};

const isEvenIteration = (n) => {
  return n % 2 == 0;
};
