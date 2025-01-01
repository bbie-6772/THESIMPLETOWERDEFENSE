//====================================================================================================================
//====================================================================================================================
// LocationSyncManager.js
// 
// monsterStorage에서의 monster 기반으로 위치 동기화
// frame rate 단위 동기화
//====================================================================================================================
//====================================================================================================================

import { generatePath } from "../init/pathGenerator.js";
import MonsterStorage from "../models/monsterStorage.model.js";

export default class LocationSyncManager {
    static instance = null;
    // constructor
    constructor(io, socket) {
        if (!LocationSyncManager.instance) {
            this.io = io;
            this.socket = socket;
            // MonsterStorage 싱글턴 인스턴스와 연결
            this.monsterStorage = MonsterStorage.getInstance();
            this.interval = null;
            // 임시 하드코딩된 프레임레이트: 약 30fps
            this.syncRate = 1000 / 30;
            // 관리할 게임 id
            this.gameId = null;
            // 몬스터 경로 일단 갖기
            this.monsterPath = generatePath();
            // 인스턴스
            LocationSyncManager.instance = this;
        }
        return LocationSyncManager.instance;
    }
    // 초기화
    static initialize(io, socket) {
        if (!LocationSyncManager.instance) {
            new LocationSyncManager(io, socket);
        } else {
            LocationSyncManager.instance.io = io;
            LocationSyncManager.instance.socket = socket;
        }
        return LocationSyncManager.instance;
    }

    static getInstance() {
        if (!LocationSyncManager.instance) {
            throw new Error("[LSM/Error] LocationSyncManager has not been initialized.");
        }
        return LocationSyncManager.instance;
    }

    // 존재하는 몬스터들에 대해서 서버사이드 이동 갱신
    updateMonsterMovement(monstersCached) {
        Object.entries(monstersCached).forEach(([uuid, monster]) => {
            //#region 경직
            if (monster.isStunned) return;
            //#endregion

            //#region 둔화 슬로우
            const monsterSpeed = monster.stat.speed * (monster.isSlow ? 0.5 : 1);
            if (monster.isSlow)
                 console.log(">>> [monsterSpeed] : is slow" );
            //#endregion

            // 이동 로직 (간단한 랜덤 이동 예제)
            const diffx = monster.targetX - monster.x;
            const diffy = monster.targetY - monster.y;
            const dx = Math.sign(diffx) * Math.min(monsterSpeed, Math.abs(diffx));
            const dy = Math.sign(diffy) * Math.min(monsterSpeed, Math.abs(diffy));
            // 현재 위치 기반 새로운 위치
            const updatedX = monster.x + dx;
            const updatedY = monster.y + dy;

            // 목적지에 도달한 경우 처리=> 새로운 targetX, targetY
            const epsilon = 0.01;
            if (Math.abs(updatedX - monster.targetX) < epsilon && Math.abs(updatedY - monster.targetY) < epsilon) {
                // console.log(`[LSM/TEST] Monster ${uuid} reached its destination`);

                // 새로운 목적지 설정 (랜덤 좌표 예제)
                const newCurIndex = (monster.curIndex + 1) % this.monsterPath.length;
                const newTargetX = this.monsterPath[newCurIndex].x;
                const newTargetY = this.monsterPath[newCurIndex].y;

                // targetX와 targetY 갱신
                this.monsterStorage.updateMonster(this.gameId, uuid, {
                    x: updatedX,
                    y: updatedY,
                    targetX: newTargetX,
                    targetY: newTargetY,
                    curIndex: newCurIndex,
                });
            }
            else {
                this.monsterStorage.updateMonster(this.gameId, uuid, {
                    x: updatedX,
                    y: updatedY,
                });
            }
        });
    }

    // 동기화 작업 시작
    startSync(data) {
        // 테스트 로그
        // console.log("[LSM/TEST] data.gameId", data.message.gameId);
        // gameId 확인 및 검증
        this.gameId = data.message.gameId;
        if (!this.gameId) {
            console.error("[LSM/Invalid] gameId 유효하지 않음");
        }
        // 이미 실행 중인지 확인
        if (this.interval) {
            console.warn("[LSM/Already Running] 기존 동기화 중지");
            this.stopSync();
        }

        // 인터벌 시작
        this.interval = setInterval(() => {
            //#region 전체 로그 테스트
            // console.log("[LSM/TEST] this.monsterStorage.test();:  ", this.monsterStorage.test());
            //#endregion

            // 테스트 로그: 몬스터스토리지 유효한지
            if (!this.monsterStorage)
                console.warn("[LSM/Invalid] monsterstorage invalid");


            // monsters 변경될 수 있으니 다시 가져오기
            const monstersCached = this.monsterStorage.getMonsters(this.gameId);
            if (monstersCached == null)
                // console.log("[LSM/Empty] monstersCached null");

                // 비어있으면 동기화할 필요 없음
                if (!Object.keys(monstersCached).length) {
                    // console.log("[LSM/Empty] No monsters to sync.");
                    return;
                }

            // 몬스터 이동 로직을 통해 위치 업데이트
            this.updateMonsterMovement(monstersCached);


            // 이동 중인 몬스터 데이터를 추출
            const targetMonsters = Object.entries(monstersCached).reduce((acc, [uuid, monster]) => {
                if (monster.x !== monster.targetX || monster.y !== monster.targetY) {
                    acc.push({
                        uuid,
                        x: monster.x,
                        y: monster.y,
                        targetX: monster.targetX,
                        targetY: monster.targetY,
                        curIndex: monster.curIndex,
                    });
                }
                return acc;
            }, []);
            // 이동 중인 몬스터가 없으면 이벤트 전송 안 함
            if (!targetMonsters.length) {
                return;
            }

            this.io.to(this.gameId).emit('locationSync', {
                data: targetMonsters,
            });

        }, this.syncRate);
    }

    // 동기화 중단
    stopSync() {
        if (this.interval) {
            // console.log('[LSM] 동기화 중단.');
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}




/*
class Monster {
    constructor(path, level) {
        this.path = path;
        this.level = level;
        this.x = path[0].x;
        this.y = path[0].y;
        this.currentIndex = 0;
        this.speed = 2;
    }

    move() {
        if (this.currentIndex < this.path.length - 1) {
            const nextPoint = this.path[this.currentIndex + 1];
            const deltaX = nextPoint.x - this.x;
            const deltaY = nextPoint.y - this.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance < this.speed) {
                this.currentIndex++;
            } else {
                this.x += (deltaX / distance) * this.speed;
                this.y += (deltaY / distance) * this.speed;
            }
        }
    }

    getPosition() {
        return { x: this.x, y: this.y, currentIndex: this.currentIndex };
    }
}

server.on('connection', (socket) => {

    const interval = setInterval(() => {
        monster.move();
        socket.send(JSON.stringify({
            type: 'update',
            id: 1, // 몬스터 ID 예시
            position: monster.getPosition(),
            speed: monster.speed
        }));
    }, 1000 / 30);

    socket.on('close', () => {
        clearInterval(interval);
        console.log('클라이언트 연결이 종료되었습니다.');
    });
});


//


const socket = new WebSocket('ws://localhost:8080');

let monsters = [];

socket.onopen = () => {
    console.log('서버에 연결되었습니다.');
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'update') {
        const monsterId = data.id;
        const position = data.position;
        const speed = data.speed;

        const monster = monsters.find(m => m.id === monsterId);
        if (monster) {
            monster.update(position, speed);
        } else {
            const newMonster = new Monster(monsterId, position, speed);
            monsters.push(newMonster);
        }
    }
};


class Monster {
    constructor(id, position, speed) {
        this.id = id;
        this.x = position.x;
        this.y = position.y;
        this.currentIndex = position.currentIndex;
        this.speed = speed;
        this.path = [
            { x: 0, y: 0 },
            { x: 100, y: 100 },
            // 추가 경로 점들
        ];
    }

    update(position, speed) {
        this.x = position.x;
        this.y = position.y;
        this.currentIndex = position.currentIndex;
        this.speed = speed;
    }

    predictMove() {
        if (this.currentIndex < this.path.length - 1) {
            const nextPoint = this.path[this.currentIndex + 1];
            const deltaX = nextPoint.x - this.x;
            const deltaY = nextPoint.y - this.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance < this.speed) {
                this.currentIndex++;
            } else {
                this.x += (deltaX / distance) * this.speed;
                this.y += (deltaY / distance) * this.speed;
            }
        }
    }
}

// 게임 루프
const gameLoop = () => {
    monsters.forEach(monster => {
        monster.predictMove();
        updateMonsterPosition(monster.id, monster.x, monster.y);
    });
    requestAnimationFrame(gameLoop);
};

// 클라이언트 측 몬스터 위치 업데이트 함수
function updateMonsterPosition(id, x, y) {
    const monsterElement = document.getElementById(`monster-${id}`);
    if (monsterElement) {
        monsterElement.style.left = `${x}px`;
        monsterElement.style.top = `${y}px`;
    }
}

// 게임 루프 시작
requestAnimationFrame(gameLoop);    */
