import { getGameAssets } from "../init/assets.js";
import { v4 as uuidv4 } from "uuid";
import MonsterStorage from "./monsterStorage.model.js";
import { generatePath } from "../init/pathGenerator.js"

/*====[구조를 변경한 이유]====*/
// 1. 룸 생성 -> 게임 시작 방식으로, 각 방마다 독립적인 인스턴스를 생성하는 것이 더 적합하다고 판단.
//    - 일반적인 클래스 구조를 사용하면 각 방의 상태와 동작을 개별적으로 관리할 수 있음.
// 2. 싱글턴으로 생성할 경우, 방이 종료된 이후에도 메모리가 해제되지 않아 리소스 누수 발생 가능성 있음.
//    - 메모리 관리 및 가비지 컬렉션 측면에서도 클래스 방식이 더 효율적임.
// 3. 싱글턴은 전역적인 상태 관리를 필요로 할 때 적합하지만, 현재 구조에서는 필요하지 않음.
//    - 방 단위의 동작과 상태 관리에 특화된 구조가 더 나은 선택이라고 판단.
// 4. 위와 같은 이유로 구조를 변경하였습니다.
/*===========================*/

export default class MonsterLifecycles {
  // 생성자
  constructor(io, socket) {
    // 변수
    this.io = io; // io
    this.socket = socket; // socket
    this.eventName = null; // 통신용 이벤트네임.
    this.monsterStorage = MonsterStorage.getInstance(); // MonsterStorage 인스턴스 연결

    // 리스폰 - setInterval 제어용도.
    this.spawnInterval = null; // setInterval 담을 용도.
    this.isMonsterSpawnActive = false; // 스폰을 진행 중인가.

    // 통신관련 변수
    this.pingPongCount = 3;

    // 에셋
    this.monstersAssets = getGameAssets().monsters.data; // 몬스터 에셋
  }

  // 초기화(리스폰 정보).
  respawnInitializer(data) {
    const monsterPath = generatePath();
    this.eventName = data.message.gameId;
    this.x = monsterPath[0].x;
    this.y = monsterPath[0].y;
    this.curIndex = 0;

    const info = {
      totalCount: 0,
      aliveCount: 0,
      kills: 0,
      score: 0,
      gold: 0,
      wave: 1,
      path: monsterPath,
      pingPong: this.pingPongCount,
    };

    // 정보 데이터 생성.
    this.monsterStorage.addInfo(this.eventName, info);

    // 초기화된 정보 클라에 보내기.
    this.socket.emit("monsterEventInit", this.monsterStorage.getInfo(this.eventName));
  }

  eventNameInitializer(data) {
    this.eventName = data.message.gameId;
  }

  //====[리스폰]====//
  spawnMonster() {
    //// 1. 이벤트 네임은 반드시 존재해야합니다.
    if (this.eventName === null) {
      console.log("이벤트 네임을 지정해주세요.");
      return;
    }

    this.spawnInterval = setInterval(() => {
      //// 3. 몬스터 생성이 활성화 됬는지 체크.
      if (!this.isMonsterSpawnActive) {
        //// 4. 서버 연결이 중지 된다면 종료한다.
        const pingPong = this.monsterStorage.getInfo(this.eventName).pingPong;
        if (pingPong === 0) {
          this.terminateRespawn();
          return;
        }

        //// 5. 몬스터 생성을 활성화 합니다.
        this.isMonsterSpawnActive = true;

        //// 6. 몬스터 정보 세팅.
        const uuid = uuidv4(); // 몬스터 마다 uuid 생성.

        // 6-1. 몬스터 랜덤 지정 (json 파일에 저장 되어있는 정보를 가져온다).
        const monsterList = this.monstersAssets;
        const monsterListLengtht = Object.keys(monsterList).length;
        const randomIdex = Math.floor(Math.random() * monsterListLengtht);

        // 6-2. 경로 지정 (패스? 웨어포인트?)
        // 이 부분은 논의 후에 작성하겠습니다.

        // 6-3. 몬스터 정보를 저장할 객체 생성.
        // const monsterInfo = {
        //   gameId: this.eventName, // 게임 id
        //   name: monsterList[randomIdex].name, // 이름
        //   uuid: uuid, // uuid
        //   x: null, // 몬스터 포지션 x
        //   y: null, // 몬스터 포지션 y
        //   gold: monsterList[randomIdex].gold,
        //   score: monsterList[randomIdex].score,
        //   stat: {
        //     health: monsterList[randomIdex].health, // 체력
        //     speed: monsterList[randomIdex].speed * 5, // 스피드
        //   },
        // };
        //#region 이동동기화 편집
        const monsterPath = generatePath();
        const monsterInfo = {
          gameId: this.eventName, // 게임 id
          name: monsterList[randomIdex].name, // 이름
          uuid: uuid, // uuid
          x: monsterPath[0].x, // 몬스터 포지션 x
          y: monsterPath[0].y, // 몬스터 포지션 y
          targetX: monsterPath[1].x,
          targetY: monsterPath[1].y,
          curIndex: 0,
          gold: monsterList[randomIdex].gold,
          score: monsterList[randomIdex].score,
          stat: {
            health: monsterList[randomIdex].health, // 체력
            speed: monsterList[randomIdex].speed * 5, // 스피드
          },
        };
        //#endregion



        //// 7. 메세지를 보내자. (전체로) - 수정 해야함!!
        this.io.emit(this.eventName, {
          message: {
            eventName: "spawnMonster",
            info: monsterInfo,
          },
        });

        //// 9. 정보 업데이트
        this.spawnCount--; // 스폰 카운터 (조건용.)
        const { totalCount } = this.monsterStorage.getInfo(this.eventName);

        //// 10. monsterStorage 추가/ 업데이트
        this.monsterStorage.addMonster(this.eventName, uuid, monsterInfo);
        this.monsterStorage.updateInfo(this.eventName, {
          totalCount: totalCount + 1,
        });


        //// 11. 일정 시간 후 메시지 전송 상태를 다시 초기화 (생성 제한 용.)
        setTimeout(() => {
          this.isMonsterSpawnActive = false;

          // 일정 카운터마다 레벨상승.
          const { wave, totalCount } = this.monsterStorage.getInfo(this.eventName);

          // 토탈 카운터 10번 기준 
          if (totalCount % 10 === 0) {
            this.monsterStorage.updateInfo(this.eventName, { wave: wave + 1 });
          }

          // 테스트용 로그 출력.
          const monstersSize = Object.keys(this.monsterStorage.getMonsters(this.eventName)).length;
          const roomSize = Object.keys(this.monsterStorage.test()).length;

          console.log(`[${this.eventName}]번방 몬스터가 생성되었습니다. (rooms : [${roomSize}] / monsters : [${monstersSize + 1}])`);

        }, 2000); // 2초마다 한번만 메시지 전송
      }
    }, 2000); // 1000ms = 1초
  }

  //====[서버 <-> 클라 연결 체크]====//
  sendRespawnPing() {
    this.socket.on(this.eventName, (data) => {
      if (data.message.eventName === "respawnPong") {
        // 클라이언트 응답 받으면 카운트 리셋
        this.monsterStorage.updateInfo(this.eventName, { pingPong: this.pingPongCount })
      }
    })

    const interval = setInterval(() => {
      let pingPong = this.monsterStorage.getInfo(this.eventName).pingPong;

      this.io.emit(this.eventName, {
        message: {
          eventName: "respawnPing",
          info: this.monsterStorage.getInfo(this.eventName),
        }
      }); // 클라이언트에게 ping 전송

      if (pingPong > 0) {
        pingPong--; // 응답 대기 중이면 카운트 감소
        this.monsterStorage.updateInfo(this.eventName, { pingPong: pingPong })
      }
      if (pingPong === 0 || pingPong === undefined) {
        clearInterval(interval); // 응답 없으면 타이머 종료
      }
    }, 1000); // 1초마다 체크
  }

  //====[리스폰 종료 처리]====//
  terminateRespawn() {
    clearInterval(this.spawnInterval);
    this.spawnInterval = null;
    this.monsterStorage.removeInfo(this.eventName);
    this.monsterStorage.removeMonsters(this.eventName);

    const roomSize = Object.keys(this.monsterStorage.test()).length;
    console.log(`[${this.eventName}]번 방 리스폰을 종료합니다. (rooms : [${roomSize}])`);

  }

  //====[몬스터 체력 업데이트]====// 
  updateMonsterHealth(monsterUuid, data) {

    let monster = this.monsterStorage.getMonster(this.eventName, monsterUuid);
    // 몬스터 유효성 검사.
    if (Object.keys(monster).length === 0) {
      return;
    }

    // 몬스터정보 업데이트
    this.monsterStorage.updateMonster(this.eventName, monsterUuid, {
      stat: {
        health: monster.stat.health - data,
        speed: monster.stat.speed,
      },
    });

    // 업데이트를 갱신.
    monster = this.monsterStorage.getMonster(this.eventName, monsterUuid);

    // 삭제 검사. 
    this.removeMonster(monster);
  }

  //====[몬스터 삭제]====//
  removeMonster(monster) {
    if (monster.stat.health <= 0) {

      const monsterScore = monster.score;
      const monstergoid = monster.gold;

      // 싱글이면 상관없지만 멀티 모드일때 다른유저에게 삭제요청.
      this.io.emit(this.eventName, {
        message: {
          eventName: "deleteMonster",
          monster: monster.uuid
        }
      }); // 클라이언트에게 ping 전송

      // 몬스터 삭제.
      this.monsterStorage.removeMonster(this.eventName, monster.uuid);

      // 정보 수정.
      const { kills, score, gold, wave } = this.monsterStorage.getInfo(this.eventName);
      const aliveCount = Object.keys(this.monsterStorage.getMonsters(this.eventName)).length;

      // 정보 업데이트.
      this.monsterStorage.updateInfo(this.eventName, {
        aliveCount: aliveCount,
        kills: kills + 1,
        score: score + (monsterScore * wave),
        gold: gold + (monstergoid * wave),
      });

      // 정보 클라에 전송.
      this.io.emit(this.eventName, {
        message: {
          eventName: "monsterInfoMessage",
          info: this.monsterStorage.getInfo(this.eventName)
        }
      });

      // 콘솔로그
      console.log(`[${this.eventName}]번방 몬스터가 제거되었습니다.`);
    }
  }

}
