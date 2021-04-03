import { Movable } from "../Movable";
import { Maze } from "./Maze";

const updateFrequnce = 17;
const cellSize = 30;

export class Game {
  private maze = new Maze();
  private staticCanvas = document.createElement("canvas");
  private staticCtx = this.staticCanvas.getContext("2d");

  private playerCanvas = document.createElement("canvas");
  private playerCtx = this.playerCanvas.getContext("2d");

  private playerX = this.maze.startPoint.x;
  private playerY = this.maze.startPoint.y;

  private player = new Movable();

  private playerIsMoving = false;

  private pressedKeys: { [key: string]: boolean } = {};
  // private gamepads: (Gamepad | null)[] = [];

  private lastTime: number | undefined;

  constructor(container: HTMLElement) {
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

    container.appendChild(this.staticCanvas);
    container.appendChild(this.playerCanvas);

    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);

    window.addEventListener("gamepadconnected", this.onGamePadConnect);
    window.addEventListener("gamepaddisconnected", this.onGamePadDisconnect);
    window.addEventListener("x-gamepad:change", this.onGamePadChange);
    // const gpds = navigator.getGamepads();
    // console.log("gpds", gpds);

    this.redrawAll();

    // window.setInterval(this.onTimer, updateFrequnce);
    // window.setInterval(this.scanGamePads, 500);
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

  // private scanGamePads = () => {
  //   const gs = navigator.getGamepads();
  //   for (let i = 0; i < 4; i++) {
  //     const g = gs[i] as Gamepad;
  //     if (g) this.gamepads[g.index] = g;
  //   }
  // };

  // private onTimer = () => {
  //   const dt = updateFrequnce * 0.001;
  //   this.update(dt);
  // };
  private update(dt: number) {
    this.player.update(dt);

    if (this.playerCtx) {
      this.drawPlayer(this.playerCtx);
    }

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

    if (!this.canMoveTo(newX, newY)) return;

    this.playerX = newX;
    this.playerY = newY;

    const x = this.playerX * cellSize;
    const y = this.playerY * cellSize;

    this.playerIsMoving = true;
    this.player.moveTo(x, y, this.onMoveEnd);
  }

  private canMoveTo(x: number, y: number) {
    return this.maze.layout[y][x] === 0;
  }

  private onMoveEnd = () => {
    this.playerIsMoving = false;
  };

  private redrawAll() {
    if (this.staticCtx) {
      this.drawLevel(this.staticCtx);
    }

    if (this.playerCtx) {
      this.drawPlayer(this.playerCtx);
    }
  }

  private drawLevel(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.maze.layout.forEach((l, j) => {
      let y = j * cellSize;
      l.forEach((e, i) => {
        let x = i * cellSize;
        ctx.fillStyle = e === 1 ? "#aaa" : "#eee";
        ctx.fillRect(x, y, cellSize, cellSize);
      });
    });
  }

  private drawPlayer(ctx: CanvasRenderingContext2D) {
    const { x, y } = this.player;
    // console.log("drawPlayer", x, y);
    const halfCell = cellSize / 2;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x + halfCell, y + halfCell, halfCell, 0, Math.PI * 2);
    ctx.fill();
  }
}
