export class TestMonster {
  constructor(path, monsterAnimations, data, level) {
    // 생성자 안에서 몬스터의 속성을 정의한다고 생각하시면 됩니다!
    if (!path || path.length <= 0) {
      throw new Error("몬스터가 이동할 경로가 필요합니다.");
    }
    // 이동
    this.path = path; // 몬스터가 이동할 경로
    this.currentIndex = 0; // 몬스터가 이동 중인 경로의 인덱스
    this.x = path[0].x; // 몬스터의 x 좌표 (최초 위치는 경로의 첫 번째 지점)
    this.y = path[0].y; // 몬스터의 y 좌표 (최초 위치는 경로의 첫 번째 지점)

    // 이미지
    this.width = 80; // 몬스터 이미지 가로 길이
    this.height = 80; // 몬스터 이미지 세로 길이
    this.isFlipped = false;

    // 애니메이션
    this.animation = monsterAnimations; // 몬스터 애니메이션
    this.currentFrame = 0; // 현재 프레임
    this.frameTime = 0; // 프레임 변경 주기
    this.animationSpeed = 5; // 애니메이션 속도 (프레임마다 몇 번에 하나씩 변경)

    // 몬스터 정보
    this.uuid = data.uuid;
    this.speed = data.stat.speed; // 몬스터의 이동 속도
    this.name = data.name; // ahstmxj dlfma
    this.level = level; // 몬스터 레벨
    this.maxHp = data.stat.health + 10 * level; // 몬스터의 현재 HP
    this.hp = this.maxHp; // 몬스터의 현재 HP
    this.attackPower = 10 + 1 * level; // 몬스터의 공격력 (기지에 가해지는 데미지)
  }

  move(base) {
    if (this.currentIndex < this.path.length - 1) {
      const nextPoint = this.path[this.currentIndex + 1];
      const deltaX = nextPoint.x - this.x;
      const deltaY = nextPoint.y - this.y;

      // 좌우 반전 상태 결정
      this.isFlipped = deltaX < 0; // deltaX가 음수면 왼쪽으로 이동 중이므로 반전

      // 2차원 좌표계에서 두 점 사이의 거리를 구할 땐 피타고라스 정리를 활용하면 됩니다! a^2 = b^2 + c^2니까 루트를 씌워주면 되죠!
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < this.speed) {
        // 거리가 속도보다 작으면 다음 지점으로 이동시켜주면 됩니다!
        this.currentIndex++;
      } else {
        // 거리가 속도보다 크면 일정한 비율로 이동하면 됩니다. 이 때, 단위 벡터와 속도를 곱해줘야 해요!
        this.x += (deltaX / distance) * this.speed; // 단위 벡터: deltaX / distance
        this.y += (deltaY / distance) * this.speed; // 단위 벡터: deltaY / distance
      }
      return false;
    } else {
      const isDestroyed = base.takeDamage(this.attackPower); // 기지에 도달하면 기지에 데미지를 입힙니다!
      this.hp = 0; // 몬스터는 이제 기지를 공격했으므로 자연스럽게 소멸해야 합니다.
      return isDestroyed;
    }
  }

  // lerp
  lerp(start, end, t) {
    return start + (end - start) * t;
  }
  // 클라이언트에서 받은 목적지로 부드럽게 이동하는 메서드
  moveWithLerp(targetX, targetY) {
    // Lerp를 사용하여 부드럽게 이동
    this.x = targetX; //this.lerp(this.x, targetX, this.speed);
    this.y = targetY; //this.lerp(this.y, targetY, this.speed);
  }

  updateAnimation() {
    this.frameTime++;

    if (this.frameTime >= this.animationSpeed) {
      this.frameTime = 0;
      this.currentFrame++;

      // 현재프레임이 애니메이션 크기보다 크다면 현재프레임으로 0으로 만든다.
      if (this.currentFrame >= this.animation.length) {
        this.currentFrame = 0;
      }
    }
  }

  draw(ctx) {
    const width = this.animation[this.currentFrame].width * 2;
    const height = this.animation[this.currentFrame].height * 2;

    ctx.save(); // 캔버스 상태 저장

    // 좌우 반전 처리
    if (this.isFlipped) {
      ctx.translate(this.x + width / 2, this.y + height / 2); // 중심으로 이동
      ctx.scale(-1, 1); // X축 반전
      ctx.translate(-this.x - width / 2, -this.y - height / 2); // 원래 위치로 복귀
    }

    ctx.drawImage(
      this.animation[this.currentFrame],
      this.x,
      this.y,
      width,
      height,
    );

    ctx.restore(); // 캔버스 상태 복구

    ctx.font = "12px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(
      `(레벨 ${this.level}) ${this.name} : ${this.hp}/${this.maxHp}`,
      this.x,
      this.y - 5,
    );
  }
}
