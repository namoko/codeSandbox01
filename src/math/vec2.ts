import { clamp01 } from "./utils";

export class Vec2 {
  public x: number;
  public y: number;

  public constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  public get squaredMagnitude() {
    return this.x * this.x + this.y * this.y;
  }

  public get length() {
    return Math.sqrt(this.squaredMagnitude);
  }

  public subtract(v: Vec2) {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  public multiply(n: number) {
    return new Vec2(this.x * n, this.y * n);
  }

  public clone() {
    return new Vec2(this.x, this.y);
  }

  public normalize() {
    const l = this.length;
    if (l > 0) {
      return this.multiply(1 / l);
    }
    return new Vec2();
  }

  public static Scale(v: Vec2, n: number) {
    return new Vec2(v.x * n, v.y * n);
  }

  public static Lerp(a: Vec2, b: Vec2, t: number) {
    t = clamp01(t);
    return Vec2.LerpUnclamped(a, b, t);
  }

  public static LerpUnclamped(a: Vec2, b: Vec2, t: number) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const x = a.x + dx * t;
    const y = a.y + dy * t;
    return new Vec2(x, y);
  }
}
