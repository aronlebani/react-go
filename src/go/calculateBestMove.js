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
export const calculateMinMaxMove = (currValues, playerColor, boardSize, depth = 1) => {
  return calculateBestMove(currValues, playerColor, boardSize, depth * 2);
};

/**
 * It gives best (max) new values (worst for opponent)
 */
const calculateBestMove = (currValues, playerColor, boardSize, depthIteration) => {
  const movesOutcomes = calculateMovesOutcomes(currValues, playerColor, boardSize, depthIteration);

  const bestResult = movesOutcomes.reduce((prev, current) =>
    prev.outcome > current.outcome ? prev : current
  );

  return bestResult;
};

/**
 * It gives worst (min) new values (best for opponent)
 */
const calculateWorstCountermove = (currValues, playerColor, boardSize, depthIteration) => {
  const movesOutcomes = calculateMovesOutcomes(currValues, playerColor, boardSize, depthIteration);

  const worstCounterresult = movesOutcomes.reduce((prev, current) =>
    prev.outcome < current.outcome ? prev : current
  );

  return worstCounterresult;
};

/**
 * It calculates possible values with their outcomes for player
 */
const calculateMovesOutcomes = (currValues, playerColor, boardSize, depthIteration) => {
  const boardSqrtSize = boardSize * boardSize;
  let movesOutcomes = new Array(boardSqrtSize);

  for (let i = 0; i < boardSqrtSize; i++) {
    const y = ~~(i / boardSize);
    const x = i % boardSize;
    movesOutcomes[i] = calculateMoveMaxMinOutcome(
      currValues,
      playerColor,
      currValues[y][x],
      y,
      x,
      boardSize,
      depthIteration
    );
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
  depthIteration
) => {
  if (
    val === 0 &&
    !isFieldSurroundedByNothing(currValues, y, x, boardSize) &&
    !isFieldSurroundedByJustOneColor(currValues, y, x, boardSize)
  ) {
    return calculateMoveMaxOutcome(currValues, playerColor, y, x, boardSize, depthIteration);
  } else {
    if (isEvenIteration(depthIteration)) {
      return { outcome: -1000, y: y, x: x };
    } else {
      return { outcome: 1000, y: y, x: x };
    }
  }
};

const calculateMoveMaxOutcome = (currValues, playerColor, y, x, boardSize, depthIteration) => {
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
      playerColor === colours.WHITE.value ? colours.BLACK.value : colours.WHITE.value;
    const calculatedNextMove = calculateWorstCountermove(
      newValues,
      opponentColor,
      boardSize,
      newDepthIteration
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
      newDepthIteration
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
