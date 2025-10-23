import "./style.css";

interface Point {
  x: number;
  y: number;
}

class Line {
  constructor(public points: Point[], public thickness: number) {}

  execute() {
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = this.thickness;
    const { x, y } = this.points[0]!;
    context.moveTo(x, y);
    for (const { x, y } of this.points) {
      context.lineTo(x, y);
    }
    context.stroke();
  }
}

class Cursor {
  constructor(public x: number, public y: number) {}

  execute() {
    if (selectedEmoji) {
      context.font = "16px monospace";
      context.fillText(selectedEmoji, this.x - 8, this.y + 16);
    } else if (thickness == 1) {
      context.font = "32px monospace";
      context.fillText("*", this.x - 8, this.y + 16);
    } else {
      context.font = "64px monospace";
      context.fillText("*", this.x - 16, this.y + 32);
    }
  }
}

class Sticker {
  constructor(public x: number, public y: number, public sticker: string) {}

  execute() {
    context.font = "16px monospace";
    context.fillText(this.sticker, this.x - 8, this.y + 16);
  }
}

document.body.innerHTML = `
  <canvas id = "myCanvas" width = "256" height = "256"></canvas>
  <br>
  <button id = "clearButton">Clear</button>
  <button id = "undoButton">Undo</button>
  <button id = "redoButton">Redo</button>
  <br>
  <button id = "thinMarker">Thin</button>
  <button id = "thickMarker">Thick</button>
  <br>
  <button id = "rock">🪨</button>
  <button id = "pick">⛏️</button>
  <button id = "bomb">💣</button>
`;

const myCanvas = document.getElementById("myCanvas")!;
const context: CanvasRenderingContext2D = (myCanvas as HTMLCanvasElement)
  .getContext("2d")!;

const clearButton = document.getElementById("clearButton")!;
const undoButton = document.getElementById("undoButton")!;
const redoButton = document.getElementById("redoButton")!;
const thinButton = document.getElementById("thinMarker")!;
const thickButton = document.getElementById("thickMarker")!;

const rockButton = document.getElementById("rock")!;
const pickButton = document.getElementById("pick")!;
const bombButton = document.getElementById("bomb")!;

interface DrawingCommand {
  execute(): void;
}

let lines: DrawingCommand[] = [];
let redoLines: DrawingCommand[] = [];
let currentLine: Line | null;

let thickness = 1;

let cursorCommand: Cursor | null = null;
let selectedEmoji: string | null;

myCanvas.addEventListener("mouseenter", (e) => {
  cursorCommand = new Cursor(e.offsetX, e.offsetY);
  myCanvas.dispatchEvent(toolMoved);
});

myCanvas.addEventListener("mouseleave", () => {
  cursorCommand = null;
  myCanvas.dispatchEvent(toolMoved);
});

myCanvas.addEventListener("mousedown", (e) => {
  if (selectedEmoji) {
    lines.push(new Sticker(e.offsetX, e.offsetY, selectedEmoji));
  } else {
    currentLine = new Line([{ x: e.offsetX, y: e.offsetY }], thickness);
    lines.push(currentLine);
  }
  redoLines = [];

  myCanvas.dispatchEvent(event);
});

myCanvas.addEventListener("mousemove", (e) => {
  cursorCommand = new Cursor(e.offsetX, e.offsetY);
  myCanvas.dispatchEvent(toolMoved);
  if (currentLine) {
    currentLine.points.push({ x: e.offsetX, y: e.offsetY });
    myCanvas.dispatchEvent(event);
  }
});

myCanvas.addEventListener("mouseup", () => {
  currentLine = null;
  myCanvas.dispatchEvent(event);
});

const event = new Event("drawing-changed");
const toolMoved = new Event("tool-moved");

myCanvas.addEventListener("drawing-changed", () => {
  context.clearRect(0, 0, 256, 256);
  lines.forEach((cmd) => cmd.execute());
});

myCanvas.addEventListener("tool-moved", () => {
  if (cursorCommand) {
    myCanvas.dispatchEvent(event);
    cursorCommand.execute();
  }
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

thinButton.addEventListener("click", () => {
  selectedEmoji = null;
  thickness = 1;
});

thickButton.addEventListener("click", () => {
  selectedEmoji = null;
  thickness = 5;
});

rockButton.addEventListener("click", () => {
  selectedEmoji = "🪨";
  myCanvas.dispatchEvent(toolMoved);
});

pickButton.addEventListener("click", () => {
  selectedEmoji = "⛏️";
  myCanvas.dispatchEvent(toolMoved);
});

bombButton.addEventListener("click", () => {
  selectedEmoji = "💣";
  myCanvas.dispatchEvent(toolMoved);
});
