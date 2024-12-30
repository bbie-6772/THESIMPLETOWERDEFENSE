import { TestMonster } from "./testMonster.js";
import { GetMonsterAnimation } from "./monsterAnimations.model.js";
//import { spawnMonster, deleteMonster } from "../game.js";

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

    // 동적으로 연결
    this.spawnMonster = null;
    this.deleteMonster = null;
  }

  // 싱글턴
  static getInstance = (socket = null, gameId = null) => {
    //console.log(`접속한 소켓 : ${socket.id} `)
    if (!Monsters.instance) {
      Monsters.instance = new Monsters(socket, gameId);
    }
    return Monsters.instance;
  };

  // 필요한 시점에만 동적으로 import() 하여 로딩
  // 모듈을 동적으로 불러오는 메소드
  async loadGameModule() {
    console.log("와주세요..");
    // 이미 로드된 경우, 다시 로드하지 않음
    if (!this.spawnMonster || !this.deleteMonster) {
      const module = await import("../game.js");
      this.spawnMonster = module.spawnMonster;
      this.deleteMonster = module.deleteMonster;
      console.log("Game module dynamically loaded!");
    }
  }

  // 초기화
  async initialization() {
    // 서버 전송.
    this.socket.emit("monsterEventInit", {
      message: {
        gameId: this.gameId,
      },
    });

    // 서버 수신.
    this.socket.on("monsterEventInit", (data) => {
      this.info = Object.keys(data).length !== 0 ? data : {};

      console.log( this.info.path);
    });

    // 한번만 임포트.
    await this.loadGameModule();
  }

  // 패스 가져오기
  getPath(){
    return this.info.path;
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
          this.info =
            Object.keys(data.message.info).length !== 0
              ? data.message.info
              : {};
          this.wave = this.info.wave;
        }
      });
    });
  }

  getInfo() {
    return this.info;
  }
}
