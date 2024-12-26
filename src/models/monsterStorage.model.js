export default class MonsterStorage {
  // 생성자.
  constructor() {
    this.info = {};
    this.monsters = {};
  }

  // 싱글턴.
  static getInstance = () => {
    if (!MonsterStorage.instance) {
      MonsterStorage.instance = new MonsterStorage();
    }
    return MonsterStorage.instance;
  };

  // 데이터 추가
  addTypedData(type, roomId, dataUuid, data) {
    switch (type) {
      case 0:
        // 정보
        addDatas(this.info, roomId, dataUuid, data);
        break;
      case 1:
        // 몬스터
        addDatas(this.monsters, roomId, dataUuid, data);
        break;
    }
  }

  addData(object, roomId, dataUuid, data) {
    // 해당 Id가 존재하지 않는다면 새로 생성.
    if (!object[roomId]) {
      object[roomId] = {};
    }

    if (!object[roomId][dataUuid]) {
      // 전에 데이터가 없다면 새로 추가.
      object[roomId][dataUuid] = data;
    } else {
      // 기존에 있으면 덮어 씌우거나 더 추가.
      object[roomId][dataUuid] = {
        ...object[roomId][dataUuid],
        ...data,
      };
    }
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
