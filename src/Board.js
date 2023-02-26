import { useState } from "react";

import "./Board.css";

import { BOARD_SIZE, useGo } from "./go/state";

import { getArray } from "./utils";

function Stone(props) {
  const { colour } = props;

  return (
    <div className={`Stone ${colour.className}`}></div>
  );
};

function Square(props) {
  const { getColour, onClick } = props;

  const [isHover, setIsHover] = useState(false);

  return (
    <div
      className="Square"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={onClick}
    >
      <Stone colour={getColour(isHover)} />
    </div>
  );
};

function Board() {
  const [getColourAt, click] = useGo();

  return (
    <div className="Board">
      {getArray(BOARD_SIZE).map(i =>
        getArray(BOARD_SIZE).map(j =>
          <Square
            key={`${i}-${j}`}
            getColour={isHover => getColourAt(i, j, isHover)}
            onClick={() => click(i, j)}
          />
        )
      )
      .flat()}
    </div>
  );
};

export default Board;
