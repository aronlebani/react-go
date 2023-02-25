import { useState } from "react";

import { getArray } from "./utils";

const colours = [
  {
    id: 0,
    colour: "none",
    className: "--colour-none",
  },
  {
    id: 1,
    colour: "white",
    className: "--colour-white",
  },
  {
    id: 2,
    colour: "black",
    className: "--colour-black",
  },
];

const hasStone = colour => colour.id > 0;

const useGo = (boardSize) => {
  const initialBoard =
    getArray(boardSize).map(i =>
      getArray(boardSize).map(j =>
        colours[0]
      )
    );

  const [board, setBoard] = useState(initialBoard);
  const [currentColour, setCurrentColour] = useState(colours[1]);

  const changeColour = () => {
    if (currentColour === colours[1]) {
      setCurrentColour(colours[2]);
    } else if (currentColour === colours[2]) {
      setCurrentColour(colours[1]);
    }
  };

  const getColourAt = (i, j, hover = false) => {
    const colour = board[i][j];

    if (hover) {
      return hasStone(colour) ? colour : currentColour;
    }

    return board[i][j];
  };

  const setColourAt = (x, y) => {
    let newBoard = board;

    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (i === x && j === y) {
          newBoard[i][j] = currentColour;
        } else {
          newBoard[i][j] = board[i][j];
        }
      }
    }

    setBoard(newBoard);

    changeColour();
  };

  return [getColourAt, setColourAt];
};

export {
  useGo,
};
