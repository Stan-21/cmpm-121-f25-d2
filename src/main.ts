import "./style.css";

class Line {
  points: Point[];
  constructor(x: number, y: number) {
    this.points = [{ pX: x, pY: y }];
  }

  execute() {
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.moveTo((this.points[0] as Point).pX, (this.points[0] as Point).pY);
    for (const point of this.points) {
      context.lineTo(point.pX, point.pY);
    }
    context.stroke();
  }
}

interface Point {
  pX: number;
  pY: number;
}

document.body.innerHTML = `
  <canvas id = "myCanvas" width = "256" height = "256"></canvas>
  <br>
  <button id = "clearButton">Clear</button>
  <button id = "undoButton">Undo</button>
  <button id = "redoButton">Redo</button>
`;

const myCanvas = document.getElementById("myCanvas")!;
const context: CanvasRenderingContext2D = (myCanvas as HTMLCanvasElement)
  .getContext("2d")!;

const clearButton = document.getElementById("clearButton")!;
const undoButton = document.getElementById("undoButton")!;
const redoButton = document.getElementById("redoButton")!;

let lines: Line[] = [];
let redoLines: Line[] = [];
let currentLine: Line | null;

myCanvas.addEventListener("mousedown", (e) => {
  currentLine = new Line(e.offsetX, e.offsetY);
  lines.push(currentLine);
  redoLines = [];

  myCanvas.dispatchEvent(event);
});

myCanvas.addEventListener("mousemove", (e) => {
  if (currentLine) {
    currentLine.points.push({ pX: e.offsetX, pY: e.offsetY });
  }

  myCanvas.dispatchEvent(event);
});

myCanvas.addEventListener("mouseup", () => {
  currentLine = null;
  myCanvas.dispatchEvent(event);
});

const event = new Event("build");

myCanvas.addEventListener("build", () => {
  context.clearRect(0, 0, 256, 256);
  lines.forEach((cmd) => cmd.execute());
});

clearButton.addEventListener("click", () => {
  lines = [];
  myCanvas.dispatchEvent(event);
});

undoButton.addEventListener("click", () => {
  if (lines.length > 0) {
    const lastLine = lines.pop();
    if (lastLine) {
      redoLines.push(lastLine);
    }
    myCanvas.dispatchEvent(event);
  }
});

redoButton.addEventListener("click", () => {
  if (redoLines.length > 0) {
    const lastLine = redoLines.pop();
    if (lastLine) {
      lines.push(lastLine);
    }
    myCanvas.dispatchEvent(event);
  }
});
