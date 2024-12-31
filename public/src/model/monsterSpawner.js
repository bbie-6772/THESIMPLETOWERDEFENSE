import { TestMonster } from "./testMonster.js";
import { GetMonsterAnimation } from "./monsterAnimations.model.js";

export default class Monsters {
  constructor(socket, gameId) {
    // 소캣 연결
    this.socket = socket;
    this.gameId = gameId;
    this.monsters = [];
    this.vfxs = [];
    // 변수
    this.path = [];
    this.info = {};
    this.wave = 1;
    // 메시지 연결
    this.receiveMonsterMessage();
  }

  // 싱글턴
  static getInstance = (socket = null, gameId = null) => {
    //console.log(`접속한 소켓 : ${socket.id} `)
    return new Monsters(socket, gameId)
  };

  // 초기화
  initialization() {
    // 서버 전송.
    this.socket.emit("monsterEventInit", {
      message: {
        gameId: this.gameId,
      },
    });

    // 서버 수신.
    this.socket.on("monsterEventInit", (data) => {
      this.info = Object.keys(data).length !== 0 ? data : {};
    });
  }

  // 패스 가져오기
  getPath() {
    return this.info.path;
  }

  spawnMonster(monster) {
    this.monsters.push(monster);
  }

  deleteMonster(uuid) {
    const index = monsters.findIndex((obj) => obj.uuid === uuid);
    if (index !== -1) {
      this.monsters.splice(index, 1); // 해당 인덱스의 객체를 삭제
    }
  }

  getMonsters() {
    return this.monsters;
  }

  // 데미지 테스트 - 테스트입니다
  sendMonsterDamageMessage(uuid, damage) {
    this.socket.emit(this.gameId, {
      message: {
        eventName: "monsterDamageMessage",
        uuid: uuid,
        damage: damage,
      },
    });
  }

  // 서버 -> 클라 메세지.
  receiveMonsterMessage() {
    console.log(this.gameId);
    this.socket.on(this.gameId, (data) => {
      // 몬스터 스폰.
      if (data.message.eventName === "spawnMonster") {
        const monsterInfo = data.message.info;
        const monsterAnimation = GetMonsterAnimation(monsterInfo.name);
        const test = new TestMonster(
          this.info.path,
          monsterAnimation,
          monsterInfo,
          this.wave,
        );
        this.spawnMonster(test);
      }

      // 몬스터 삭제
      if (data.message.eventName === "deleteMonster") {
        //this.deleteMonster(data.message.monster);
      }

      // 핑퐁
      if (data.message.eventName === "respawnPing") {
        this.info = data.message.info;
        this.wave = this.info.wave;
        this.socket.emit(this.gameId, {
          message: {
            eventName: "respawnPong",
          },
        });
      }

      // 정보
      if (data.message.eventName === "monsterInfoMessage") {
        this.info =
          Object.keys(data.message.info).length !== 0 ? data.message.info : {};
        this.wave = this.info.wave;
      }
    });
  }

  getInfo() {
    return this.info;
  }
}
