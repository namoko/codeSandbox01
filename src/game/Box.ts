import { Movable } from "../Movable";
import { cellSize, moveSpeed } from "./consts";

export class Box extends Movable {
  constructor(
    public cellX: number,
    public cellY: number,
    public placed = false
  ) {
    super();

    this.x = cellX * cellSize;
    this.y = cellY * cellSize;

    this.speed = moveSpeed;
  }

  public moveToCell(x: number, y: number) {
    // console.log("moveToCell", x, y);
    this.cellX = x;
    this.cellY = y;

    this.moveTo(x * cellSize, y * cellSize);
  }
}
