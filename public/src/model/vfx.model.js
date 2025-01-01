export class Vfx {
  constructor(Animations, x, y , size, animationSpeed, width = 80, height = 80) {
    // 이미지 크기
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.size = size;

    // 애니메이션
    this.animation = Animations; // 애니메이션 데이터 (배열)
    this.currentFrame = 0; // 현재 프레임
    this.frameTime = 0; // 프레임 타이머
    this.animationSpeed = animationSpeed; // 애니메이션 속도 (몇 프레임마다 변경할지)

    this.isFinished = false; // 애니메이션이 끝났는지 여부
  }

  getIsFinished(){
    return this.isFinished;
  }

  
  draw(ctx) {
    if (this.isFinished) return; // 애니메이션이 끝났으면 그리지 않음

    const currentImage = this.animation[this.currentFrame];
    ctx.drawImage(
      currentImage,
      this.x - (this.width * this.size) / 2, // x좌표를 중심으로 조정
      this.y - (this.height * this.size) / 2, // y좌표를 중심으로 조정
      this.width * this.size, // 너비
      this.height * this.size // 높이
    );

    
    // 프레임 시간 증가
    this.frameTime++;

    // 주어진 속도로 애니메이션을 전환
    if (this.frameTime >= this.animationSpeed) {
      this.frameTime = 0;
      this.currentFrame++;

      // 애니메이션 끝나면 종료 처리
      if (this.currentFrame >= this.animation.length) {
        this.isFinished = true;
      }
    }
  }
}
