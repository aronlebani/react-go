import React, { useState } from "react";

import "./Square.css";

import Stone from "./Stone";
import { PLAYER_COLOUR } from "../go/hook";

const Square = (props) => {
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
};

export default Square;
