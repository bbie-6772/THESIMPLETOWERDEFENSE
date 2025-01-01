import { getGameCanvas, getBaseImage } from "./gameCanva.model.js";
import { GetTowerCoordinateFromGrid } from "./tower.js";

let towerBase = [];
let towerBasePosition = [];
let attackMissile = [];

const width = 78; // 타워 이미지 가로 길이 (이미지 파일 길이에 따라 변경 필요하며 세로 길이와 비율을 맞춰주셔야 합니다!)

const towerBaseWidth = 180;
const towerBaseheight = 180;

let baseImage;

let previousTime = 0;
let currentTime = 0;
let deltaTime = 0;

export const setBaseImage = () => {
  baseImage = new Image();
  baseImage.src = "../assets/images/towerPlatform.png";
};

export const gettowerBaseheight = () => {
  return towerBaseheight;
};
export const gettowerBaseWidth = () => {
  return towerBaseWidth;
};

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
  towerBase[Y][X] = tower;
};
export const getTowerBase = (X, Y, tower) => {
  return towerBase[Y][X];
};

export const towerDraw = (ctx) => {
  currentTime = Date.now();
  deltaTime = currentTime - previousTime;
  if (deltaTime > 10000) deltaTime = 0;
  previousTime = currentTime;

  const gameCanvas = getGameCanvas();
  const scaleX = gameCanvas.Xscale; // 가로 스케일
  const scaleY = gameCanvas.Yscale; // 세로 스케일

  for (let i = 0; i < towerBase.length; i++) {
    towerBasePosition[i] = towerBasePosition[i] ?? [];
    for (let o = 0; o < towerBase[i].length; o++) {
      const { xPosition, yPosition } = GetTowerCoordinateFromGrid(o, i);

      //타워 발판 생성
      ctx.drawImage(
        baseImage,
        xPosition - towerBaseWidth / 2 + (width / 2) * scaleX,
        yPosition * scaleY,
        towerBaseWidth * scaleX,
        towerBaseheight * scaleY
      );

      towerBasePosition[i][o] = {
        xPosition: xPosition * scaleX,
        yPosition: yPosition * scaleY,
        towerBaseWidth: towerBaseWidth * scaleX,
        towerBaseheight: towerBaseheight * scaleY,
      };

      if (towerBase[i][o] != null) {
        const tmpTower = towerBase[i][o];
        //타워 그리기
        ctx.drawImage(
          tmpTower.image,
          xPosition * scaleX,
          yPosition * scaleY,
          tmpTower.width * scaleX,
          tmpTower.height * scaleY
        );
        ctx.fillText(`${tmpTower.tier}티어`, xPosition * scaleX, yPosition * scaleY);
      }
    }
  }
  // for (let i = 0; i < attackMissile.length; i++) {
  //   console.log(attackMissile);
  //   const singleMissile = attackMissile[i];
  //   console.log(singleMissile);
  //   const attackingTower = singleMissile.tower;
  //   const attackingTarget = singleMissile.target;
  //   ctx.beginPath();
  //   ctx.moveTo(attackingTower.towerX, attackingTower.towerY);
  //   ctx.lineTo(attackingTarget.targetX, attackingTarget.targetY);
  //   ctx.strokeStyle = "skyblue";
  //   ctx.lineWidth = 10;
  //   ctx.stroke();
  //   ctx.closePath();
  //   singleMissile.duration -= deltatime;
  //   if (singleMissile.duration <= 0) attackMissile.splice(i, 1);
  // }
};
export const baseColisionCheck = (x, y) => {
  for (let i = 0; i < towerBasePosition.length; i++) {
    for (let o = 0; o < towerBasePosition[i].length; o++) {
      const tmpTower = towerBasePosition[i][o];
      if (
        x > tmpTower.xPosition &&
        x < tmpTower.xPosition + tmpTower.towerBaseWidth &&
        y > tmpTower.yPosition &&
        y < tmpTower.yPosition + tmpTower.towerBaseheight
      )
        return { x: o, y: i };
    }
  }
};

export const settingAttack = (data) => {
  attackMissile.push({ data });

  // data
  // type: towertype,
  // tower:{towerX, towerY},
  // target:{targetX, targetY},
  // duration
};
