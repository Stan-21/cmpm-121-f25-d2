import "./style.css";

document.body.innerHTML = `
  <canvas id = "myCanvas" width = "256" height = "256"></canvas>
  <br>
  <button id = "clearButton">Clear</button>
`;

let isDrawing = false;
let x = 0;
let y = 0;

const myCanvas = document.getElementById("myCanvas")!;
const context: CanvasRenderingContext2D = (myCanvas as HTMLCanvasElement)
  .getContext("2d")!;
const clearButton = document.getElementById("clearButton")!;

interface Point {
  pX: number;
  pY: number;
}

let lines: Point[][] = [];
let currentLine: Point[] = [];

myCanvas.addEventListener("mousedown", (e) => {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;

  currentLine = [];
  lines.push(currentLine);
  currentLine.push({ pX: x, pY: y });

  myCanvas.dispatchEvent(event);
});

myCanvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    x = e.offsetX;
    y = e.offsetY;
    currentLine.push({ pX: x, pY: y });

    myCanvas.dispatchEvent(event);
  }
});

myCanvas.addEventListener("mouseup", () => {
  if (isDrawing) {
    x = 0;
    y = 0;
    isDrawing = false;
    currentLine = [];

    myCanvas.dispatchEvent(event);
  }
});

const event = new Event("build");

myCanvas.addEventListener("build", () => {
  for (const line of lines) {
    if (line.length > 1) {
      context.beginPath();
      context.strokeStyle = "black";
      context.lineWidth = 1;
      context.moveTo((line[0] as Point).pX, (line[0] as Point).pY);
      for (const point of line) {
        context.lineTo(point.pX, point.pY);
      }
      context.stroke();
    }
  }
});

clearButton.addEventListener("click", () => {
  lines = [];
  context.clearRect(0, 0, 256, 256); // Note: Need to not hard code width and height values soon
});
