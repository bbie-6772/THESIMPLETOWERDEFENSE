import { Server as SocketIO } from "socket.io";
import { getGameAssets } from "../init/assets.js";
import { v4 as uuidv4 } from "uuid";

import MonsterStorage  from "./monsterStorage.model.js";

export default class Monsters {
  // 생성자.
  constructor(socket) {
    this.socket = socket; // socket
    this.eventName = null; // 이벤트 네임 (멀티용)
    this.monsterStorage = MonsterStorage.getInstance(); // 인스턴스 연결

    this.x = 0;
    this.y = 0;
    this.isMonsterSpawnActive = false;
    this.spawnCount = 0;

    this.info = {
      totalCount: 0, // 총 몬스터 수
      aliveCount: 0, // 생존 중인 몬스터 수
      kills: 0, // 처치한 몬스터 수
      respawning: false, // 리스폰 중 여부
      wave: 0, // 현재 웨이브 (점수 계산용)
    };

    this.stagesAssets = getGameAssets; // 스테이지 에셋
    this.monstersAssets = getGameAssets; // 몬스터 에셋
  }

  // 싱글턴
  static getInstance = (socket) => {
    if (!Monsters.instance) {
      Monsters.instance = new Monsters(socket);
    }
    return Monsters.instance;
  };

  // 몬스터 생성.
  createMonster(io, count) {
    // 0. 리스폰이 아닌 경우에는 시작하면안됨.
    if (!this.info.respawning) {
      console.log("리스폰 중이 아닙니다.");
      return;
    }

    // 1. 이벤트 네임은 반드시 존재해야합니다.
    if (this.eventName === null) {
      console.log("이벤트 네임을 지정해주세요.");
      return;
    }

    // 2. 스폰 카운터가 0이라면 스폰 카운터를 갱신합니다.
    if (this.spawnCount === 0) {
      this.spawnCount = count;
    }

    const spawnInterval = setInterval(() => {
      // 4. 몬스터 생성이 활성화 됬는지 체크.
      if (!this.isMonsterSpawnActive) {
        // 5. 스폰 카운터가 0 이거나 리스폰이 중지 된다면 종료한다.
        if (this.spawnCount <= 0 || !this.info.respawning) {
          clearInterval(spawnInterval);
          console.log("리스폰을 종료합니다!");
          return;
        }

        // 6. 몬스터 생성을 활성화 합니다.
        this.isMonsterSpawnActive = true;

        // 7. 몬스터의 고유 uuid 생성
        const uuid = uuidv4(); // 몬스터 마다 uuid 생성.

        // 7- 1. 몬스터 랜덤 지정 (json 파일에 저장 되어있는 정보를 가져온다).
        const monsterList = this.monstersAssets().monsters.data;
        const monsterListLengtht = Object.keys(monsterList).length;
        const randomIdex = Math.floor(Math.random() * monsterListLengtht);


        // 7- 2. 맵 웨어포인트 지정
        // 추가해야함.


        // 8. 클라에 보낼 메세지를 만든다. (임시!!!!!)
        const monsterInfo = {
          gameId: this.eventName, // 게임 id
          name: monsterList[randomIdex].name, // 이름
          uuid: uuid, // uuid
          x: this.x, // 시작 포지션 x
          y: this.y, // 시작 포지션 y
          targetX: null, // 다음 웨어 포인트 x (웨어 포인트 정보를 가져와야함.)
          targetY: null, // 다음 웨어 포인트 y (웨어 포인트 정보를 가져와야함.)
          stat: {
            health: monsterList[randomIdex].health, // 체력
            speed: monsterList[randomIdex].speed, // 스피드
          },
        };

        // 9. 메세지를 보내자. (전체로) - 수정 해야함!!
        io.emit(this.eventName, {
          message: {
            eventName: "spawnMonster",
            info: monsterInfo,
          },
        });

        // // 10. 검증용 데이터 베열에 담기
        this.monsterStorage.addMonster(this.eventName, uuid, monsterInfo);

        // // 11. 카운터 변경.
        this.spawnCount--; // 스폰 카운터 (조건용.)
        this.info.totalCount += 1; // 토탈 카운터 (표시용.)

        // 12. 일정 시간 후 메시지 전송 상태를 다시 초기화 (생성 제한 용.)
        setTimeout(() => {
          this.isMonsterSpawnActive = false;

          // // 정보 업데이트
          this.monsterStorage.updateInfo(this.eventName, {
          totalCount: this.info.totalCount,
          });
        }, 1000); // 1초마다 한번만 메시지 전송
      }
    }, 1000); // 1000ms = 1초
  }

  // 초기화.
  monstersInitialization(data) {
    this.eventName = data.message.gameId;
    this.spawnCount = 0;
    this.x = data.message.x;
    this.t = data.message.y;
    this.info.totalCount = 0;
    this.info.aliveCount = 0;
    this.info.kills = 0;
    this.info.respawning = true;
    this.info.wave = 1;

    // 정보 데이터 생성.
    this.monsterStorage.addInfo(this.eventName, this.info);
  }

  // (Set) 몬스터 체력 수정.
  setMonsterHealth = (io, index, data) => {
    let monster = this.monsterStorage.getMonster(this.eventName, index)

    // 몬스터 유효성 검사.
    if (Object.keys(monster).length === 0) {
      console.log("해당 몬스터는 존재 하지않습니다.(피격) ");
      return;
    }

    // 몬스터 체력 업데이트
    this.monsterStorage.updateMonster(this.eventName, index, {
      stat: {
        health: monster.stat.health - data,
        speed: monster.stat.speed,
      },
    });

    // 삭제
    this.removeMonster(io, index, monster);
  };

  // 몬스터 삭제.
  removeMonster = (io,uuid, monster) => {
    // 몬스터의 체력이 0이라면?
    if (monster.stat.health <= 0) {
      
      // 정보 업데이트, 
      this.info.kills += 1;
      this.info.aliveCount =  Object.keys(this.monsterStorage.getMonsters(this.eventName)).length;

      this.monsterStorage.updateInfo(this.eventName, {
        kills: this.info.kills,
        aliveCount: this.info.aliveCount
      });

      // 삭제. - 수정해야함! 
      io.emit(this.eventName, {
        message : {
          eventName : "monsterRemove",
          index : monster.uuid,
        }
      });
    }
  };
}
