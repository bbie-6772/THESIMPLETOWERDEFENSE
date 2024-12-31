const vfxAnimations = {
  enemyDeath0: [],
  enemyDeath1: [],
  enemyDeath2: [],
};


// 몬스터 애니메이션 이미지 로드.
export function loadVfxImages() {
  // vfx 1번 애니메이션 이미지.
  loadImages(0, 6);

  // vfx 2번 애니메이션 이미지.
  loadImages(1, 7);
  
  // vfx 3번 애니메이션 이미지.
  loadImages(2, 4);

}

// 이미지 로드.
function loadImages(name, frame) {
  for (let i = 1; i <= frame; i++) {
    const img = new Image();

    switch (name) {
      case 0:
        img.src = `../../assets/images/vfx/01/enemy-death-${i}.png`
        vfxAnimations.enemyDeath0.push(img);
        break;
      case 1:
        img.src = `../../assets/images/vfx/02/enemy-death-${i}.png`
        vfxAnimations.enemyDeath1.push(img);
        break;
      case 2:
        img.src = `../../assets/images/vfx/03/enemy-death-${i}.png`
        vfxAnimations.enemyDeath2.push(img);
        break;
    }
  }
}

// (Get) 전체 애니메이션
export function GetVfxAnimations(){
  return vfxAnimations;
}

// (Get) 애니메이션
export function GetVfxAnimation(name){
  return vfxAnimations[`enemyDeath${name}`];
}

