import { Server as SocketIO } from "socket.io";
import { getGameAssets } from "../init/assets.js";
import { v4 as uuidv4 } from "uuid";

/*=== 사용법 ===*/
//// 1. 인스턴스 초기화 (최초 한번만 하면됨 위치 상관없음)
// Monsters.getInstance(socket); <- 반드시 소켓을 추가해야합니다..

//// 2. 편하게 사용할려면 변수에 담으면 됩니다.
//  const monsters = Monsters.getInstance(socket); <- 편하게 사용하기 위해 변수에 인스턴스를 담습니다.
//  안써도 되는데 안쓴다면
//  Monsters.getInstance(socket).함수(); <- 이런식으로 써도 됩니다.

//// 3. 몬스터생성은 반드시 게임시작후에 해야합니다.
//  monsters.createMonster(io, count);
//  매개변수 (io) => io는 io 입니다.
//  매개변수 (count) => 몬스터 카운터 입니다.

//// 4. 충돌 혹은 피격 이벤트 발생하면 사용해야합니다.
// monsters.setMonsterHealth(io, index, data); <-
// 매개변수 (io) => io는 io 입니다.
// 매개변수 (index) => index. 입니다.
// 매개변수 (data) => 피격 대미지입니다.
// 해당 함수는 피격후 체력이 0이라면 삭제 함수가 동시에 실행됩니다.


/*==============*/

export default class Monsters {
  // 생성자.
  constructor(socket) {
    /*== 통신용 변수 ==*/
    this.socket = socket; // socket
    this.eventName = null; // 이벤트 네임 (멀티용)
    /*=================*/

    /*== 리스폰 확인용 ==*/
    this.isMonsterSpawnActive = false;
    this.spawnCount = 0;
    /*===================*/

    /*== 변수 ==*/
    this.monster = {}; // 몬스터의 정보를 담을 객체.
    this.currentWP_X = null; // 현재 웨어포인트 x좌표.
    this.currentWP_Y = null; // 현재 웨어포인트 y좌표.
    this.isRespawn = false; // 지금 리스폰 상태.
    this.monsterCount = 0; // 타이머.
    this.killCount = 0; // 킬카운터.

    /*==========*/

    /*== 에셋 ==*/
    this.stagesAssets = getGameAssets.stages; // 스테이지
    this.monstersAssets = getGameAssets.monstes; // 몬스터

    console.log(monstersAssets);
    /*==========*/

    // 메시지 연결
    this.monsterMessage();
  }

  // 싱글턴
  static getInstance = (socket) => {
    if (!Monsters.instance) {
      Monsters.instance = new Monsters(socket);
    }
    return Monsters.instance;
  };

  // 몬스터 생성.
  static createMonster = (io, count) => {
    const instance = Monsters.getInstance();

    // 0. 리스폰이 아닌 경우에는 시작하면안됨.
    if (!instance.isRespawn) {
      console.log("리스폰 중이 아닙니다.");
      return;
    }

    // 1. 이벤트 네임은 반드시 존재해야합니다.
    if (instance.eventName === null) {
      console.log("이벤트 네임을 지정해주세요.");
      return;
    }

    // 2. 시작 포지션은 반드시 존재해야합니다.
    if (instance.currentWP_X === null && instance.currentWP_Y === null) {
      console.log("시작 좌표를 지정해주세요.");
      return;
    }

    // 3. 스폰 카운터가 0이라면 스폰 카운터를 갱신합니다.
    if (instance.spawnCount === 0) {
      instance.spawnCount = count;
    }

    const spawnInterval = setInterval(() => {
      // 4. 몬스터 생성이 활성화 됬는지 체크.
      if (!instance.isMonsterSpawnActive) {
        // 5. 몬스터 스폰카운터가 0이라면 스폰을 중지합니다. 리스폰 중지되도 마찬가지임.
        if (instance.spawnCount <= 0 || !instance.isRespawn) {
          clearInterval(spawnInterval);
          console.log("모든 몬스터가 생성되었습니다!");
          return;
        }

        // 6. 몬스터 생성을 활성화 합니다.
        instance.isMonsterSpawnActive = true;

        // 7. 몬스터의 고유 uuid 생성
        const uuid = uuidv4(); // 몬스터 마다 uuid 생성.

        // 7- 1. 몬스터 랜덤 지정 (json 파일에 저장 되어있는 정보를 가져온다).
        const monsterList = instance.monstersAssets;
        const randomIdex = Math.floor(Math.random() * monsterList.length);

        // 8. 클라에 보낼 메세지를 만든다. (임시!!!!!)
        const monsterInfo = {
          id: monsterList[randomIdex].id, // 이름
          uuid: uuid, // uuid
          health: monsterList[randomIdex].health, // 체력
          speed: monsterList[randomIdex].speed, // 스피드
          currentWP_X: instance.currentWP_X, // 시작 포지션 x
          currentWP_Y: instance.currentWP_Y, // 시작 포지션 y
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
          instance.monsterCount += 1;
        }, 1000); // 1초마다 한번만 메시지 전송
      }
    }, 1000); // 1000ms = 1초

    // 13. 여기까지 나올일은 없겠지만 나온다면 초기화.
    instance.monster = {}; // 몬스터 정보들 지우기.
    instance.isRespawn = false;
  };

  // 몬스터 메세지 처리 (수신).
  monsterMessage() {
    // 게임시작시 발생하는 메세지.
    this.socket.on("monstersInitialization", (data) => {
      this.eventName = data.message.gameId;
      this.currentWP_X = data.message.position.currentWP_X;
      this.currentWP_Y = data.message.position.currentWP_Y;
      this.isRespawn = true;
    });
  }

  // (Get) 생존한 몬스터 카운터.
  static getAliveMonsterCount = () => {
    const instance = Monsters.getInstance();
    return Object.keys(instance.monster).length;
  };

  // (Get) 몬스터를 몇마리 죽였는가
  static getKillCount = () => {
    const instance = Monsters.getInstance();
    return instance.killCount;
  };

  // (Get) 누적 몬스터 카운터.
  static getMonsterCount = () => {
    const instance = Monsters.getInstance();
    return instance.monsterCount;
  };

  // (Get) 몬스터 정보가져오기~
  static getMonster = (index) => {
    const instance = Monsters.getInstance();

    // 몬스터 유효성 검사.
    if (!instance.isMonster(index)) {
      console.log("해당 몬스터는 존재 하지않습니다.(몬스터 정보) ");
      return;
    }

    return instance.monster[index];
  };

  // (Get) 모든 몬스터 정보가져오기~
  static getAllMonster = (index) => {
    const instance = Monsters.getInstance();

    return instance.monster;
  };

  // (set) 리스폰 종료.
  static respawnInitialization() {
    const instance = Monsters.getInstance();
    instance.monster = {}; // 몬스터 정보들.
    instance.currentWP_X = null; // 현재 웨어포인트 x좌표.
    instance.currentWP_Y = null; // 현재 웨어포인트 y좌표.
    instance.isRespawn = false; // 지금 리스폰 상태.
    instance.monsterCount = 0; // 타이머.
    instance.killCount = 0; // 킬카운터.
  }

  // (Set) 몬스터 정보 수정~ (미완)
  static setMonster = (index, data) => {
    const instance = Monsters.getInstance();
    instance.monster[index] = data;
  };

  // (Set) 몬스터 체력 수정.
  static setMonsterHealth = (io, index, data) => {
    const instance = Monsters.getInstance();

    // 몬스터 유효성 검사.
    if (!instance.isMonster(index)) {
      console.log("해당 몬스터는 존재 하지않습니다.(몬스터 체력 수정) ");
      return;
    }

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
      instance.killCount += 1;

      // 삭제 되었다면
      io.emit(instance.eventName, {
        message: {
          eventName: "deleteMonster",
          index: index,
        },
      });
    }
  };

  // 몬스터 유효성 검사.
  static isMonster(index) {
    const instance = Monsters.getInstance();
    return instance.monster[index];
  }
}
