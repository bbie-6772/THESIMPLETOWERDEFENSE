import { TestMonster } from "./testMonster.js";
import { GetMonsterAnimation } from "./monsterAnimations.model.js";
import { GetVfxAnimation, GetVfxAnimations } from "./vfxAnimations.model.js";
import { Vfx } from "./vfx.model.js";

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

  // 싱글턴(아님)
  static getInstance = (socket = null, gameId = null) => {
    //console.log(`접속한 소켓 : ${socket.id} `)
    return new Monsters(socket, gameId);
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
    this.monsterAliveCountUpdate();
  }

  deleteMonster(uuid) {
    const index = this.monsters.findIndex((obj) => obj.uuid === uuid);
    if (index !== -1) {
      this.monsters.splice(index, 1); // 해당 인덱스의 객체를 삭제
      this.monsterAliveCountUpdate();
    }
  }

  getMonsters() {
    return this.monsters;
  }


  // 생존 몬스터 카운터.
  monsterAliveCountUpdate() {
    // if (this.monsters.length !== 0) {
    //   this.socket.emit(this.gameId, {
    //     message: {
    //       eventName: "monsterAliveCountUpdate",
    //       aliveCount: this.monsters.length,
    //     },
    //   });
    // }
    console.log("클라", this.monsters.length)
  }

  // 서버 -> 클라 메세지.
  receiveMonsterMessage() {
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

      // 공격 당했을때 몬스터 체력 갱신.
      if (data.message.eventName === "monsterDamaged") {
        const monsterUuid = data.message.monster.uuid;
        const monsterHealht = data.message.monster.stat.health;
        const index = this.monsters.findIndex(
          (monster) => monster.uuid === monsterUuid,
        );

        this.monsters[index].hp = monsterHealht;

        const vfxCount = Object.keys(GetVfxAnimations()).length;
        const randomVfx = Math.floor(Math.random() * vfxCount);

        const x = data.message.monster.x;
        const y = data.message.monster.y;
        const size = 1;
        const speed = 6;
        this.vfxs.push(new Vfx(GetVfxAnimation(randomVfx), x, y, size, speed));
      }

      // 몬스터 삭제
      if (data.message.eventName === "deleteMonster") {
        this.deleteMonster(data.message.monster.uuid);
        const vfxCount = Object.keys(GetVfxAnimations()).length;
        const randomVfx = Math.floor(Math.random() * vfxCount);

        const x = data.message.monster.x;
        const y = data.message.monster.y;
        const size = data.message.monster.size;
        const speed = 6;
        this.vfxs.push(new Vfx(GetVfxAnimation(randomVfx), x, y, size, speed));
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
