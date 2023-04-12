import React, { useState } from "react";

import "./App.css";

import Board from "./components/Board";
import { algorithmTypes, useGo } from "./go/hook";

function App() {
  const handleFinish = (whitePoints, blackPoints) => {
    if (blackPoints > whitePoints) {
      alert("Black wins");
    } else {
      alert("White wins");
    }
  };

  const [boardSize, setBoardSize] = useState(5);
  const [algorithmType, setAlgorithmType] = useState(algorithmTypes.MIN_MAX);
  const [calculationDepth, setCalculationDepth] = useState(3);

  const { board, click, pass, resetBoard, isWaiting, computerPassed } = useGo(
    handleFinish,
    boardSize,
    algorithmType,
    calculationDepth
  );

  return (
    <div className="App">
      <Board board={board} click={click} />
      <button onClick={() => pass()}>Pass</button>
      <div>
        <div>
          <div>Board size: {boardSize}</div>
          <button onClick={() => setBoardSize(5)}>5</button>
          <button onClick={() => setBoardSize(9)}>9</button>
        </div>
        <div>
          <div>Calculation depth: {calculationDepth}</div>
          <button onClick={() => setCalculationDepth(1)}>1</button>
          <button onClick={() => setCalculationDepth(2)}>2</button>
          <button onClick={() => setCalculationDepth(3)}>3</button>
        </div>
        <div>
          <div>Algorithm: {algorithmType}</div>
          <button onClick={() => setAlgorithmType(algorithmTypes.MIN_MAX)}>MIN-MAX</button>
          <button onClick={() => setAlgorithmType(algorithmTypes.MIN_MAX_A_B)}>
            MIN-MAX (alpha-beta)
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
