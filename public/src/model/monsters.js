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

  // 클라 -> 서버 메세지.
  sendMonsterMessage(gameId,x,y) {
    // 최초 초기화 (이걸해야 리스폰이 가능함.)
    this.socket.emit('monsterEventInit', {
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

    });
  }

}
