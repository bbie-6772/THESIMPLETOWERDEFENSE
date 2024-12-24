import { Server as SocketIO } from "socket.io";
import { getGameAssets } from "../init/assets.js";
import { v4 as uuidv4 } from "uuid";

export default class Monsters {
  // 생성자.
  constructor(socket) {
    /*== 통신용 변수 ==*/
    this.socket = socket;
    this.eventName = null;
    /*=================*/

    /*== 리스폰 확인용 ==*/
    this.isMonsterSpawnActive = false;
    this.spawnCount = 0;
    /*===================*/

    /*== 변수 ==*/
    this.monster = {};
    this.currentWP_X = null;
    this.currentWP_Y = null;
    /*==========*/

    /*== 에셋 ==*/
    this.stagesAssets = getGameAssets.stages; // 스테이지
    this.monstersAssets = getGameAssets.monstes; // 몬스터
    /*==========*/

    // 메시지 연결
    this.monsterMessage();
  }

  // 싱글턴
  static getInstance = () => {
    if (!Monsters.instance) {
      Monsters.instance = new Monsters();
    }
    return Monsters.instance;
  };

  // 몬스터 생성.
  static createMonster = (io, count) => {
    const instance = Monsters.getInstance();

    // 1. 이벤트 네임은 반드시 존재해야합니다.
    if (instance.eventName === null) {
      return;
    }

    // 2. 시작 포지션은 반드시 존재해야합니다.
    if (instance.currentWP_X === null && instance.currentWP_Y === null) {
      return;
    }

    // 3. 스폰 카운터가 0이라면 스폰 카운터를 갱신합니다.
    if (instance.spawnCount === 0) {
      instance.spawnCount = count;
    }

    const spawnInterval = setInterval(() => {
      // 4. 몬스터 생성이 활성화 됬는지 체크.
      if (!instance.isMonsterSpawnActive) {
        // 5. 몬스터 스폰카운터가 0이라면 스폰을 중지합니다.
        if (instance.spawnCount <= 0) {
          clearInterval(spawnInterval);
          console.log("모든 몬스터가 생성되었습니다!");
          return;
        }

        // 6. 몬스터 생성을 활성화 합니다.
        instance.isMonsterSpawnActive = true;

        // 7. 몬스터의 고유 uuid 생성.
        const uuid = uuidv4(); // 몬스터 마다 uuid 생성.

        // 8. 클라에 보낼 메세지를 만든다. (임시!!!!!)
        const monsterInfo = {
          name: "", // 이름
          uuid: "", // uuid
          health: null, // 체력
          speed: null, // 스피드
          startWP_X: instance.startWP_X, // 시작 포지션 x
          startWP_Y: instance.startWP_Y, // 시작 포지션 y
          nextWP_X: null, // 다음 웨어 포인트 x
          nextWP_Y: null, // 다음 웨어 포인트 y
        };

        // 9. 메세지를 보내자. (전체로)
        io.emit(instance.eventName, {
          message: {
            eventName: "spawnMonster",
            info: monsterInfo,
          },
        });

        // 10. 검증용 데이터 베열에 담기
        instance.monster[uuid] = monsterInfo;

        // 11. 카운터 감소.
        instance.spawnCount--;

        // 12. 일정 시간 후 메시지 전송 상태를 다시 초기화 (생성 제한 용.)
        setTimeout(() => {
          instance.isMonsterSpawnActive = false;
        }, 1000); // 1초마다 한번만 메시지 전송
      }
    }, 1000); // 1000ms = 1초
  };

  // 몬스터 메세지 처리 (수신).
  monsterMessage() {
    // 게임시작시 발생하는 메세지.
    this.socket.on("monstersInitialization", (data) => {
      this.eventName = data.message.eventName;
      this.currentWP_X = data.message.position.currentWP_X;
      this.currentWP_Y = data.message.position.currentWP_Y;
    });

    // 피격
    this.socket.on("monsterDamage", (data) => {
      // 로직 작성 (임시.)
    });
  }

  // (Get) 몬스터 정보가져오기~
  static getMonster = (index) => {
    const instance = Monsters.getInstance();
    return instance.monster[index];
  };

  // (Get) 모든 몬스터 정보가져오기~
  static getAllMonster = (index) => {
    const instance = Monsters.getInstance();
    return instance.monster;
  };

  // (Set) 몬스터 정보 수정~ (미완)
  static setMonster = (index, data) => {
    const instance = Monsters.getInstance();
    instance.monster[index] = data;
  };

  // (Set) 몬스터 웨어포인트 수정.
  static setMonsterWaypoint = (index, wp_x, wp_y) => {
    const instance = Monsters.getInstance();

    const nextWP_X = instance.monster[index].nextWP_X;
    const nextWP_Y = instance.monster[index].nextWP_Y;

    if (nextWP_X !== wp_x && nextWP_Y !== wp_y) {
      console.log("몬스터의 웨어 포인트가 다릅니다. ");
    }

    // 다은 웨어 포인트 지정.
    instance.monster[index].nextWP_X;
    instance.monster[index].nextWP_X;
  };

  // (Set) 몬스터 체력 수정.
  static setMonsterHealth = (io, index, data) => {
    const instance = Monsters.getInstance();
    instance.monster[index].health = instance.monster[index].health - data;

    // 삭제 검증.
    instance.removeMonster(io, index);
  };

  // 몬스터 삭제.
  static removeMonster = (io, index) => {
    const instance = Monsters.getInstance();

    // 몬스터의 체력이 0이 라면
    if (instance.monster[index].health <= 0) {
      instance.monster.splice(index, 1); // 해당 인덱스의 몬스터 삭제

      // 삭제 되었다면
      io.emit(instance.eventName, {
        message: {
          eventName: "deleteMonster",
          index: index,
        },
      });
    }
  };
}
