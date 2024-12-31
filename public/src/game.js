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
import {loadMonsterImages, GetMonsterAnimation, } from "./model/monsterAnimations.model.js"
import { loadVfxImages, GetVfxAnimation, GetVfxAnimations} from "./model/vfxAnimations.model.js";
import { initTowerBase, towerDraw, setBaseImage } from "./model/towerBase.model.js";
import { setGameCanvas } from "./model/gameCanva.model.js";
import { getUserGold, getScore, getHighScore, setScore, setUserGold } from "./model/userInterface.model.js";


import { Vfx } from "./model/vfx.model.js";
/* 
  어딘가에 엑세스 토큰이 저장이 안되어 있다면 로그인을 유도하는 코드를 여기에 추가해주세요!
*/
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const monsterSpawner = Monsters.getInstance(getSocket(), getRoom())

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

function generateRandomMonsterPath() {
  const path = [];
  let currentX = 0;
  let currentY = Math.floor(Math.random() * 21) + 500; // 500 ~ 520 범위의 y 시작 (캔버스 y축 중간쯤에서 시작할 수 있도록 유도)

  path.push({ x: currentX, y: currentY });

  const stepX = canvas.width / 8; // 8개의 패스를 만들기 위해 X축을 8등분

  for (let i = 1; i <= 8; i++) {
    currentX = i * stepX; // 각 패스의 X 좌표를 균등하게 증가시킴
    currentY += Math.floor(Math.random() * 200) - 100; // -100 ~ 100 범위의 y 변경

    // y 좌표에 대한 clamp 처리
    if (currentY < 0) {
      currentY = 0;
    }
    if (currentY > canvas.height) {
      currentY = canvas.height;
    }

    path.push({ x: currentX, y: currentY });
  }

  return path;
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

  //console.log(monsterPath);
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

// function placeInitialTowers() {
//   /*
//     타워를 초기에 배치하는 함수입니다.
//     무언가 빠진 코드가 있는 것 같지 않나요?
//   */
//   for (let i = 0; i < numOfInitialTowers; i++) {
//     const { x, y } = getRandomPositionNearPath(200);
//     const tower = new Tower(x, y, towerCost);
//     towers.push(tower);
//     tower.draw(ctx, towerImage);
//   }
// }

// function placeNewTower() {
//   /*
//     타워를 구입할 수 있는 자원이 있을 때 타워 구입 후 랜덤 배치하면 됩니다.
//     빠진 코드들을 채워넣어주세요!
//   */
//   const { x, y } = getRandomPositionNearPath(200);
//   const tower = new Tower(x, y);
//   towers.push(tower);
//   //tower.draw(ctx, towerImage);
// }

function placeBase() {
  const lastPoint = monsterPath[monsterPath.length - 1];
  base = new Base(lastPoint.x, lastPoint.y, 1);
  //base.draw(ctx, baseImage);
}

function gameLoop() {
  monsters = monsterSpawner.getMonsters();
  // 렌더링 시에는 항상 배경 이미지부터 그려야 합니다! 그래야 다른 이미지들이 배경 이미지 위에 그려져요!
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 다시 그리기

  // monsterPath가 존재하고 유효한 경우에만 경로를 그리기
  if (Array.isArray(monsterPath) && monsterPath.length > 0) {
    drawPath(); // 경로 다시 그리기
  } else {
    console.warn("monsterPath가 유효하지 않습니다.");
  }

  // 점수 바꾸기
  if (Object.keys(monsterSpawner.getInfo()).length !== 0){
    setScore(monsterSpawner.getInfo().score);
    setUserGold(monsterSpawner.getInfo().gold);
    monsterLevel = monsterSpawner.getInfo().wave;
  }

  ctx.font = "25px Times New Roman";
  ctx.fillStyle = "skyblue";
  ctx.fillText(`최고 기록: ${getHighScore()}`, 100, 50); // 최고 기록 표시
  ctx.fillStyle = "white";
  ctx.fillText(`점수: ${getScore()}`, 100, 100); // 현재 스코어 표시
  ctx.fillStyle = "yellow";
  ctx.fillText(`골드: ${getUserGold()}`, 100, 150); // 골드 표시
  ctx.fillStyle = "black";
  ctx.fillText(`현재 레벨: ${monsterLevel}`, 100, 200); // 최고 기록 표시

  getButtons().forEach((button) => {
    button.draw(ctx);
  });
  towerDraw(ctx);
  // 타워 그리기 및 몬스터 공격 처리

  // 몬스터가 공격을 했을 수 있으므로 기지 다시 그리기
  // base.draw(ctx, baseImage);
  //마우스를 따라가는 아이콘을 그리는 기능
  drawmousePoint(ctx);

  // 리스폰되기전에 돌던문제.
  // 배열, 길이가 0 이상일때만 반복문 도는것을 허용.
  if (Array.isArray(monsters) && monsters.length > 0) {
    for (let i = monsters.length - 1; i >= 0; i--) {
      const monster = monsters[i];
      if (monster.hp > 0) {
        const isDestroyed = monster.move(base);
        // if (isDestroyed) {
        //   /* 게임 오버 */
        //   alert("게임 오버. 스파르타 본부를 지키지 못했다...ㅠㅠ");
        //   location.reload();
        // }

        monster.draw(ctx);
        // 이곳에 애니 메이션 추가하자.
        monster.updateAnimation();

        // 이팩트 그리기
        for(let value of vfx) {
          value.draw(ctx);
        }

        // 이펙트 삭제 
        if(vfx.length !== 0){
          const index = vfx.findIndex(vfx => vfx.isFinished === true);
      
          if (index !== -1) {
            // 해당 인덱스를 찾아서 배열에서 삭제
            vfx.splice(index, 1);
          }
        }
  
      } else {
        // 이펙트 추가
        const vfxCount = Object.keys(GetVfxAnimations()).length;
        const randomVfx = Math.floor(Math.random() * (vfxCount));
        vfx.push(new Vfx(GetVfxAnimation(randomVfx), monster.x, monster.y))
        
        monsterSpawner.sendMonsterDamageMessage(monster.uuid, 10000);
        /* 몬스터가 죽었을 때 */
        monsters.splice(i, 1);
      }
    }
  }

  requestAnimationFrame(gameLoop); // 지속적으로 다음 프레임에 gameLoop 함수 호출할 수 있도록 함
}

async function initGame() {
  if (isInitGame) {
    //return;
  }

  gameAssets = await loadGameAssets();

  console.log(gameAssets);
  monsterSpawner.initialization();
  // 몬스터 경로 생성
  //서버 반응이 늦을경우 대기
  while(monsterPath === undefined){
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

//requestAnimationFrame(gameLoop);
