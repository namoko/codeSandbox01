import { Movable } from "../Movable";
import { cellSize } from "./consts";

export class Box extends Movable {
  constructor(public cellX: number, public cellY: number) {
    super();

    this.x = cellX * cellSize;
    this.y = cellY * cellSize;

    this.speed = 50;
  }

  public moveToCell(x: number, y: number) {
    // console.log("moveToCell", x, y);
    this.cellX = x;
    this.cellY = y;

    this.moveTo(x * cellSize, y * cellSize);
  }
}
