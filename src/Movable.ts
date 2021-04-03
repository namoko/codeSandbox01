import { Vec2 } from "./math/vec2";

type CompleteHandler = (target: Movable) => void;

export class Movable {
  public position = new Vec2();
  public speed = 1;

  protected pos1 = new Vec2();
  protected pos2 = new Vec2();

  protected moving = false;

  private moveTimeTotal = 0;
  private moveTime = 0;

  private onMoveEnd?: CompleteHandler;

  public get x() {
    return this.position.x;
  }
  public set x(value: number) {
    this.position.x = value;
  }

  public get y() {
    return this.position.y;
  }
  public set y(value: number) {
    this.position.y = value;
  }

  public update(dt: number) {
    if (!this.moving) return;
    this.moveTime += dt;
    const t = this.moveTime / this.moveTimeTotal;
    this.position = Vec2.Lerp(this.pos1, this.pos2, t);
    if (t >= 1) {
      this.moving = false;
      if (this.onMoveEnd) {
        this.onMoveEnd(this);
      }
    }
  }

  public moveTo(x: number, y: number, onMoveEnd?: CompleteHandler) {
    this.pos1 = this.position.clone();
    this.pos2 = new Vec2(x, y);
    const delta = this.pos2.subtract(this.pos1);
    const distance = delta.length;
    this.moveTimeTotal = distance / this.speed;
    this.moveTime = 0;

    this.onMoveEnd = onMoveEnd;
    this.moving = true;
  }
}
