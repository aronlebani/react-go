import React from "react";

import "./Stone.css";

const Stone = props => {
  const { colour } = props;

  return <div className={`Stone ${colour.className}`}></div>;
};

export default Stone;
