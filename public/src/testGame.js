//import {} from "./init/socket.js"
// import Monsters from "./model/monsterSpawner.js"

// const canvas = document.getElementById("gameCanvas");
// const ctx = canvas.getContext("2d");

// // 상자 배열
// let boxes = [];

// // 상자 클래스 정의
// class Box {
//   constructor(x, y, width, height, color, speed) {
//     this.x = x;
//     this.y = y;
//     this.width = width;
//     this.height = height;
//     this.color = color;
//     this.speed = speed; // 상자의 이동 속도
//   }

//   // 상자 그리기
//   draw() {
//     ctx.fillStyle = this.color;
//     ctx.fillRect(this.x, this.y, this.width, this.height);
//   }

//   // 상자 이동
//   move() {
//     this.x += this.speed; // x 방향으로 이동

//     // 상자가 캔버스를 벗어나면 삭제
//     if (this.x > canvas.width) {
//       const index = boxes.indexOf(this);
//       if (index > -1) {
//         boxes.splice(index, 1); // 배열에서 제거
//       }
//     }
//   }
// }

// // 랜덤 상자 생성 함수
// export const generateBox = () => {
//   const x = 0; // 화면의 왼쪽 끝에서 시작
//   const y = (canvas.height /2); // 랜덤 Y 위치
//   const width = 30 + Math.random() * 70; // 랜덤 너비
//   const height = 30 + Math.random() * 70; // 랜덤 높이
//   const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`; // 랜덤 색상
//   const speed = 1 + Math.random() * 3; // 랜덤 이동 속도

//   const newBox = new Box(x, y, width, height, color, speed);
//   boxes.push(newBox); // 상자 배열에 추가
//   console.log("상자 생성완료");
// }

// // 상자들 그리기
// function drawBoxes() {
//   if(boxes.length === 0) {
//     return;
//   }
//   ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화
//   for (let box of boxes) {
//     box.move(); // 상자 이동
//     box.draw(); // 상자 그리기
//   }
// }

// // // 1초마다 랜덤 상자 생성
// // setInterval(() => {
// //   generateBox(); // 랜덤 상자 생성
// // }, 1000); // 1초마다 실행

// // 60fps로 상자 이동 및 그리기
// setInterval(() => {
//   drawBoxes(); // 상자 이동 및 그리기
// }, 1000 / 60); // 60fps로 실행
