import { useState } from "react";

import "./Board.css";

import { useGo } from "./hooks";

import { getArray } from "./utils";

const BOARD_SIZE = 9;

function Stone(props) {
  const { colour } = props;

  return (
    <div className={`Stone ${colour.className}`}></div>
  );
};

function Square(props) {
  const { getColour, setColour } = props;

  const [isHover, setIsHover] = useState(false);

  return (
    <div
      className="Square"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={() => setColour()}
    >
      <Stone colour={getColour(isHover)} />
    </div>
  );
};

function Board() {
  const [getColourAt, setColourAt] = useGo(BOARD_SIZE);

  return (
    <div className="Board">
      {getArray(BOARD_SIZE).map(i =>
        getArray(BOARD_SIZE).map(j =>
          <Square
            key={`${i}-${j}`}
            getColour={isHover => getColourAt(i, j, isHover)}
            setColour={() => setColourAt(i, j)}
          />
        )
      )
      .flat()}
    </div>
  );
};

export default Board;
