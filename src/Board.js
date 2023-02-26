import { useState } from "react";

import "./Board.css";

import { PLAYER_COLOUR, useGo } from "./go/state";

function Stone(props) {
  const { colour } = props;

  return <div className={`Stone ${colour.className}`}></div>;
}

function Square(props) {
  const { colour, onClick } = props;

  const [isHover, setIsHover] = useState(false);

  const squareColour = isHover
    ? PLAYER_COLOUR
    : colour;

  return (
    <div
      className="Square"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={onClick}
    >
      <Stone colour={squareColour} />
    </div>
  );
}

function Board() {
  const [board, click] = useGo();

  return (
    <div className="Board">
      {board.map((row, i) => (
        <div key={`${i}`}>
          {row.map((col, j) => (
            <Square
              key={`${i}-${j}-${col.value}`}
              colour={col}
              onClick={() => click(i, j)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Board;
