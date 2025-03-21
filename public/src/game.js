import { Base } from "./model/base.js";
import sleep from "./utils/sleep.js";
import { Monster } from "./model/monster.js";
import { Tower, GetTowerFromCoordinate } from "./model/tower.js";
import { Button, getButtons, setButton } from "./model/buttons.model.js";
import {
  canvasMouseEventinit,
  drawmousePoint,
} from "./event/canvasMouseEvent.js";
import { loadGameAssets } from "./init/assets.js";
import { getSocket, getRoom } from "./init/socket.js";
import Monsters from "./model/monsterSpawner.js";
import { loadMonsterImages, GetMonsterAnimation, } from "./model/monsterAnimations.model.js"
import { loadVfxImages, GetVfxAnimation, GetVfxAnimations } from "./model/vfxAnimations.model.js";
import { initTowerBase, towerDraw, setBaseImage } from "./model/towerBase.model.js";
import { setGameCanvas } from "./model/gameCanva.model.js";
import { getUserGold, getScore, getHighScore, setScore, setUserGold } from "./model/userInterface.model.js";
import { intiChat } from "./chat/chat.js";
import { getAttackMissile } from "./model/towerBase.model.js";

import { Vfx } from "./model/vfx.model.js";
/* 
  어딘가에 엑세스 토큰이 저장이 안되어 있다면 로그인을 유도하는 코드를 여기에 추가해주세요!
*/
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
export const monsterSpawner = Monsters.getInstance(getSocket(), getRoom())

const divgold = document.getElementById('divgold');
const divcurlevel = document.getElementById('divcurLevel');
const divendTimer = document.getElementById('divendTimer');

let previousTime = 0;
let currentTime = 0;
let deltaTime = 0;

// #region 위치동기화 받기
monsterSpawner.socket.on("locationSync", (data) => {
  // validation
  if (!data || !Array.isArray(data.data)) {
    console.error("[LocationSync/Error] Invalid data format.");
    return;
  }
  // 몬스터 데이터
  const monsters = data.data;
  //console.log("[LocationSync/Received] monsters: ", monsters);

  // 게임 로직으로 위치 동기화
  updateLocationSync(monsters);
});

var canvasRect = canvas.getBoundingClientRect();
var scaleX = canvas.width / canvasRect.width; // 가로 스케일
var scaleY = canvas.height / canvasRect.height; // 세로 스케일
setGameCanvas(
  canvasRect.left,
  canvasRect.top,
  canvas.width,
  canvas.height,
  scaleX,
  scaleY
);

window.addEventListener("resize", () => {
  canvasRect = canvas.getBoundingClientRect();
  scaleX = canvas.width / canvasRect.width; // 가로 스케일
  scaleY = canvas.height / canvasRect.height; // 세로 스케일
  setGameCanvas(
    canvasRect.left,
    canvasRect.top,
    canvas.width,
    canvas.height,
    scaleX,
    scaleY
  );
});

const NUM_OF_MONSTERS = 4; // 몬스터 개수

let monsterLevel = 0; // 몬스터 레벨

let monsters = [];
let vfx = [];
const towers = [];

let gameAssets = null;
let isInitGame = false;

let base;

// 이미지 로딩 파트
const backgroundImage = new Image();
backgroundImage.src = "../assets/images/bg.webp";

const towerImage = new Image();
towerImage.src = "../assets/images/tower.png";

const pathImage = new Image();
pathImage.src = "../assets/images/path.png";

let monsterPath;

function updateLocationSync(monsters) {
  monsters.forEach((monster) => {
    //console.log(`[LocationSync] 몬스터 UUID: ${monster.uuid} x: ${monster.x}, y: ${monster.y}`);

    // x, y 값이 null일 때 예외 처리
    if (monster.x === null || monster.y === null) {
      console.warn(`[LocationSync/Warning] Monster with UUID ${monster.uuid} has invalid position: x: ${monster.x}, y: ${monster.y}`);
      return;
    }

    // 위치 업데이트 로직
    const targetMonster = monsterSpawner.getMonsters().find(m => m.uuid === monster.uuid);
    if (targetMonster) {
      targetMonster.x = monster.x;
      targetMonster.y = monster.y;
      targetMonster.targetX = monster.targetX;
      targetMonster.targetY = monster.targetY;
      targetMonster.curIndex = monster.curIndex;

      //#region 몬스터 보는 방향 결정
      const dirX = monster.targetX - monster.x;
      targetMonster.setFlipped(dirX < 0);
      //#endregion

      //console.log(`[LocationSync] 업데이트:  ${targetMonster.x}, ${targetMonster.y}, , ${targetMonster.targetX}, , ${targetMonster.targetY}, , ${targetMonster.curIndex}`);
    } else {
      //console.log(`[LocationSync] 몬스터 UUID ${monster.uuid}을(를) 찾을 수 없습니다.`);
    }
  });
}

function initMap() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 그리기
  drawPath();
}

function drawPath() {
  const segmentLength = 20; // 몬스터 경로 세그먼트 길이
  const imageWidth = 60; // 몬스터 경로 이미지 너비
  const imageHeight = 60; // 몬스터 경로 이미지 높이
  const gap = 5; // 몬스터 경로 이미지 겹침 방지를 위한 간격

  const test = monsterPath.length;

  for (let i = 0; i < test - 1; i++) {
    const startX = monsterPath[i].x;
    const startY = monsterPath[i].y;
    const endX = monsterPath[i + 1].x;
    const endY = monsterPath[i + 1].y;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // 피타고라스 정리로 두 점 사이의 거리를 구함 (유클리드 거리)
    const angle = Math.atan2(deltaY, deltaX); // 두 점 사이의 각도는 tan-1(y/x)로 구해야 함 (자세한 것은 역삼각함수 참고): 삼각함수는 변의 비율! 역삼각함수는 각도를 구하는 것!

    for (let j = gap; j < distance - gap; j += segmentLength) {
      // 사실 이거는 삼각함수에 대한 기본적인 이해도가 있으면 충분히 이해하실 수 있습니다.
      // 자세한 것은 https://thirdspacelearning.com/gcse-maths/geometry-and-measure/sin-cos-tan-graphs/ 참고 부탁해요!
      const x = startX + Math.cos(angle) * j; // 다음 이미지 x좌표 계산(각도의 코사인 값은 x축 방향의 단위 벡터 * j를 곱하여 경로를 따라 이동한 x축 좌표를 구함)
      const y = startY + Math.sin(angle) * j; // 다음 이미지 y좌표 계산(각도의 사인 값은 y축 방향의 단위 벡터 * j를 곱하여 경로를 따라 이동한 y축 좌표를 구함)
      drawRotatedImage(pathImage, x, y, imageWidth, imageHeight, angle);
    }
  }
}

function drawRotatedImage(image, x, y, width, height, angle) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(angle);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

//사용 안함
function getRandomPositionNearPath(maxDistance) {
  // 타워 배치를 위한 몬스터가 지나가는 경로 상에서 maxDistance 범위 내에서 랜덤한 위치를 반환하는 함수!
  const segmentIndex = Math.floor(Math.random() * (monsterPath.length - 1));
  const startX = monsterPath[segmentIndex].x;
  const startY = monsterPath[segmentIndex].y;
  const endX = monsterPath[segmentIndex + 1].x;
  const endY = monsterPath[segmentIndex + 1].y;

  const t = Math.random();
  const posX = startX + t * (endX - startX);
  const posY = startY + t * (endY - startY);

  const offsetX = (Math.random() - 0.5) * 2 * maxDistance;
  const offsetY = (Math.random() - 0.5) * 2 * maxDistance;

  return {
    x: posX + offsetX,
    y: posY + offsetY,
  };
}
function placeInitButtons() {
  console.log(gameAssets.buttons);
  gameAssets.buttons.data.forEach((element) => {
    setButton(
      new Button(
        element.text,
        element.X,
        element.Y,
        element.width,
        element.height,
        element.marginX,
        element.marginY
      )
    );
  });
}

function placeBase() {
  const lastPoint = monsterPath[monsterPath.length - 1];
  base = new Base(lastPoint.x, lastPoint.y, 1);
  //base.draw(ctx, baseImage);
}

function gameLoop() {
  currentTime = Date.now();
  deltaTime = currentTime - previousTime;
  if (deltaTime > 10000) deltaTime = 0;
  previousTime = currentTime;

  monsters = monsterSpawner.getMonsters();
  // 렌더링 시에는 항상 배경 이미지부터 그려야 합니다! 그래야 다른 이미지들이 배경 이미지 위에 그려져요!
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 다시 그리기

  // monsterPath가 존재하고 유효한 경우에만 경로를 그리기
  if (Array.isArray(monsterPath) && monsterPath.length > 0) {
    drawPath(); // 경로 다시 그리기
  } else {
    console.warn("monsterPath가 유효하지 않습니다.");
  }

  ctx.font = "25px Times New Roman";


  divgold.innerText = getUserGold();
  divcurlevel.innerText = monsterLevel;
  divendTimer.innerText = monsterSpawner.getInfo().endTimer;

  towerDraw(ctx);

  if (Array.isArray(monsters) && monsters.length > 0) {
    for (let i = monsters.length - 1; i >= 0; i--) {
      const monster = monsters[i];
      if (monster.hp > 0) {
        monster.draw(ctx);
        // 이곳에 애니 메이션 추가하자.
        monster.updateAnimation();
      }
    }

    vfx = monsterSpawner.vfxs;
    for (let i = vfx.length - 1; i >= 0; i--) {
      const temp = vfx[i];
      temp.draw(ctx);

      if (vfx.isFinished === true) {
        vfx.splice(i, 1);
      }
    }
  }

  const attackMissile = getAttackMissile();

  for (let i = 0; i < attackMissile.length; i++) {
    const singleMissile = attackMissile[i].data;
    const attackingTower = singleMissile.tower;
    // uuid
    const attackingTarget = monsterSpawner.getMonsters().find((e) => e.uuid === singleMissile.target);

    ctx.beginPath();
    ctx.moveTo(attackingTower.towerX + 75/2, attackingTower.towerY + 150/2);
    ctx.lineTo(attackingTarget?.x, attackingTarget?.y);
    ctx.strokeStyle = "skyblue";
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.closePath();
    singleMissile.duration -= deltaTime;
    if (singleMissile.duration <= 0) attackMissile.splice(i, 1);
  }

  getButtons().forEach((button) => {
    button.draw(ctx);
  });
  //마우스를 따라가는 아이콘을 그리는 기능
  drawmousePoint(ctx);

  requestAnimationFrame(gameLoop); // 지속적으로 다음 프레임에 gameLoop 함수 호출할 수 있도록 함
}

async function initGame() {
  if (isInitGame) {
    //return;
  }

  gameAssets = await loadGameAssets();

  console.log(gameAssets);
  monsterSpawner.initialization();
  intiChat(getSocket());
  // 몬스터 경로 생성
  //서버 반응이 늦을경우 대기
  while (monsterPath === undefined) {
    await sleep(100);
    monsterPath = monsterSpawner.getPath();
  }

  console.log(monsterPath);
  // 맵 초기화 (배경, 몬스터 경로 그리기)
  initMap();
  // 기지 배치
  placeBase();

  
  // 버튼 배치
  placeInitButtons();
  setBaseImage();
  //타워 배치 설정
  initTowerBase();

  canvasMouseEventinit(canvas);

  // 설정된 몬스터 생성 주기마다 몬스터 생성
  // setInterval(spawnMonster, monsterSpawnInterval);
  // 게임 루프 최초 실행

  gameLoop();
  isInitGame = true;
}

// 테스트
loadMonsterImages();
loadVfxImages();

// 애니메이션
const ant = GetMonsterAnimation("ant");
const bat = GetMonsterAnimation("bat");
const bear = GetMonsterAnimation("bear");
const bettle = GetMonsterAnimation("bettle");
const bunny = GetMonsterAnimation("bunny");
const dino = GetMonsterAnimation("dino");
const dog = GetMonsterAnimation("dog");
const eagle = GetMonsterAnimation("eagle");
const gator = GetMonsterAnimation("gator");
const ghost = GetMonsterAnimation("ghost");

const vfx01 = GetVfxAnimation(0);
const vfx02 = GetVfxAnimation(1);
const vfx03 = GetVfxAnimation(2);

// 이미지 로딩 완료 후 서버와 연결하고 게임 초기화
Promise.all([
  new Promise((resolve) => (backgroundImage.onload = resolve)),
  new Promise((resolve) => (towerImage.onload = resolve)),
  new Promise((resolve) => (pathImage.onload = resolve)),
  ...ant.map(
    (img) => new Promise((resolve) => (img.onload = resolve))
  ),
  ...bat.map(
    (img) => new Promise((resolve) => (img.onload = resolve))
  ),
  ...bear.map(
    (img) => new Promise((resolve) => (img.onload = resolve))
  ),
  ...bettle.map(
    (img) => new Promise((resolve) => (img.onload = resolve))
  ),
  ...bunny.map(
    (img) => new Promise((resolve) => (img.onload = resolve))
  ),
  ...dino.map(
    (img) => new Promise((resolve) => (img.onload = resolve))
  ),
  ...dog.map(
    (img) => new Promise((resolve) => (img.onload = resolve))
  ),
  ...eagle.map(
    (img) => new Promise((resolve) => (img.onload = resolve))
  ),
  ...gator.map(
    (img) => new Promise((resolve) => (img.onload = resolve))
  ),
  ...ghost.map(
    (img) => new Promise((resolve) => (img.onload = resolve))
  ),
  ...vfx01.map(
    (img) => new Promise((resolve) => (img.onload = resolve))
  ),
  ...vfx02.map(
    (img) => new Promise((resolve) => (img.onload = resolve))
  ),
  ...vfx03.map(
    (img) => new Promise((resolve) => (img.onload = resolve))
  ),
]);

await initGame();

