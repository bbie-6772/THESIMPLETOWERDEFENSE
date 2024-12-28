// 몬스터들 애니메이션
const monsterAnimations = {
  ant: [],
  bat: [],
  bear: [],
  bettle: [],
  bunny: [],
  dino: [],
  dog: [],
  eagle: [],
  gator: [],
  ghost: [],
  dragon: [],
};

// 몬스터 애니메이션 이미지 로드.
export function loadMonsterImages() {
  // 개미 몬스터 애니메이션 이미지.
  loadImages("ant", 8);

  // 박쥐 몬스터 애니메이션 이미지.
  loadImages("bat", 3);
  
  // 곰 몬스터 애니메이션 이미지.
  loadImages("bear", 4);

  // 딱정벌래 애미메이션 이미지.
  loadImages("bettle", 4);

  // 토끼 몬스터 애니메이션 이미지.
  loadImages("bunny", 3);

  // 공룡 몬스터 애니메이션 이미지.
  loadImages("dino", 7);

  // 개 몬스터 애니메이션 이미지.
  loadImages("dog", 4);

  // 독수리 몬스터 애니메이션 이미지.
  loadImages("eagle", 4);

  // 악어 몬스터 애니메이션 이미지.
  loadImages("gator", 4);

  // 유령 몬스터 애니메이션 이미지.
  loadImages("ghost", 6);

  // 용 몬스터 애니메이션 이미지.
  loadImages("dragon", 9);

}

// 이미지 로드.
function loadImages(name, frame) {
  for (let i = 1; i <= frame; i++) {
    const img = new Image();

    switch (name) {
      case "ant":
        img.src = `../../assets/images/monsters/ant/ant-${i}.png`
        monsterAnimations.ant.push(img);
        break;
      case "bat":
        img.src = `../../assets/images/monsters/bat/bat-${i}.png`
        monsterAnimations.bat.push(img);
        break;
      case "bear":
        img.src = `../../assets/images/monsters/bear/bear-${i}.png`
        monsterAnimations.bear.push(img);
        break;
      case "bettle":
        img.src = `../../assets/images/monsters/bettle/bettle-${i}.png`
        monsterAnimations.bettle.push(img);
        break;
      case "bunny":
        img.src = `../../assets/images/monsters/bunny/bunny-${i}.png`
        monsterAnimations.bunny.push(img);
        break;
      case "dino":
        img.src = `../../assets/images/monsters/dino/dino-${i}.png`
        monsterAnimations.dino.push(img);
        break;
      case "dog":
        img.src = `../../assets/images/monsters/dog/dog-${i}.png`
        monsterAnimations.dog.push(img);
        break;
      case "eagle":
        img.src = `../../assets/images/monsters/eagle/eagle-${i}.png`
        monsterAnimations.eagle.push(img);
        break;
      case "gator":
        img.src = `../../assets/images/monsters/gator/gator-${i}.png`
        monsterAnimations.gator.push(img);
        break;
      case "ghost":
        img.src = `../../assets/images/monsters/ghost/ghost-${i}.png`
        monsterAnimations.ghost.push(img);
        break;
      case "dragon":
        img.src = `../../assets/images/monsters/bose.dragon/dragon-${i}.png`
        monsterAnimations.dragon.push(img);
        break;
    }
  }
}

// (Get) 전체 애니메이션
export function GetMonsterAnimations(){
  return monsterAnimations;
}

// (Get) 애니메이션
export function GetMonsterAnimation(name){
  return monsterAnimations[name];
}
