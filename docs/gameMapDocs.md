# gameMapDocs.md
인게임 맵에 대한 문서

<br>

---

<br>

## skeleton code 분석
```js
// client: game.js :: 몬스터 진행경로 랜덤 생성
function generateRandomMonsterPath() {
  const path = [];
  let currentX = 0;
  let currentY = Math.floor(Math.random() * 21) + 500; // 500 ~ 520 범위의 y 시작
  path.push({ x: currentX, y: currentY });
  // 캔버스 위치로 snapping
  while (currentX < canvas.width) {
    currentX += Math.floor(Math.random() * 100) + 50; // 50 ~ 150 범위의 x 증가
    if (currentX > canvas.width)       currentX = canvas.width;
    
    currentY += Math.floor(Math.random() * 200) - 100; // -100 ~ 100 범위의 y 변경
    if (currentY < 0)      currentY = 0;
    if (currentY > canvas.height)      currentY = canvas.height;
    
    path.push({ x: currentX, y: currentY });
  }
  return path;
}
/* 중략 */
  monsterPath = generateRandomMonsterPath(); // 몬스터 경로 생성
/* 중략 */

// analysis: 캔버스 내 스내핑된 두 랜덤 좌표를 path에 저장하여 반환
```
```js
// client: game.js :: 맵 초기화와 경로 그리기
function initMap() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 그리기
  drawPath();
}

function drawPath() {
  const segmentLength = 20;
  const imageWidth = 60;
  const imageHeight = 60;
  const gap = 5;

  for (let i = 0; i < monsterPath.length - 1; i++) {
    const startX = monsterPath[i].x;
    const startY = monsterPath[i].y;
    const endX = monsterPath[i + 1].x;
    const endY = monsterPath[i + 1].y;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    for (let j = gap; j < distance - gap; j += segmentLength) {
      const x = startX + Math.cos(angle) * j;
      const y = startY + Math.sin(angle) * j;
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
// analysis: 앞선 generateRandomMonsterPath로 만들어진 path 기반으로 캔버스 그리기
// 이 때, monsterPath에 저장된 순서로 그려짐.
```

```js
// client: game.js :: 몬스터 경로 근처 무작위 위치 반환
function getRandomPositionNearPath(maxDistance) {
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
// analysis: 앞선 generateRandomMonsterPath로 만들어진 path 근처 무작위 위치 (타워 배치 위해서)
```

<br>

> #### 계획
> 현재 게임모드는 싱글모드와 2인 co-op 모드
> 싱글 모드일 경우엔, 사각형 맵
> 2인 co-op 모드의 경우, 두 사각형이 있는 8자형 맵
>
> 그리는 함수는 존재하니, 모드에 따른 맵에 대한 몬스터 경로(vertex 기반) 만들기

<br>

> #### 이동 동기화 피드백

프레임 설정 ex. 100ms 로 시작해서 점차 줄여가면서 최적화 시도

>> 브로드캐스팅 대신 부하가 좀 생김
>> 프레임을 낮춘다면 뚝뚝 끊김

따라서 클라이언트에서는 보정이 필요
선형보간 lerp로 이동

1. 프레임 단위로 할것인가
2. 목적지 단위로 할 것인가
