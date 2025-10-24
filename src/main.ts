import "./style.css";

interface Point {
  x: number;
  y: number;
}

class Line {
  constructor(public points: Point[], public thickness: number) {}

  execute(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = this.thickness;
    const { x, y } = this.points[0]!;
    ctx.moveTo(x, y);
    for (const { x, y } of this.points) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

class Cursor {
  constructor(public x: number, public y: number) {}

  execute(ctx: CanvasRenderingContext2D) {
    if (selectedEmoji) {
      ctx.font = "16px monospace";
      ctx.fillText(selectedEmoji, this.x - 8, this.y + 16);
    } else if (thickness == 1) {
      ctx.font = "32px monospace";
      ctx.fillText("*", this.x - 8, this.y + 16);
    } else {
      ctx.font = "64px monospace";
      ctx.fillText("*", this.x - 16, this.y + 32);
    }
  }
}

class Sticker {
  constructor(public x: number, public y: number, public sticker: string) {}

  execute(ctx: CanvasRenderingContext2D) {
    ctx.font = "16px monospace";
    ctx.fillText(this.sticker, this.x - 8, this.y + 16);
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
  <button id = "customSticker">Add Custom Sticker</button>
  <button id = "export">Export</button>
  <br>
`;

const myCanvas = document.getElementById("myCanvas")!;
const context: CanvasRenderingContext2D = (myCanvas as HTMLCanvasElement)
  .getContext("2d")!;

const clearButton = document.getElementById("clearButton")!;
const undoButton = document.getElementById("undoButton")!;
const redoButton = document.getElementById("redoButton")!;
const thinButton = document.getElementById("thinMarker")!;
const thickButton = document.getElementById("thickMarker")!;

const customButton = document.getElementById("customSticker")!;
const exportButton = document.getElementById("export")!;

const rockButton = document.createElement("button");
rockButton.innerText = "🪨";
const pickButton = document.createElement("button");
pickButton.innerText = "⛏️";
const bombButton = document.createElement("button");
bombButton.innerText = "💣";

const stickerList: HTMLButtonElement[] = [
  rockButton,
  pickButton,
  bombButton,
];

stickerList.forEach((element) => {
  document.body.append(element);
  element.addEventListener("click", () => {
    selectedEmoji = element.innerText;
    myCanvas.dispatchEvent(toolMoved);
  });
});

interface DrawingCommand {
  execute(ctx: CanvasRenderingContext2D): void;
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
  lines.forEach((cmd) => cmd.execute(context));
});

myCanvas.addEventListener("tool-moved", () => {
  if (cursorCommand) {
    myCanvas.dispatchEvent(event);
    cursorCommand.execute(context);
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

customButton.addEventListener("click", () => {
  const text = prompt("Insert custom sticker text", "💣");
  if (text) {
    const sticker = document.createElement("button");
    sticker.innerHTML = text;
    sticker.addEventListener("click", () => {
      selectedEmoji = sticker.innerText;
      myCanvas.dispatchEvent(toolMoved);
    });
    document.body.append(sticker);
  }
});

exportButton.addEventListener("click", () => {
  const canvas = document.createElement("canvas");
  canvas.id = "myCanvas";
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(4, 4);
  lines.forEach((command) => {
    command.execute(ctx);
  });
  const anchor = document.createElement("a");
  anchor.href = canvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});
