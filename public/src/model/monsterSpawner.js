import { TestMonster } from "./testMonster.js";
import { GetMonsterAnimation } from "./monsterAnimations.model.js";
import { spawnMonster, deleteMonster } from "../game.js";

export default class Monsters {
  constructor(socket, gameId) {
    // 소캣 연결
    this.socket = socket;
    this.gameId = gameId;

    // 변수
    this.path = [];
    this.info = {};
    this.wave = 1;

    // 메시지 연결
    this.receiveMonsterMessage();
  }

  // 싱글턴
  static getInstance = (socket = null, gameId = null) => {
    if (!Monsters.instance) {
      Monsters.instance = new Monsters(socket, gameId);
    }
    return Monsters.instance;
  };

  // 초기화
  initialization(path) {
    this.path = path;
  }

  // 클라 -> 서버 메세지.
  sendMonsterMessage(x, y) {
    // 최초 초기화 (이걸해야 리스폰이 가능함.)
    this.socket.emit("monsterEventInit", {
      message: {
        gameId: this.gameId,
        x: x,
        y: y,
      },
    });
  }

  // 데미지 테스트 - 테스트입니다
  sendMonsterDamageMessage(uuid, damage) {
    this.socket.emit("monsterDamageMessage", {
      uuid: uuid,
      damage: damage,
    });
  }

  // 서버 -> 클라 메세지.
  receiveMonsterMessage() {
    this.socket.on(this.gameId, (data) => {
      // 몬스터 스폰.
      if (data.message.eventName === "spawnMonster") {
        const monsterInfo = data.message.info;
        const monsterAnimation = GetMonsterAnimation(monsterInfo.name);
        const test = new TestMonster(
          this.path,
          monsterAnimation,
          monsterInfo,
          this.wave,
        );
        spawnMonster(test);
      }

      // 몬스터 삭제
      this.socket.on(this.gameId, (data) => {
        if (data.message.eventName === "deleteMonster") {
          deleteMonster(data.message.monster);
        }
      });

      // 핑퐁
      this.socket.on(this.gameId, (data) => {
        if (data.message.eventName === "respawnPing") {
          this.socket.emit(this.gameId, {
            message: { eventName: "respawnPong" },
          });
        }
      });

      // 정보
      this.socket.on(this.gameId, (data) => {
        if (data.message.eventName === "monsterInfoMessage") {
          this.info = Object.keys(data.message.info).length !== 0 ? data.message.info : {};
          this.wave = this.info.wave;
        }
      });
    });

  }

  getInfo() {
    return this.info;
  }
}
