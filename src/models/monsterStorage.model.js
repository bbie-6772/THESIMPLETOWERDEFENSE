export default class MonsterStorage {
  // 생성자.
  constructor() {
    this.monsterStorage = {};
  }

  // 싱글턴.
  static getInstance = () => {
    if (!MonsterStorage.instance) {
      MonsterStorage.instance = new MonsterStorage();
    }
    return MonsterStorage.instance;
  };

  // 데이터 추가
  addMonster(id, monsterUuid, data) {
    // 해당 Id가 존재하지 않는다면 새로 생성.
    if (!this.monsterStorage[id]) {
      this.monsterStorage[id] = {};
    }

    // 해당 Id가 존재한다면 데이터 추가
    this.monsterStorage[id][monsterUuid] = data;
  }

  // 데이터 조회(단일 몬스터) - 특정 게임의 특정 몬스터 데이터를 가져옵니다.
  getMonster(id, monsterUuid) {
    // 찾는 데이터가 존재하지않는다면
    if (!this.monsterStorage[id][monsterUuid]) {
      console.log("데이터가 존재하지 않습니다.");
    }

    return this.monsterStorage[id][monsterUuid] || {};
  }

  // 데이터 조회(전체 몬스터) - 특정 게임의 모든 몬스터 데이터를 가져옵니다.
  getMonsters(id) {
    // 찾는 데이터가 존재하지않는다면
    if (!this.monsterStorage[id]) {
      console.log("데이터가 존재하지 않습니다.");
    }

    return this.monsterStorage[id] || {};
  }

  // 데이터 업데이트
  updateMonster(id, monsterUuid, newData) {
    if (!this.monsterStorage[id][monsterUuid]) {
      console.log("업데이트할 몬스터가 존재하지 않습니다.");
      return;
    }

    // 몬스터 데이터 업데이트
    this.monsterStorage[id][monsterUuid] = {
      ...this.monsterStorage[id][monsterUuid],
      ...newData, // 전달된 새로운 데이터로 갱신
    };
  }

  // 데이터 삭제
  removeMonster(id, monsterUuid) {
    if (!this.monsterStorage[id][monsterUuid]) {
      console.log("삭제할 몬스터가 존재하지 않습니다.");
      return;
    }

    delete this.monsterStorage[id][monsterUuid];
  }
}
