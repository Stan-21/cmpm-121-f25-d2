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

myCanvas.addEventListener("mousedown", (e) => {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
});

myCanvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    drawLine(e.offsetX, e.offsetY);
    x = e.offsetX;
    y = e.offsetY;
  }
});

myCanvas.addEventListener("mouseup", (e) => {
  if (isDrawing) {
    drawLine(e.offsetX, e.offsetY);
    x = 0;
    y = 0;
    isDrawing = false;
  }
});

function drawLine(offsetX: number, offsetY: number) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.moveTo(x, y);
  context.lineTo(offsetX, offsetY);
  context.stroke();
  context.closePath();
}

clearButton.addEventListener("click", () => {
  context.clearRect(0, 0, 256, 256);
});
