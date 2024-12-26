export default class MonsterStorage {
  // 생성자.
  constructor() {
    this.info = {};
    this.monsters = {};

    /*
      ## monsters ## 
        gameId: 룸 아이디
        name: 몬스터 이름
        uuid: 몬스터 uuid (매게변수로 쓰인다.)
        x: 몬스터 좌표 x
        y: 몬스터 좌표 y
        targetX: 웨어포인트 좌표 x
        targetY: 웨어포인트 좌표 y
        stat: {
          health: 몬스터 체력
          speed: 몬스터 스피드
        }

      ## info ## 
        totalCount: 누적소환_몬스터의 수 
        aliveCount: 생존_몬스터의 수 
        kills     : 죽은_몬스터의 수
        respawning: 리스폰 여부
        wave: 0,  : 현재 웨이브 (점수 계산용)
    */

    /*===매게변수====*/
    /*
      id          : 룸 아이디.
      monsterUuid : 몬스터 uuid
      data        : 데이터
    */
    /*===============*/
  }

  // 싱글턴.
  static getInstance = () => {
    if (!MonsterStorage.instance) {
      MonsterStorage.instance = new MonsterStorage();
    }
    return MonsterStorage.instance;
  };

  // 몬스터 생성.
  addMonster(id, monsterUuid, data) {
    // 해당 Id가 존재하지 않는다면 새로 생성.
    if (!this.monsters[id]) {
      this.monsters[id] = {};
    }

    // 몬스터 생성.
    this.monsters[id][monsterUuid] = data;
  }

  // 정보 생성.
  addInfo(id, data) {
    // 해당 Id가 존재하지 않는다면 새로 생성.
    if (!this.info[id]) {
      this.info[id] = {};
    }

    // 정보 생성.
    this.info[id] = data;
  }

  // 데이터 조회 (정보)
  getInfo(id) {
    // 찾는 데이터가 존재 하지않는다면.
    if(!this.info[id]) {
      console.log("정보가 존재하지 않습니다.");
    }

    return this.info[id] || {};
  }

  // 데이터 업데이트 (정보)
  updateInfo(id,newData) {
    // 찾는 데이터가 존재 하지않는다면.
    if(!this.info[id]) {
      console.log("정보가 존재하지 않습니다.");
      return;
    }

    // 정보  업데이트
    this.info[id] = {
      ...this.info[id],
      ...newData, // 전달된 새로운 데이터로 갱신
    };
  }

  // 데이터 삭제 (정보)
  removeInfo(id, monsterUuid) {
    if (!this.monsters[id][monsterUuid]) {
      console.log("삭제할 정보가 존재하지 않습니다.");
      return;
    }

    delete this.monsters[id][monsterUuid];
  }

  // 데이터 조회(단일 몬스터) - 특정 게임의 특정 몬스터 데이터를 가져옵니다.
  getMonster(id, monsterUuid) {
    // 찾는 데이터가 존재하지않는다면
    if (!this.monsters[id][monsterUuid]) {
      console.log("데이터가 존재하지 않습니다.");
    }

    return this.monsters[id][monsterUuid] || {};
  }

  // 데이터 조회(전체 몬스터) - 특정 게임의 모든 몬스터 데이터를 가져옵니다.
  getMonsters(id) {
    // 찾는 데이터가 존재하지않는다면
    if (!this.monsters[id]) {
      console.log("데이터가 존재하지 않습니다.");
    }

    return this.monsters[id] || {};
  }

  // 데이터 업데이트 (몬스터)
  updateMonster(id, monsterUuid, newData) {
    if (!this.monsters[id][monsterUuid]) {
      console.log("업데이트할 몬스터가 존재하지 않습니다.");
      return;
    }

    // 몬스터 데이터 업데이트
    this.monsters[id][monsterUuid] = {
      ...this.monsters[id][monsterUuid],
      ...newData, // 전달된 새로운 데이터로 갱신
    };
  }

  // 데이터 삭제 (몬스터)
  removeMonster(id, monsterUuid) {
    if (!this.monsters[id][monsterUuid]) {
      console.log("삭제할 몬스터가 존재하지 않습니다.");
      return;
    }

    delete this.monsters[id][monsterUuid];
  }
}
