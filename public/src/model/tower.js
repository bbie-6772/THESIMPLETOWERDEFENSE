import Monsters from "./monsterSpawner.js";
import { getGameAssets } from "../init/assets.js";
import { setTowerBase } from "./towerBase.model.js";
import { setUserGold, getUserGold } from "./userInterface.model.js";
import { gettowerBaseWidth, gettowerBaseheight } from "./towerBase.model.js";
import { getGameCanvas } from "./gameCanva.model.js";
var towers = [];

const basePoint = { x: 100, y: 100 };
const incremWidth = (1920 * (8 / 10)) / 2;
const incremHeight = 1080 * (8 / 10);

//0,0 좌표의 타워 (basePoint에 + 해서 계산)
const tower0Position = [50, 230];
// 타워끼리의 거리
const towersGapX = 350;
const towersGapY = 200;
// 블럭과의 거리
const blockGap = 200;

const towerBaseWidth = 180;
const towerBaseheight = 180;

const width = 78; // 타워 이미지 가로 길이 (이미지 파일 길이에 따라 변경 필요하며 세로 길이와 비율을 맞춰주셔야 합니다!)
const height = 150; // 타워 이미지 세로 길이


export class Tower {
  constructor(uuid, x, y, image, tier) {
    // 생성자 안에서 타워들의 속성을 정의한다고 생각하시면 됩니다!
    this.uuid = uuid;
    this.x = x; // 타워 이미지 x 좌표
    this.y = y; // 타워 이미지 y 좌표
    this.width = width; // 타워 이미지 가로 길이 (이미지 파일 길이에 따라 변경 필요하며 세로 길이와 비율을 맞춰주셔야 합니다!)
    this.height = height; // 타워 이미지 세로 길이
    this.image = image;
    this.tier = tier;
    this.beamDuration = 0; // 타워 광선 지속 시간
    this.target = null; // 타워 광선의 목표
  }

  // draw(ctx) {
  //   ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  //   if (this.beamDuration > 0 && this.target) {
  //     ctx.beginPath();
  //     ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
  //     ctx.lineTo(
  //       this.target.x + this.target.width / 2,
  //       this.target.y + this.target.height / 2
  //     );
  //     ctx.strokeStyle = "skyblue";
  //     ctx.lineWidth = 10;
  //     ctx.stroke();
  //     ctx.closePath();
  //     this.beamDuration--;
  //   }
  // }

  attack(monster) {
    // 타워가 타워 사정거리 내에 있는 몬스터를 공격하는 메소드이며 사정거리에 닿는지 여부는 game.js에서 확인합니다.
    if (this.cooldown <= 0) {
      monster.hp -= this.attackPower;
      this.cooldown = 180; // 3초 쿨타임 (초당 60프레임)
      this.beamDuration = 30; // 광선 지속 시간 (0.5초)
      this.target = monster; // 광선의 목표 설정

      Monsters.getInstance().sendMonsterDamageMessage(
        monster.uuid,
        this.attackPower
      );
    }
  }

  updateCooldown() {
    if (this.cooldown > 0) {
      this.cooldown--;
    }
  }
}

export const GetTowerFromCoordinate = (x, y) => {

  const gameCanvas = getGameCanvas();
  const scaleX = gameCanvas.Xscale; // 가로 스케일
  const scaleY = gameCanvas.Yscale; // 세로 스케일

  console.log(x, y);
  return towers.find((e) => {
    const { xPosition, yPosition } = GetTowerCoordinateFromGrid(e.x, e.y);
    console.log(e.x, e.y, xPosition, yPosition);
    return (
      xPosition * scaleX < x &&
      xPosition * scaleX > x - e.width &&
      yPosition * scaleY < y &&
      yPosition * scaleY > y - e.height
    );
  });
};

export const GetTowerCoordinateFromGrid = (x, y) => {
  return {
    xPosition:
      tower0Position[0] +
      incremWidth / 2 +
      ((x % 2) * towersGapX - towersGapX / 2) +
      (x > 1 ? incremWidth : 0) + towerBaseWidth / 2 - width / 2,
    yPosition:
      tower0Position[1] +
      incremHeight / 2 +
      (y * towersGapY - towersGapY / 2 - towersGapY - towerBaseheight),
  };
};
//return { status: 'success',towerid: towers.data[getRandomTower].id, x: X, y: Y, gold };
export const setNewTower = (data) => {
  const { userId, towerid, x, y, gold, tier } = data;
  //const {towers} = getGameAssets();
  console.log(towerid);
  const tmpTower = getGameAssets().towers.data.find((element) => {
    return element.id === towerid;
  });
  console.log(tmpTower);

  const tmpTowerImage = new Image();
  tmpTowerImage.src = tmpTower.image;

  const newtower = new Tower(
    userId,
    x,
    y,
    tmpTowerImage,
    tier,
  );
  towers.push(newtower);
  setTowerBase(x, y, newtower);
  setUserGold(gold);
};

export const removeTower = (x, y) => {
  var targetIdx = towers.findIndex((e) => {
    return e.x === x && e.y === y;
  });
  towers.splice(targetIdx, 1);
  console.log(towers);
  setTowerBase(x, y, null);
}

// 타워 판매 기능 추가
export const sellTower = (x, y) => {
  const targetTower = GetTowerFromCoordinate(x, y);
  if (!targetTower) {
    console.log("해당 위치에 타워가 없습니다.");
    return { success: false, message: "해당 위치에 타워가 없습니다." };
  }

  const gameAssetsTowers = getGameAssets().towers;
  const currentTower = gameAssetsTowers.data.find((element) => {
    return element.id === targetTower.uuid; // 타워의 uuid로 찾기
  });

  // 판매 시 보상 계산 (70%)
  const sellPrice = Math.floor(currentTower.cost * 0.7);

  // 타워 제거
  removeTower(targetTower.x, targetTower.y);

  // 유저에게 보상 추가
  const userGold = getUserGold();
  const newGold = userGold + sellPrice;
  setUserGold(newGold); // 골드 업데이트

  console.log("타워가 판매되었습니다.", sellPrice);
  return { success: true, message: "타워가 판매되었습니다.", sellPrice };
};

// // 타워 클릭 이벤트 추가 (예: 클릭 이벤트에서 판매 기능 호출)
// canvas.addEventListener('click', (event) => {
//   const rect = canvas.getBoundingClientRect();
//   const x = event.clientX - rect.left;
//   const y = event.clientY - rect.top;

//   // 타워 판매 호출
//   sellTower(x, y);
// });