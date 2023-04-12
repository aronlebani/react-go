import { direction } from "./hook";

export const evaluateBoard = (values, boardSize, currentPlayer, yPlayer, xPlayer) => {
  const positionsToCheck = [
    [yPlayer, xPlayer],
    xPlayer + 1 < boardSize && [yPlayer, xPlayer + 1],
    xPlayer - 1 >= 0 && [yPlayer, xPlayer - 1],
    yPlayer + 1 < boardSize && [yPlayer + 1, xPlayer],
    yPlayer - 1 >= 0 && [yPlayer - 1, xPlayer],
  ].filter(Boolean);

  for (let position of positionsToCheck) {
    const y = position[0];
    const x = position[1];
    const val = values[y][x];

    if (val === 0) {
      continue;
    }

    const [currentValuesChanged, evaluatedValues] = evaluateCurrentValue(
      values,
      val,
      y,
      x,
      boardSize
    );

    if (currentValuesChanged) {
      const suicide =
        isSuicide(values, evaluatedValues, boardSize, currentPlayer) &&
        !isCapture(values, evaluatedValues, boardSize, currentPlayer);

      return [true, evaluatedValues, suicide];
    }
  }

  return [false, values, false];
};

export const __evaluateBoard = (newValues, boardSize, currentPlayer, yPlayer, xPlayer) => {
  let valuesWereChanged = false;
  let valuesAreChanged = false;

  do {
    valuesAreChanged = false;
    // Iterate over the whole board
    for (let y = 0; y < boardSize; y++) {
      const row = newValues[y];
      let isChanged = false;
      for (let x = 0; x < boardSize; x++) {
        const val = row[x];
        if (val != 0) {
          let [currentValuesChanged, evaluatedValues] = evaluateCurrentValue(
            newValues,
            val,
            y,
            x,
            boardSize
          );
          isChanged = currentValuesChanged;
          if (currentValuesChanged) {
            valuesWereChanged = true;
            valuesAreChanged = true;
            newValues = evaluatedValues;
            break;
          }
        }
      }
      if (isChanged) {
        break;
      }
    }
  } while (valuesAreChanged);
  return [valuesWereChanged, newValues];
};

const isSuicide = (values, newValues, boardSize, currentPlayer) => {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (newValues[y][x] === 0 && values[y][x] === currentPlayer) {
        return true;
      }
    }
  }

  return false;
};

const isCapture = (values, newValues, boardSize, currentPlayer) => {
  const opponentPlayer = currentPlayer === 1 ? 2 : 1;
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (newValues[y][x] === 0 && values[y][x] === opponentPlayer) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Check if the current stone in given place is surrounded by opponent's stones
 */
const evaluateCurrentValue = (newValues, val, yVal, xVal, boardSize) => {
  const opponentColor = val === 1 ? 2 : 1;
  let valuesAreChanged = false;
  // Check top
  if (yVal != 0) {
    if (newValues[yVal - 1][xVal] === opponentColor) {
      let [isSorrounded, obtainedValues] = evaluateOpponentValue(
        newValues,
        val,
        yVal - 1,
        xVal,
        direction.BOTTOM,
        boardSize
      );
      if (isSorrounded) {
        valuesAreChanged = true;
        newValues = obtainedValues;
      }
    }
  }
  // Check right
  if (xVal !== boardSize - 1) {
    if (newValues[yVal][xVal + 1] === opponentColor) {
      let [isSorrounded, obtainedValues] = evaluateOpponentValue(
        newValues,
        val,
        yVal,
        xVal + 1,
        direction.LEFT,
        boardSize
      );
      if (isSorrounded) {
        valuesAreChanged = true;
        newValues = obtainedValues;
      }
    }
  }
  // Check bottom
  if (yVal !== boardSize - 1) {
    if (newValues[yVal + 1][xVal] === opponentColor) {
      let [isSorrounded, obtainedValues] = evaluateOpponentValue(
        newValues,
        val,
        yVal + 1,
        xVal,
        direction.TOP,
        boardSize
      );
      if (isSorrounded) {
        valuesAreChanged = true;
        newValues = obtainedValues;
      }
    }
  }
  // Check left
  if (xVal != 0) {
    if (newValues[yVal][xVal - 1] === opponentColor) {
      let [isSorrounded, obtainedValues] = evaluateOpponentValue(
        newValues,
        val,
        yVal,
        xVal - 1,
        direction.RIGHT,
        boardSize
      );
      if (isSorrounded) {
        valuesAreChanged = true;
        newValues = obtainedValues;
      }
    }
  }
  // Resluting Values after current value is placed
  return [valuesAreChanged, newValues];
};

const evaluateOpponentValue = (
  newValues,
  val,
  yVal,
  xVal,
  prevDirection,
  boardSize,
  checkedValuesMap
) => {
  if (!checkedValuesMap)
    checkedValuesMap = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
  checkedValuesMap[yVal][xVal] = 1;

  const opponentColor = val === 1 ? 2 : 1;
  let evaluatedValues = newValues.map((arr) => arr.slice());

  // Check top
  if (yVal != 0 && prevDirection !== direction.TOP && checkedValuesMap[yVal - 1][xVal] != 1) {
    if (evaluatedValues[yVal - 1][xVal] === opponentColor) {
      let [isSorrounded, obtainedValues, checkedValuesObtained] = evaluateOpponentValue(
        evaluatedValues,
        val,
        yVal - 1,
        xVal,
        direction.BOTTOM,
        boardSize,
        checkedValuesMap.map((arr) => arr.slice())
      );
      if (!isSorrounded) {
        return [false, newValues];
      }
      evaluatedValues = obtainedValues;
      checkedValuesMap = checkedValuesObtained;
    } else if (evaluatedValues[yVal - 1][xVal] === 0) {
      return [false, newValues];
    }
  }
  // Check right
  if (
    xVal !== boardSize - 1 &&
    prevDirection !== direction.RIGHT &&
    checkedValuesMap[yVal][xVal + 1] != 1
  ) {
    if (evaluatedValues[yVal][xVal + 1] === opponentColor) {
      let [isSorrounded, obtainedValues, checkedValuesObtained] = evaluateOpponentValue(
        evaluatedValues,
        val,
        yVal,
        xVal + 1,
        direction.LEFT,
        boardSize,
        checkedValuesMap.map((arr) => arr.slice())
      );
      if (!isSorrounded) {
        return [false, newValues];
      }
      evaluatedValues = obtainedValues;
      checkedValuesMap = checkedValuesObtained;
    } else if (evaluatedValues[yVal][xVal + 1] === 0) {
      return [false, newValues];
    }
  }
  // Check bottom
  if (
    yVal !== boardSize - 1 &&
    prevDirection !== direction.BOTTOM &&
    checkedValuesMap[yVal + 1][xVal] != 1
  ) {
    if (evaluatedValues[yVal + 1][xVal] === opponentColor) {
      let [isSorrounded, obtainedValues, checkedValuesObtained] = evaluateOpponentValue(
        evaluatedValues,
        val,
        yVal + 1,
        xVal,
        direction.TOP,
        boardSize,
        checkedValuesMap.map((arr) => arr.slice())
      );
      if (!isSorrounded) {
        return [false, newValues];
      }
      evaluatedValues = obtainedValues;
      checkedValuesMap = checkedValuesObtained;
    } else if (evaluatedValues[yVal + 1][xVal] === 0) {
      return [false, newValues];
    }
  }
  // Check left
  if (xVal != 0 && prevDirection !== direction.LEFT && checkedValuesMap[yVal][xVal - 1] != 1) {
    if (evaluatedValues[yVal][xVal - 1] === opponentColor) {
      let [isSorrounded, obtainedValues, checkedValuesObtained] = evaluateOpponentValue(
        evaluatedValues,
        val,
        yVal,
        xVal - 1,
        direction.RIGHT,
        boardSize,
        checkedValuesMap.map((arr) => arr.slice())
      );
      if (!isSorrounded) {
        return [false, newValues];
      }
      evaluatedValues = obtainedValues;
      checkedValuesMap = checkedValuesObtained;
    } else if (evaluatedValues[yVal][xVal - 1] === 0) {
      return [false, newValues];
    }
  }
  // If opponent is surrounded
  evaluatedValues[yVal][xVal] = 0;
  return [true, evaluatedValues, checkedValuesMap];
};
