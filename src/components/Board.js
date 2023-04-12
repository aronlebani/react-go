import React from "react";

import "./Board.css";

import Square from "./Square";

const Board = (props) => {
  const { board, click } = props;

  return (
    <div className={`Board --size-${board.board.length}`}>
      {board.board.map((row, i) => (
        <>
          {row.map((col, j) => (
            <Square
              key={`${i}-${j}-${col.value}`}
              colour={col}
              onClick={() => click(i, j)}
            />
          ))}
        </>
      ))}
    </div>
  );
};

export default Board;
