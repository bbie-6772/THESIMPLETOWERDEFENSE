//import {generateBox} from '../testGame.js'
import {spawnMonster, A, B, C} from '../game.js'
export default class Monsters {
  constructor(socket,gameId) {
    // 소캣 연결
    this.socket = socket;
    this.gameId = gameId;
    this.data = {};

    // 변수
    this.monsters = {};

    // 메시지 연결
    this.receiveMonsterMessage();
  }

  // 싱글턴
  static getInstance = (socket = null, gameId = null) => {
    if (!Monsters.instance) {
      Monsters.instance = new Monsters(socket, gameId);
      console.log("생성");
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
  sendMonsterMessage(  x, y) {
    // 최초 초기화 (이걸해야 리스폰이 가능함.)
    this.socket.emit("monsterEventInit", {
      message: {
        gameId: this.gameId,
        x: x,
        y: y,
      },
    });
  }
  // 데미지 테스트 - 테스트입니다 지울예정
  sendMonsterDamageMessage(uuid,damage) {
    this.socket.emit("monsterDamageMessage", {
      uuid: uuid,
      damage: damage,
    });
  }

  // 정보 가져오기 - 테스트입니다 지울예정
  infoMessage() {
    this.socket.emit("monsterInfoMessage", {
      message: {
        gameId: this.gameId,
      },
    });
  }

  // 서버 -> 클라 메세지.
  receiveMonsterMessage() {

    console.log(this.gameId);
    this.socket.on(this.gameId, (data) => {
      // 몬스터 스폰.
      if (data.message.eventName === "spawnMonster") {
        
        const index = data.message.info.uuid;
        this.monsters[index] = data.message.info;

        // 테스트용 - 테스트입니다 지울예정
        spawnMonster(A(),B(),C(), index);

      }

      // 몬스터 삭제
      if(data.message.eventName === "monsterRemove"){
        const index = data.message.index;
        
        delete this.monsters[index];
        console.log(`몬스터  삭제 완료. (${Object.keys(this.monsters).length})`);
        
      }

      // 정보 - 테스트입니다 지울예정
      if(data.message.eventName === "monsterInfoMessage"){
        this.data = Object.keys(data.message.data).length !== 0 ? data.message.data : {};
      }

    });




  }
}
