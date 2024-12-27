let buttons = [];

const buttonImage = new Image();
buttonImage.src = "../assets/images/button.png";

export class Button {
  constructor(text, x, y, width, height, marginX, marginY) {
    this.x = x; // 버튼 이미지 x 좌표
    this.y = y; // 버튼 이미지 y 좌표
    this.width = width; // 버튼 이미지 가로 길이
    this.height = height; // 버튼 이미지 세로 길이
    this.marginX = marginX;
    this.marginY = marginY;
    this.mouseOver = false; //버튼 오버랩
    this.text = text;
  }

  draw(ctx) {
    if (!this.mouseOver) ctx.globalAlpha = 0.7;
    ctx.drawImage(buttonImage, this.x, this.y, this.width, this.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText(this.text, this.x + this.marginX, this.y + this.marginY);
  }
  //마우스가 버튼 위에 있는지 확인
  checkMouseOver(x, y) {
    if (
      x > this.x &&
      x < this.x + this.width &&
      y > this.y &&
      y < this.y + this.height
    )
      return (this.mouseOver = true);
    else return (this.mouseOver = false);
  }
}

export const setButton = (Button) => {
  buttons.push(Button);
};

export const getButtons = () => {
  return buttons;
};
