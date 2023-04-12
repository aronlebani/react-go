import { evaluateBoard } from "./boardStateEvaluation";

test("Nothing interesting has happened", () => {
  const move = [0, 3];
  const before = [
    [0, 0, 1, 2, 0],
    [0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const after = [
    [0, 0, 1, 2, 0],
    [0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0],
  ];

  const [changed, outcome, isSuicide] = evaluateBoard(before, 5, 2, ...move);

  expect(changed).toBe(false);
  expect(outcome).toEqual(after);
  expect(isSuicide).toBe(false);
});

test("Capture simple stone", () => {
  const move = [1, 3];
  const before = [
    [0, 0, 2, 0, 0],
    [0, 2, 1, 2, 0],
    [0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const after = [
    [0, 0, 2, 0, 0],
    [0, 2, 0, 2, 0],
    [0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];

  const [changed, outcome, isSuicide] = evaluateBoard(before, 5, 2, ...move);

  expect(changed).toBe(true);
  expect(outcome).toEqual(after);
  expect(isSuicide).toBe(false);
});

test("Capture complex stone", () => {
  const move = [0, 2];
  const before = [
    [0, 0, 2, 0, 0],
    [0, 2, 1, 2, 2],
    [0, 2, 1, 1, 1],
    [1, 1, 2, 1, 2],
    [0, 1, 0, 2, 0],
  ];
  const after = [
    [0, 0, 2, 0, 0],
    [0, 2, 0, 2, 2],
    [0, 2, 0, 0, 0],
    [1, 1, 2, 0, 2],
    [0, 1, 0, 2, 0],
  ];

  const [changed, outcome, isSuicide] = evaluateBoard(before, 5, 2, ...move);

  expect(changed).toBe(true);
  expect(outcome).toEqual(after);
  expect(isSuicide).toBe(false);
});

test("Suicide if taking your own last liberty", () => {
  const move = [0, 4];
  const before = [
    [0, 0, 0, 1, 2],
    [0, 0, 0, 1, 2],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const after = [
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];

  const [changed, outcome, isSuicide] = evaluateBoard(before, 5, 2, ...move);

  expect(changed).toBe(true);
  expect(outcome).toEqual(after);
  expect(isSuicide).toBe(true);
});

test("Not suicide if complex stone still has liberties", () => {
  const move = [0, 2];
  const before = [
    [0, 1, 2, 1, 1],
    [1, 2, 2, 2, 1],
    [2, 2, 1, 2, 1],
    [1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const after = [
    [0, 1, 2, 1, 1],
    [1, 2, 2, 2, 1],
    [2, 2, 1, 2, 1],
    [1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0],
  ];

  const [changed, outcome, isSuicide] = evaluateBoard(before, 5, 2, ...move);

  expect(changed).toBe(false);
  expect(outcome).toEqual(after);
  expect(isSuicide).toBe(false);
});

test("Not suicide if taking opponents last liberty - on boundary", () => {
  const move = [0, 3];
  const before = [
    [0, 0, 1, 2, 1],
    [0, 0, 1, 1, 2],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const after = [
    [0, 0, 1, 2, 0],
    [0, 0, 1, 1, 2],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];

  const [changed, outcome, isSuicide] = evaluateBoard(before, 5, 2, ...move);

  expect(changed).toBe(true);
  expect(outcome).toEqual(after);
  expect(isSuicide).toBe(false);
});

test("Not suicide if taking opponents last liberty - not in order of iteration", () => {
  const move = [2, 1];
  const before = [
    [0, 0, 0, 0, 0],
    [0, 1, 2, 0, 0],
    [1, 2, 1, 2, 0],
    [0, 1, 2, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const after = [
    [0, 0, 0, 0, 0],
    [0, 1, 2, 0, 0],
    [1, 2, 0, 2, 0],
    [0, 1, 2, 0, 0],
    [0, 0, 0, 0, 0],
  ];

  const [changed, outcome, isSuicide] = evaluateBoard(before, 5, 2, ...move);

  expect(changed).toBe(true);
  expect(outcome).toEqual(after);
  expect(isSuicide).toBe(false);
});

test("Not suicide if taking opponents last liberty - in order of iteration", () => {
  const move = [2, 2];
  const before = [
    [0, 0, 0, 0, 0],
    [0, 2, 1, 0, 0],
    [2, 1, 2, 1, 0],
    [0, 2, 1, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const after = [
    [0, 0, 0, 0, 0],
    [0, 2, 1, 0, 0],
    [2, 0, 2, 1, 0],
    [0, 2, 1, 0, 0],
    [0, 0, 0, 0, 0],
  ];

  const [changed, outcome, isSuicide] = evaluateBoard(before, 5, 2, ...move);

  expect(changed).toBe(true);
  expect(outcome).toEqual(after);
  expect(isSuicide).toBe(false);
});

test("test1", () => {
  const move = [4, 4];
  const before = [
    [0, 2, 2, 0, 0],
    [0, 0, 1, 2, 0],
    [0, 0, 2, 0, 2],
    [0, 0, 0, 2, 1],
    [0, 0, 0, 2, 2],
  ];
  const after = [
    [0, 2, 2, 0, 0],
    [0, 0, 1, 2, 0],
    [0, 0, 2, 0, 2],
    [0, 0, 0, 2, 0],
    [0, 0, 0, 2, 2],
  ];

  const [changed, outcome, isSuicide] = evaluateBoard(before, 5, 2, ...move);

  expect(changed).toBe(true);
  expect(outcome).toEqual(after);
  expect(isSuicide).toBe(false);
});

test("test2", () => {
  const move = [0, 4];
  const before = [
    [0, 0, 1, 2, 2],
    [0, 0, 0, 1, 1],
    [0, 2, 1, 0, 1],
    [0, 2, 0, 1, 0],
    [0, 2, 0, 0, 0],
  ];
  const after = [
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1],
    [0, 2, 1, 0, 1],
    [0, 2, 0, 1, 0],
    [0, 2, 0, 0, 0],
  ];

  const [changed, outcome, isSuicide] = evaluateBoard(before, 5, 2, ...move);

  expect(changed).toBe(true);
  expect(outcome).toEqual(after);
  expect(isSuicide).toBe(true);
});

test("test3", () => {
  const move = [0, 4];
  const before = [
    [2, 0, 2, 1, 1],
    [0, 2, 1, 1, 1],
    [2, 2, 2, 0, 1],
    [2, 2, 0, 2, 0],
    [1, 1, 2, 0, 2],
  ];
  const after = [
    [2, 0, 2, 1, 0],
    [0, 2, 1, 1, 1],
    [2, 2, 2, 0, 1],
    [2, 2, 0, 2, 0],
    [0, 0, 2, 0, 2],
  ];

  const [changed, outcome, isSuicide] = evaluateBoard(before, 5, 1, ...move);

  expect(changed).toBe(true);
  expect(outcome).toEqual(after);
  expect(isSuicide).toBe(true);
});
