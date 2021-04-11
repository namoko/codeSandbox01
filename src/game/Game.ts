import { Movable } from "../Movable";
import { Maze } from "./Maze";
import { Box } from "./Box";
import { cellSize } from "./consts";

export class Game {
  private wallImage = new Image();

  private maze = new Maze();
  private staticCanvas = document.createElement("canvas");
  private staticCtx = this.staticCanvas.getContext("2d");

  private playerCanvas = document.createElement("canvas");
  private playerCtx = this.playerCanvas.getContext("2d");

  private playerX = this.maze.startPoint.x;
  private playerY = this.maze.startPoint.y;

  private player = new Movable();
  private boxes: Box[] = [];

  private playerIsMoving = false;

  private pressedKeys: { [key: string]: boolean } = {};
  // private gamepads: (Gamepad | null)[] = [];

  private lastTime: number | undefined;

  constructor(container: HTMLElement) {
    this.wallImage.src =
      "http://labs.phaser.io/assets/tilemaps/tiles/kenney_redux_64x64.png";
    this.wallImage.onload = this.drawStatic;

    const canvasWidth = this.maze.layout[0].length * cellSize;
    const canvasHeight = this.maze.layout.length * cellSize;

    this.staticCanvas.width = canvasWidth;
    this.staticCanvas.height = canvasHeight;
    this.staticCanvas.style.position = "absolute";

    this.playerCanvas.width = canvasWidth;
    this.playerCanvas.height = canvasHeight;
    this.playerCanvas.style.position = "absolute";

    this.player.speed = 50;
    this.player.x = this.playerX * cellSize;
    this.player.y = this.playerY * cellSize;

    this.maze.boxes.forEach((cell) => {
      const box = new Box(cell[0], cell[1]);
      this.boxes.push(box);
    });

    container.appendChild(this.staticCanvas);
    container.appendChild(this.playerCanvas);

    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);

    window.addEventListener("gamepadconnected", this.onGamePadConnect);
    window.addEventListener("gamepaddisconnected", this.onGamePadDisconnect);
    window.addEventListener("x-gamepad:change", this.onGamePadChange);

    this.redrawAll();

    window.requestAnimationFrame(this.onFrame);
  }

  private onGamePadConnect = (e: any) => {
    console.log("onGamePadConnect", e);
    const gamepad = e.gamepad as Gamepad;
    // this.gamepads[gamepad.index] = gamepad;
  };

  private onGamePadDisconnect = (e: any) => {
    console.log("onGamePadDisconnect", e);
    const gamepad = e.gamepad as Gamepad;
    // this.gamepads[gamepad.index] = null;
  };

  private onGamePadChange = (e: any) => {
    console.log("change", e);
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
  };

  private update(dt: number) {
    this.player.update(dt);
    this.boxes.forEach((b) => b.update(dt));

    this.drawDynamic();

    if (!this.playerIsMoving) {
      if (this.pressedKeys.KeyA) {
        this.movePlayerTo(-1, 0);
      } else if (this.pressedKeys.KeyD) {
        this.movePlayerTo(1, 0);
      } else if (this.pressedKeys.KeyW) {
        this.movePlayerTo(0, -1);
      } else if (this.pressedKeys.KeyS) {
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
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.pressedKeys[e.code] = false;
  };

  private movePlayerTo(dx: number, dy: number) {
    const newX = this.playerX + dx;
    const newY = this.playerY + dy;

    if (!this.canMoveTo(dx, dy)) return;
    const box = this.getBoxAt(newX, newY);
    if (box) {
      box.moveToCell(newX + dx, newY + dy);
    }

    this.playerX = newX;
    this.playerY = newY;

    const x = this.playerX * cellSize;
    const y = this.playerY * cellSize;

    this.playerIsMoving = true;
    this.player.moveTo(x, y, this.onMoveEnd);
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
    return this.maze.layout[y][x] === 1;
  }
  private getBoxAt(x: number, y: number) {
    for (const box of this.boxes) {
      if (box.cellX === x && box.cellY === y) return box;
    }
  }

  private onMoveEnd = () => {
    this.playerIsMoving = false;
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
        if (e === 1) {
          ctx.drawImage(
            this.wallImage,
            11 * 64,
            1 * 64,
            64,
            64,
            x,
            y,
            cellSize,
            cellSize
          );
        }
      });
    });
  };

  private drawDynamic() {
    const ctx = this.playerCtx;
    if (!ctx) return;

    const { x, y } = this.player;
    const halfCell = cellSize / 2;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x + halfCell, y + halfCell, halfCell, 0, Math.PI * 2);
    ctx.fill();

    this.boxes.forEach((b) => {
      ctx.drawImage(
        this.wallImage,
        7 * 64,
        3 * 64,
        64,
        64,
        b.x,
        b.y,
        cellSize,
        cellSize
      );
    });
  }
}
