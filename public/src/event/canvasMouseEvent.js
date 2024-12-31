import { GetTowerFromCoordinate ,GetTowerCoordinateFromGrid } from "../model/tower.js";
import { getButtons } from "../model/buttons.model.js";
import { getGameCanvas } from "../model/gameCanva.model.js";
import { baseColisionCheck } from "../model/towerBase.model.js";
import { sendEvent } from "../init/socket.js";
//마우스 이벤트 초기 설정
export const canvasMouseEventinit = (canvas) => {
  canvas.addEventListener("click", handleClick);
  canvas.addEventListener("mousedown", handleMousedown);
  canvas.addEventListener("mouseup", handleMouseup);
  canvas.addEventListener("mouseover", handleMouseover);
  canvas.addEventListener("mousemove", handleMousemove);
};

//마우스 위치와 아이콘 정보
let holdingicon = {};
let isHolding = false;
let mousePosition = [0, 0];

//캔버스 정보
const Canvas = document.getElementById("gameCanvas");
const ctx = Canvas.getContext("2d");
const canvasRect = Canvas.getBoundingClientRect();

// 타워 선택 정보
var currentTower = null;

//클릭 함수(디버그 캔버스에 그림 그리는중)
function handleClick(event) {
  const debugCanvas = document.getElementById("debugCanvas");
  const dctx = debugCanvas.getContext("2d");
  const dcanvasRect = debugCanvas.getBoundingClientRect();
  const scaleX = debugCanvas.width / dcanvasRect.width; // 가로 스케일
  const scaleY = debugCanvas.height / dcanvasRect.height; // 세로 스케일

  var x = (event.clientX - dcanvasRect.left) * scaleX;
  var y = (event.clientY - dcanvasRect.top) * scaleY;
  var t = GetTowerFromCoordinate(x, y);
  if (t) {
    const { xPosition, yPosition } = GetTowerCoordinateFromGrid(t.x, t.y);
    dctx.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
    dctx.fillStyle = "green";
    dctx.lineWidth = 3; // 테두리 두께
    dctx.strokeRect(xPosition * scaleX, yPosition * scaleY, t.width, t.height);
  }
}
//마우스 버튼을 누른 경우
function handleMousedown(event) {
  const buttons = getButtons();
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].mouseOver == true) {
      const holdingImage = new Image();

      if (buttons[i].text === "랜덤타워") {
        holdingImage.src = "../assets/images/questionMark.png";
        isHolding = true;
      } else if (buttons[i].text === "타워판매") {
        holdingImage.src = "../assets/images/moneyMark.png";
        isHolding = true;
      }
      if (isHolding) {
        Canvas.classList.add("hide-cursor");
        holdingicon = { button: buttons[i], image: holdingImage };
        break;
      }
    }
  }

  const scaleX = Canvas.width / canvasRect.width; // 가로 스케일
  const scaleY = Canvas.height / canvasRect.height; // 세로 스케일

  var x = (event.clientX - canvasRect.left) * scaleX;
  var y = (event.clientY - canvasRect.top) * scaleY;
  currentTower = GetTowerFromCoordinate(x, y);
  if (currentTower) {
    isHolding = true;
  }
}
//마우스 버튼을 땐 경우
function handleMouseup(event) {
  if ("button" in holdingicon) {
    if (holdingicon.button.text === "랜덤타워") {
      const towerPosition = baseColisionCheck(
        mousePosition[0],
        mousePosition[1]
      );
      if (towerPosition) {
      console.log( towerPosition.x,  towerPosition.y);
        console.log(towerPosition);
        sendEvent(4001, { X: towerPosition.x, Y: towerPosition.y });
      }
    } else if (holdingicon.button.text === "타워판매") {
    }
  }
  Canvas.classList.remove("hide-cursor");

  // 타워가 선택된 경우, 마우스를 뗀 곳에서 합성
  if (isHolding && currentTower) {
    const scaleX = Canvas.width / canvasRect.width; // 가로 스케일
    const scaleY = Canvas.height / canvasRect.height; // 세로 스케일

    var x = (event.clientX - canvasRect.left) * scaleX;
    var y = (event.clientY - canvasRect.top) * scaleY;
    var targetTower = GetTowerFromCoordinate(x, y);

    // { oneID, otherID }
    sendEvent(3001, { oneID: currentTower.oid, otherID: targetTower.oid });
  }
  isHolding = false;
  holdingicon = {};
}
//캔버스에 진입한 경우
function handleMouseover(event) {}
//캔버스상에서 마우스를 움직인 경우우
function handleMousemove(event) {
  const gameCanvas = getGameCanvas();
  const scaleX = gameCanvas.Xscale; // 가로 스케일
  const scaleY = gameCanvas.Yscale; // 세로 스케일

  mousePosition[0] = (event.clientX - gameCanvas.left) * scaleX;
  mousePosition[1] = (event.clientY - gameCanvas.top) * scaleY;
  const buttons = getButtons();
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].checkMouseOver(mousePosition[0], mousePosition[1]);
  }
}
//게임 루프에서 마우스포인터 위치에 아이콘 붙이는 함수
export const drawmousePoint = (ctx) => {
  if (isHolding && "image" in holdingicon) {
    ctx.drawImage(
      holdingicon.image,
      mousePosition[0] - 25,
      mousePosition[1] - 25,
      50,
      50
    );
  }
};
