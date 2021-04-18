import { Movable } from "../Movable";
import { CellType, getLevels, Maze } from "./Maze";
import { Box } from "./Box";
import { cellSize, moveSpeed, spriteSize } from "./consts";
import { UI } from "./UI";

import tiles1 from "./sokoban.png";

function getCellInfo(cellType: CellType): [x: number, y: number] {
  let x = 0;
  let y = 0;
  switch (cellType) {
    case CellType.EmptyInside:
      x = 11;
      y = 6;
    break;
    case CellType.BoxPlaceholder:
      x = 11;
      y = 7;
    break;
    case CellType.Wall:
      x = 7;
      y = 6;
    break;
  }
  return [x, y];
}

function getBoxInfo(placed: boolean) {
  return placed ? [1, 0] : [1, 1];
}

type UndoAction = {
  x: number,
  y: number,
  box?: {
    box: Box,
    x: number,
    y: number,
  }
}

export class Game {
  private wallImage = new Image();

  private levels = getLevels();
  private currentLevelIndex = 0;
  private maze: Maze;

  private element = document.createElement("div");

  private staticCanvas = document.createElement("canvas");
  private staticCtx = this.staticCanvas.getContext("2d");

  private playerCanvas = document.createElement("canvas");
  private playerCtx = this.playerCanvas.getContext("2d");

  private ui = new UI(this.container);

  private playerX = 0;
  private playerY = 0;

  private moveCount = 0;
  private startTime: number | undefined;

  private player = new Movable();
  private boxes: Box[] = [];

  private playerIsMoving = false;
  private undoAction?: UndoAction;

  private pressedKeys: { [key: string]: boolean } = {};
  // private gamepads: (Gamepad | null)[] = [];

  private lastTime: number | undefined;

  constructor(private container: HTMLElement) {
    // http://labs.phaser.io/assets/tilemaps/tiles/kenney_redux_64x64.png
    this.wallImage.src = tiles1;
    this.wallImage.onload = this.drawStatic;

    container.appendChild(this.element);

    this.element.appendChild(this.staticCanvas);
    this.element.appendChild(this.playerCanvas);

    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);

    window.addEventListener("gamepadconnected", this.onGamePadConnect);
    window.addEventListener("gamepaddisconnected", this.onGamePadDisconnect);
    window.addEventListener("x-gamepad:change", this.onGamePadChange);

    this.ui.onRestart = this.restart;

    this.player.speed = moveSpeed;

    this.maze = this.levels[this.currentLevelIndex];
    this.applyMaze();

    window.requestAnimationFrame(this.onFrame);
  }

  private restart = () => {
    this.applyMaze();
  }

  private applyMaze() {
    
    const dpr = window.devicePixelRatio || 1;
    console.log("dpr", dpr);

    const sizeWidth = this.maze.layout[0].length * cellSize;
    const sizeHeight = this.maze.layout.length * cellSize;
    const canvasWidth = sizeWidth * dpr;
    const canvasHeight = sizeHeight * dpr;

    this.staticCanvas.width = canvasWidth;
    this.staticCanvas.height = canvasHeight;
    this.staticCanvas.style.position = "absolute";
    this.staticCanvas.style.width = sizeWidth + "px";
    this.staticCanvas.style.height = sizeHeight + "px";

    this.playerCanvas.width = canvasWidth;
    this.playerCanvas.height = canvasHeight;
    this.playerCanvas.style.position = "absolute";
    this.playerCanvas.style.width = sizeWidth + "px";
    this.playerCanvas.style.height = sizeHeight + "px";

    this.element.style.width = sizeWidth + "px";
    this.element.style.height = sizeHeight + "px";

    this.playerX = this.maze.startPoint.x;
    this.playerY = this.maze.startPoint.y;
    this.player.x = this.playerX * cellSize;
    this.player.y = this.playerY * cellSize;

    this.moveCount = 0;
    this.startTime = undefined;

    this.boxes = this.maze.boxes.map(cell => new Box(cell[0], cell[1]));
    
    this.redrawAll();
  }

  private onGamePadConnect = (e: any) => {
    console.log("onGamePadConnect", e);
    // const gamepad = e.gamepad as Gamepad;
    // this.gamepads[gamepad.index] = gamepad;
  };

  private onGamePadDisconnect = (e: any) => {
    console.log("onGamePadDisconnect", e);
    // const gamepad = e.gamepad as Gamepad;
    // this.gamepads[gamepad.index] = null;
  };

  private onGamePadChange = (e: any) => {
    console.log("onGamePadChange", e);
  };

  private onFrame = (time: number) => {
    window.requestAnimationFrame(this.onFrame);

    if (this.lastTime === undefined) {
      this.lastTime = time;
    }
    const seconds = time - this.lastTime;
    this.lastTime = time;
    const dt = seconds * 0.001;

    this.update(dt);

    this.ui.moveCount = this.moveCount;
    this.ui.time = this.startTime !== undefined ? Date.now() - this.startTime : 0;
  };

  private update(dt: number) {
    this.player.update(dt);
    this.boxes.forEach((b) => b.update(dt));

    this.drawDynamic();

    if (!this.playerIsMoving) {
      if (this.pressedKeys.KeyA || this.pressedKeys.ArrowLeft) {
        this.movePlayerTo(-1, 0);
      } else if (this.pressedKeys.KeyD || this.pressedKeys.ArrowRight) {
        this.movePlayerTo(1, 0);
      } else if (this.pressedKeys.KeyW || this.pressedKeys.ArrowUp) {
        this.movePlayerTo(0, -1);
      } else if (this.pressedKeys.KeyS || this.pressedKeys.ArrowDown) {
        this.movePlayerTo(0, 1);
      }

      const gs = navigator.getGamepads();

      for (let i = 0; i < gs.length; i++) {
        const g = gs[i];
        if (!g) return;
        // console.log(g.buttons.map((b, i) => `${i} pressed:${b.pressed}`));
        if (g.buttons[12].pressed) {
          this.movePlayerTo(0, -1);
        } else if (g.buttons[13].pressed) {
          this.movePlayerTo(0, 1);
        } else if (g.buttons[14].pressed) {
          this.movePlayerTo(-1, 0);
        } else if (g.buttons[15].pressed) {
          this.movePlayerTo(1, 0);
        }
      }
    }
  }

  private onKeyDown = (e: KeyboardEvent) => {
    // console.log("down", e);
    this.pressedKeys[e.code] = true;

    if (this.startTime === undefined) {
      this.startTime = Date.now();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.pressedKeys[e.code] = false;
    if (e.key === "\\") {
      this.switchToNextLevel();
    } else if (e.key === "Backspace") {
      this.undo();
    }
  };

  private undo() {
    if (this.playerIsMoving || !this.undoAction) return;
    const { x, y, box } = this.undoAction;
    console.log("undo", x, y, box);

    this.playerIsMoving = true;
    this.playerX = x;
    this.playerY = y;
    const px = this.playerX * cellSize;
    const py = this.playerY * cellSize;
    this.player.moveTo(px, py, this.onMoveEnd);

    if (box) {
      box.box.moveToCell(box.x, box.y);
    }
    this.undoAction = undefined;
  }

  private movePlayerTo(dx: number, dy: number) {
    if (!this.canMoveTo(dx, dy)) return;

    const newX = this.playerX + dx;
    const newY = this.playerY + dy;

    const undoAction: UndoAction = {
      x: this.playerX,
      y: this.playerY,
    };

    const box = this.getBoxAt(newX, newY);
    if (box) {
      undoAction.box = {
        box: box,
        x: newX,
        y: newY,
      }
      box.moveToCell(newX + dx, newY + dy);
      box.placed = this.hasPlaceHolderAt(newX + dx, newY + dy);
    }

    this.playerX = newX;
    this.playerY = newY;

    const x = this.playerX * cellSize;
    const y = this.playerY * cellSize;

    this.playerIsMoving = true;
    this.player.moveTo(x, y, this.onMoveEnd);

    this.undoAction = undoAction;
  }

  private canMoveTo(dx: number, dy: number) {
    const x = this.playerX + dx;
    const y = this.playerY + dy;
    // wall
    if (this.hasWallAt(x, y)) return false;
    if (this.getBoxAt(x, y)) {
      const nextX = x + dx;
      const nextY = y + dy;
      if (this.hasWallAt(nextX, nextY) || this.getBoxAt(nextX, nextY))
        return false;
    }
    return true;
  }

  private hasWallAt(x: number, y: number) {
    return this.maze.layout[y][x] === CellType.Wall;
  }
  private hasPlaceHolderAt(x: number, y: number) {
    return this.maze.layout[y][x] === CellType.BoxPlaceholder;
  }
  private getBoxAt(x: number, y: number) {
    for (const box of this.boxes) {
      if (box.cellX === x && box.cellY === y) return box;
    }
  }

  private onMoveEnd = () => {
    this.playerIsMoving = false;
    this.moveCount++;

    this.checkLevelComplete();
  };

  private redrawAll() {
    this.drawStatic();

    this.drawDynamic();
  }

  private drawStatic = () => {
    const ctx = this.staticCtx;
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.maze.layout.forEach((l, j) => {
      let y = j * cellSize;
      l.forEach((e, i) => {
        let x = i * cellSize;
        const [dx, dy] = getCellInfo(e);
        ctx.drawImage(
          this.wallImage,
          dx * spriteSize,
          dy * spriteSize,
          spriteSize,
          spriteSize,
          x,
          y,
          cellSize,
          cellSize
        );
      });
    });
  };

  private drawDynamic() {
    const ctx = this.playerCtx;
    if (!ctx) return;

    const { x, y } = this.player;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(
      this.wallImage,
      0 * spriteSize,
      4 * spriteSize,
      spriteSize,
      spriteSize,
      Math.floor(x),
      Math.floor(y),
      cellSize,
      cellSize
    );

    this.boxes.forEach((b) => {
      const [dx, dy] = getBoxInfo(b.placed);
      ctx.drawImage(
        this.wallImage,
        dx * spriteSize,
        dy * spriteSize,
        spriteSize,
        spriteSize,
        Math.floor(b.x),
        Math.floor(b.y),
        cellSize,
        cellSize
      );
    });
  }

  private checkLevelComplete() {
    for (const box of this.boxes) {
      if (!box.placed) return;
    }

    alert("level complete!");

    this.switchToNextLevel();
  }

  private switchToNextLevel = () => {
    this.currentLevelIndex++;
    if (this.currentLevelIndex >= this.levels.length) {
      alert("Game complete");
      return;
    }

    this.maze = this.levels[this.currentLevelIndex];
    this.applyMaze();
  }
}
