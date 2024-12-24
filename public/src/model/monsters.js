export default class Monsters {
  constructor(socket) {
    // 소캣 연결
    this.socket = socket;
    this.gameId = gameId;

    // 변수
    this.monsters = {};

    // 메시지 연결
    this.receiveMonsterMessage();
  }

  // 싱글턴
  static getInstance = (socket, gameId) => {
    if (!Monsters.instance) {
      Monsters.instance = new Monsters(socket, gameId);
    }
    return Monsters.instance;
  };

  // (Get) 몬스터 정보.
  getMonster(index) {
    return this.monsters[index];
  }

  // (Get) 전체몬스터 정보.
  getMonsters() {
    return this.monsters;
  }

  
  // (Get) 몬스터 현재 좌표.
  getMonsterPosition(index) {
    if(this.monsters[index] !== undefined) {
      const currentX = this.monsters[index].x;
      const currentY = this.monsters[index].y;

      return {x : currentX, y : currentY};
    } else {
      console.log("몬스터가 존재 하지 않습니다. (좌표)");
    }
  }

  // 클라 -> 서버 메세지.
  sendMonsterMessage(gameId,x,y) {
    // 최초 초기화 (이걸해야 리스폰이 가능함.)
    this.socket.emit('monstersInitialization', {
      message : {
        gameId : gameId,
        x: x,
        y: y
      }
    });
  }

  // 서버 -> 클라 메세지.
  receiveMonsterMessage() {
    this.socket.on(this.gameId, (data) => {
      // 몬스터 스폰.
      if(data.message.eventName === "spawnMonster"){
        const index = data.message.info.uuid;
        this.monsters[index] = data.message.info;

        console.log("몬스터 스폰 완료.");
        console.log(this.monsters[index]);
      }

      // 몬스터 삭제.
      if(data.message.eventName === "deleteMonster"){
        const index = data.message.index;

        if(this.monsters[index] !== undefined) {
          delete this.monsters[index];
        } else {
          console.log("몬스터 삭제 실패. (인덱스 확인)");
        }
        
      }
    });
  }

}
