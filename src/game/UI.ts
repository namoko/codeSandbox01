export class UI {
  public onRestart: undefined | (() => void);

  private element = document.createElement("div");

  private btn = document.createElement("button");
  private timeCtr = document.createElement("span");
  private moveCtr = document.createElement("span");

  constructor(container: HTMLElement) {
    container.appendChild(this.element);

    this.element.appendChild(this.btn);
    this.element.appendChild(this.timeCtr);
    this.element.appendChild(this.moveCtr);

    document.addEventListener("keyup", this.onKeyUp);

    this.btn.innerHTML = "Restart";
    this.btn.addEventListener("click", this.restart);

    this.time = 0;
    this.moveCount = 0;
  }

  public set time(value: number) {
    let s = Math.floor(value * 0.001);
    const h = Math.floor(s / 3600);
    s -= h * 3600;
    const m = Math.floor(s / 60);
    s -= m * 60;

    const hh = (h < 10 ? "0" : "") + h;
    const mm = (m < 10 ? "0" : "") + m;
    const ss = (s < 10 ? "0" : "") + s;

    const str = `${hh}:${mm}:${ss}`;
    this.timeCtr.innerHTML = " Time spent: " + str;
  }

  public set moveCount(value: number) {
    this.moveCtr.innerHTML = " Move count: " + value;
  }

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.keyCode === 27) {
      this.restart();
    }
  };

  private restart = () => {
    console.log("restart()");
    if (this.onRestart) this.onRestart();
  };
}
