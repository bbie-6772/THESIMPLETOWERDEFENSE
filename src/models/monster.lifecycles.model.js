import { getGameAssets } from "../init/assets.js";
import { v4 as uuidv4 } from "uuid";
import MonsterStorage from "./monsterStorage.model.js";
import { generatePath } from "../init/pathGenerator.js";
import {roomInfoUpdate, roomGameOverTimerSetting} from "./gameRoom.model.js"

/*====[구조를 변경한 이유]====*/
// 1. 룸 생성 -> 게임 시작 방식으로, 각 방마다 독립적인 인스턴스를 생성하는 것이 더 적합하다고 판단.
//    - 일반적인 클래스 구조를 사용하면 각 방의 상태와 동작을 개별적으로 관리할 수 있음.
// 2. 싱글턴으로 생성할 경우, 방이 종료된 이후에도 메모리가 해제되지 않아 리소스 누수 발생 가능성 있음.
//    - 메모리 관리 및 가비지 컬렉션 측면에서도 클래스 방식이 더 효율적임.
// 3. 싱글턴은 전역적인 상태 관리를 필요로 할 때 적합하지만, 현재 구조에서는 필요하지 않음.
//    - 방 단위의 동작과 상태 관리에 특화된 구조가 더 나은 선택이라고 판단.
// 4. 위와 같은 이유로 구조를 변경하였습니다.
/*===========================*/

// 상수
const WAVE_CYCLE = 10;
const ELITE_MULTIPLIER = 2; // 앨리트 몬스터 배율
const ELITE_MONSTER_SPAWN_CYCLE = 10; // 앨리터 몬스터 등장주기
const ELITE_MONSTER_SIZE = 4; // 엘리트 몬스터 크기
const NORMAL_MONSTER_SIZE = 2; // 일반 몬스터 크기
const MONSTER_SPEED = 1; // 몬스터 디폴트 속도
const MONSTER_SPAWN_CYCLE = 2000; // 리스폰 속도. (1000 === 1초)
const MONSTER_COUNTDOWN = 10;

export default class MonsterLifecycles {
  // 생성자
  constructor(io, socket) {
    // 변수
    this.io = io; // io
    this.socket = socket; // socket
    this.gameId = null; // 통신용 이벤트네임.
    this.monsterStorage = MonsterStorage.getInstance(); // MonsterStorage 인스턴스 연결

    // 리스폰 - setInterval 제어용도.
    this.spawnInterval = null; // setInterval 담을 용도.
    this.isMonsterSpawnActive = false; // 스폰을 진행 중인가.

    // 리스폰 위치 플래그 변수
    this.isSpawnOnFirstLocation = true;

    // 통신관련 변수
    this.pingPongCount = 3;

    // 에셋
    this.monstersAssets = getGameAssets().monsters.data; // 몬스터 에셋

    // 생존 몬스터 갱신
    this.monsterAliveCountUpdate();
  }

  // 초기화(리스폰 정보).
  respawnInitializer(data) {
    const monsterPath = generatePath();
    this.gameId = data.message.gameId;
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
      eliteBossUuid: "",
      endTimer: roomGameOverTimerSetting(this.gameId),
    };

    // 정보 데이터 생성.
    this.monsterStorage.addInfo(this.gameId, info);

    // 초기화된 정보 클라에 보내기.
    this.socket.emit(
      "monsterEventInit",
      this.monsterStorage.getInfo(this.gameId),
    );
  }

  eventNameInitializer(data) {
    this.gameId = data.message.gameId;
  }

  //====[리스폰]====//
  spawnMonster() {
    //// 1. 이벤트 네임은 반드시 존재해야합니다.
    if (this.gameId === null) {
      console.log("이벤트 네임을 지정해주세요.");
      return;
    }

    // 테스트용 로그 출력.
    const roomSize = Object.keys(this.monsterStorage.test()).length;
    console.log(
      `[${this.gameId}]번방 리스폰이 시작됩니다. (rooms : [${roomSize}])`,
    );


    this.spawnInterval = setInterval(() => {
      const { eliteBossUuid } = this.monsterStorage.getInfo(this.gameId);

      //// 3. 몬스터 생성이 활성화 됬는지 체크.
      if (!this.isMonsterSpawnActive) {
        //// 4. 서버 연결이 중지 된다면 종료한다.
        const pingPong = this.monsterStorage.getInfo(this.gameId).pingPong;
        if (pingPong <= 0) {
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

        //엘리트 몬스터 판단.
        const { totalCount, wave } = this.monsterStorage.getInfo(this.gameId);
        const { gold, score, health, speed } = monsterList[randomIdex];

        const isEliteMonster =
          totalCount !== 0 && totalCount % ELITE_MONSTER_SPAWN_CYCLE === 0;

        const eliteSize = isEliteMonster
          ? ELITE_MONSTER_SIZE
          : NORMAL_MONSTER_SIZE;
        const eliteGold = isEliteMonster
          ? gold * ELITE_MULTIPLIER * wave
          : gold * wave;
        const eliteScore = isEliteMonster
          ? score * ELITE_MULTIPLIER * wave
          : score * wave;
        const eliteHealth = isEliteMonster
          ? health * ELITE_MULTIPLIER * wave
          : health * wave;
        const eliteSpeed = isEliteMonster
          ? speed * MONSTER_SPEED
          : speed * MONSTER_SPEED + wave;

        // 6-3. 몬스터 정보를 저장할 객체 생성.
        //#region 이동동기화 편집
        const monsterPath = generatePath();
        // 스폰 위치 2개 번갈아 생성위해
        const resPathIndex = this.isSpawnOnFirstLocation ? 0 : 4;
        this.isSpawnOnFirstLocation = !this.isSpawnOnFirstLocation;
        const monsterInfo = {
          gameId: this.gameId, // 게임 id
          name: monsterList[randomIdex].name, // 이름
          uuid: uuid, // uuid
          x: monsterPath[resPathIndex].x, // 몬스터 포지션 x
          y: monsterPath[resPathIndex].y, // 몬스터 포지션 y
          targetX: monsterPath[resPathIndex + 1].x,
          targetY: monsterPath[resPathIndex + 1].y,
          curIndex: resPathIndex,
          size: eliteSize,
          gold: eliteGold,
          score: eliteScore,
          stat: {
            health: eliteHealth, // 체력
            speed: eliteSpeed, // 스피드
          },
        };
        //// 7. 메세지를 보내자. (전체로) - 수정 해야함!!
        this.io.emit(this.gameId, {
          message: {
            eventName: "spawnMonster",
            info: monsterInfo,
          },
        });

        //// 9. 정보 업데이트
        this.spawnCount--; // 스폰 카운터 (조건용.)
        // const {totalCount} = this.monsterStorage.getInfo(this.eventName);

        //// 10. monsterStorage 추가/ 업데이트
        this.monsterStorage.addMonster(this.gameId, uuid, monsterInfo);

        // 앨리트 몬스터 출현 이면 엘리트uuid 저장
        if (isEliteMonster) {
          this.monsterStorage.updateInfo(this.gameId, {
            totalCount: totalCount + 1,
            eliteBossUuid: uuid,
          });
        } else {
          this.monsterStorage.updateInfo(this.gameId, {
            totalCount: totalCount + 1,
          });
        }

        //// 11. 일정 시간 후 메시지 전송 상태를 다시 초기화 (생성 제한 용.)
        setTimeout(() => {
          this.isMonsterSpawnActive = false;

          const { wave, totalCount, aliveCount, endTimer } = this.monsterStorage.getInfo(this.gameId);

          // 웨이브(레벨) 증가.
          if (totalCount % WAVE_CYCLE === 0 && totalCount !== 0) {
            this.monsterStorage.updateInfo(this.gameId, { wave: wave + 1 });
          }
          
          // 엔드 타이머 갱신
          if(aliveCount > MONSTER_COUNTDOWN) {
            this.monsterStorage.updateInfo(this.gameId, { endTimer: endTimer - 1 });

            roomInfoUpdate(
              this.gameId,
              this.monsterStorage.getInfo(this.gameId).score,
              this.monsterStorage.getInfo(this.gameId).aliveCount,
              this.monsterStorage.getInfo(this.gameId).endTimer
            );
          } else {
            const endTimer = roomGameOverTimerSetting(this.gameId);
            this.monsterStorage.updateInfo(this.gameId, { endTimer: endTimer });
          }
        }, MONSTER_SPAWN_CYCLE);
      }
    }, MONSTER_SPAWN_CYCLE);
  }

  // 생존몬스터 업데이트
  monsterAliveCountUpdate() {
    this.socket.on(this.gameId, (data) => {
      if (data.message.eventName === "monsterAliveCountUpdate") {
        this.monsterStorage.updateInfo(this.gameId, { aliveCount:  data.message.aliveCount });      
      } 
    });
  }


  //====[서버 <-> 클라 연결 체크]====//
  sendRespawnPing() {
    this.socket.on(this.gameId, (data) => {
      if (data.message.eventName === "respawnPong") {
        // 클라이언트 응답 받으면 카운트 리셋
        this.monsterStorage.updateInfo(this.gameId, {
          pingPong: this.pingPongCount,
        });
      }
    });

    const interval = setInterval(() => {
      let pingPong = this.monsterStorage.getInfo(this.gameId).pingPong;
      this.io.emit(this.gameId, {
        message: {
          eventName: "respawnPing",
          info: this.monsterStorage.getInfo(this.gameId),
        },
      }); // 클라이언트에게 ping 전송

      if (pingPong > 0) {
        pingPong--; // 응답 대기 중이면 카운트 감소
        this.monsterStorage.updateInfo(this.gameId, { pingPong: pingPong });
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
    this.monsterStorage.removeInfo(this.gameId);
    this.monsterStorage.removeMonsters(this.gameId);

    const roomSize = Object.keys(this.monsterStorage.test()).length;
    console.log(
      `[${this.gameId}]번 방 리스폰을 종료합니다. (rooms : [${roomSize}])`,
    );
  }


  //====[몬스터 체력 업데이트]====//
  updateMonsterHealth(monsterUuid, data) {
    let monster = this.monsterStorage.getMonster(this.gameId, monsterUuid);

    // 몬스터 유효성 검사.
    if (!monster || Object.keys(monster).length === 0) return;

    // 몬스터정보 업데이트
    this.monsterStorage.updateMonster(this.gameId, monsterUuid, {
      stat: {
        health: monster.stat.health - data,
        speed: monster.stat.speed,
      },
    });

    // 업데이트를 갱신.
    monster = this.monsterStorage.getMonster(this.gameId, monsterUuid);

    // 몬스터 채력 클라에 보내기.
    this.io.emit(this.gameId, {
      message: {
        eventName: "monsterDamaged",
        monster: monster,
      },
    }); // 클라이언트에게 ping 전송

    // 삭제 검사.
    this.removeMonster(monster);
  }

  //====[몬스터 삭제]====//
  removeMonster(monster) {
    if (monster.stat.health <= 0) {
      const monsterScore = monster.score;
      const monstergoid = monster.gold;

      // 싱글이면 상관없지만 멀티 모드일때 다른유저에게 삭제요청.
      this.io.emit(this.gameId, {
        message: {
          eventName: "deleteMonster",
          monster: monster,
        },
      }); // 클라이언트에게 ping 전송

      // 몬스터 삭제.
      this.monsterStorage.removeMonster(this.gameId, monster.uuid);

      // 정보 수정.
      const { kills, score, gold, wave, eliteBossUuid } =
        this.monsterStorage.getInfo(this.gameId);
      const aliveCount = Object.keys(
        this.monsterStorage.getMonsters(this.gameId),
      ).length;

      // 정보 업데이트.
      this.monsterStorage.updateInfo(this.gameId, {
        aliveCount: aliveCount,
        kills: kills + 1,
        score: score + monsterScore * wave,
        gold: gold + monstergoid * wave,
      });

      // 정보를 게임룸에 전송.
      roomInfoUpdate(
        this.gameId,
        this.monsterStorage.getInfo(this.gameId).score,
        this.monsterStorage.getInfo(this.gameId).aliveCount,
        this.monsterStorage.getInfo(this.gameId).endTimer
      );

      // 정보 클라에 전송.
      this.io.emit(this.gameId, {
        message: {
          eventName: "monsterInfoMessage",
          info: this.monsterStorage.getInfo(this.gameId),
        },
      });

      if (eliteBossUuid === monster.uuid) {
        this.monsterStorage.updateInfo(this.gameId, {
          eliteBossUuid: "",
        });

        // 콘솔로그
        console.log(`[${this.gameId}]번방 앨리트 몬스터가 제거되었습니다.`);
      } 
    }
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60); // 분 계산
    const secs = seconds % 60; // 초 계산
    return `${minutes < 10 ? "0" : ""}${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }
}
