import { getGameCanvas } from "./gameCanva.model.js";

let towerBase = [];

const basePoint = { x: 100, y: 100 };
const incremWidth = (1920 * (8 / 10)) / 2;
const incremHeight = 1080 * (8 / 10);

//0,0 좌표의 타워 (basePoint에 + 해서 계산)
const tower0Position = [300, 300];
// 타워끼리의 거리
const towersGapX = 200;
const towersGapY = 200;
// 블럭과의 거리
const blockGap = 200;

const baseImage = new Image();
baseImage.src = "../assets/images/towerPlatform.png";
const towerBaseWidth = 180;
const towerBaseheight = 180;

export const initTowerBase = () => {
  towerBase = [];
  for (let i = 0; i < 4; i++) {
    let tmpX = [];
    for (let o = 0; o < 4; o++) {
      tmpX.push(null);
    }
    towerBase.push(tmpX);
  }
  console.log(towerBase);
};

export const setTowerBase = (X, Y, tower) => {
  towerBase[X][Y] = tower;
};
export const getTowerBase = (X, Y, tower) => {
  return towerBase[X][Y];
};

export const towerDraw = (ctx) => {
  const gameCanvas = getGameCanvas();
  const scaleX = gameCanvas.Xscale; // 가로 스케일
  const scaleY = gameCanvas.Yscale; // 세로 스케일

  for (let i = 0; i < towerBase.length; i++) {
    for (let o = 0; o < towerBase[i].length; o++) {
      const xPosition =
        (incremWidth / 2 +
          ((o % 2) * towersGapX - towersGapX / 2) +
          (o > 1 ? incremWidth : 0)) *
        scaleX;
      const yPosition =
        (tower0Position[1] +
          incremHeight / 2 +
          (i * towersGapY - towersGapY / 2 - towersGapY - towerBaseheight)) *
        scaleY;

      //타워 발판 생성
      ctx.drawImage(
        baseImage,
        xPosition,
        yPosition,
        towerBaseWidth,
        towerBaseheight
      );
      if (towerBase[i][o] != null) {
        const tmpTower = towerBase[i][o];
        //타워 그리기
        ctx.drawImage(
          tmpTower.image,
          xPosition,
          yPosition,
          tmpTower.width,
          tmpTower.height
        );
      }
    }
  }
};
