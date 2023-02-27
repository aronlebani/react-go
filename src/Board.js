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
  const onFinish = (white, black) => console.log(`Finish - white: ${white}, black: ${black}`);
  const [board, click] = useGo(onFinish);

  return (
    <div className="Board">
      {board.map((row, i) => (
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
}

export default Board;
