//====================================================================================================================
//====================================================================================================================
// src/manager/gameSimulator.js
// 게임 시뮬레이션 돌리는 서버 마스터 코드
// 로직 부분에 대해서 클라이언트와 동일해야 한다
//====================================================================================================================
//====================================================================================================================

// #region variables
// *** 클라이언트와 동일해야 한다.
const NUM_OF_MONSTERS = 5; // 몬스터 개수
let userGold = 0; // 유저 골드
let base; // 기지 객체
let baseHp = 0; // 기지 체력
let towerCost = 0; // 타워 구입 비용
let numOfInitialTowers = 3; // 초기 타워 개수
let monsterLevel = 0; // 몬스터 레벨
let monsterSpawnInterval = 1000; // 몬스터 생성 주기
const monsters = [];
const towers = [];
let score = 0; // 게임 점수
let highScore = 0; // 기존 최고 점수

let monsterPath;
// #endregion


// #region Game Logic Part
// =======================================================================================================================================
const generatePath = () => {
    const path = [];
    // 캔버스 위치로 snapping 현재 canvas width="1920" height="1080" 고려, 임시로 하드코딩 >> 추후 config로 설정값 관리 리팩토링 필요
    const basePoint = { x: 100, y: 100 };
    const incremWidth = (1920 * (8 / 10)) / 2;
    const incremHeight = 1080 * (8 / 10);
    // 순차적으로 가야하는 sequnece
    const simplifiedSequence = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 2, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0, y: 0 },
    ];
    const processedSequence = simplifiedSequence.map(point => ({
        x: basePoint.x + point.x * incremWidth,
        y: basePoint.y + point.y * incremHeight
    }));
    for (let point of processedSequence) {
        path.push(point);
        // 테스트 로그
        console.log("Sequence : ", JSON.stringify(point));
    }
    return path;
}

function getRandomPositionNearPath(maxDistance) {
    // 타워 배치를 위한 몬스터가 지나가는 경로 상에서 maxDistance 범위 내에서 랜덤한 위치를 반환하는 함수!
    const segmentIndex = Math.floor(Math.random() * (monsterPath.length - 1));
    const startX = monsterPath[segmentIndex].x;
    const startY = monsterPath[segmentIndex].y;
    const endX = monsterPath[segmentIndex + 1].x;
    const endY = monsterPath[segmentIndex + 1].y;

    const t = Math.random();
    const posX = startX + t * (endX - startX);
    const posY = startY + t * (endY - startY);

    const offsetX = (Math.random() - 0.5) * 2 * maxDistance;
    const offsetY = (Math.random() - 0.5) * 2 * maxDistance;

    return {
        x: posX + offsetX,
        y: posY + offsetY,
    };
}

function placeInitialTowers() {
    /* 
      타워를 초기에 배치하는 함수입니다.
      무언가 빠진 코드가 있는 것 같지 않나요? 
    */
    for (let i = 0; i < numOfInitialTowers; i++) {
        const { x, y } = getRandomPositionNearPath(200);
        const tower = new Tower(x, y, towerCost);
        towers.push(tower);
    }
}

function placeNewTower() {
    /* 
      타워를 구입할 수 있는 자원이 있을 때 타워 구입 후 랜덤 배치하면 됩니다.
      빠진 코드들을 채워넣어주세요! 
    */
    const { x, y } = getRandomPositionNearPath(200);
    const tower = new Tower(x, y);
    towers.push(tower);
}

function placeBase() {
    const lastPoint = monsterPath[monsterPath.length - 1];
    base = new Base(lastPoint.x, lastPoint.y, baseHp);
}

function spawnMonster() {
    monsters.push(new Monster(monsterPath, monsterLevel));
}
// =======================================================================================================================================
// #endregion

//#region socket
let io;
//#endregion

function gameLoop() {
    // #region gameLoop Logic
    // 타워 몬스터 공격 처리
    towers.forEach((tower) => {
        tower.updateCooldown();
        monsters.forEach((monster) => {
            const distance = Math.sqrt(
                Math.pow(tower.x - monster.x, 2) + Math.pow(tower.y - monster.y, 2)
            );
            if (distance < tower.range) {
                tower.attack(monster);
            }
        });
    });
    // 몬스터 로직 : 이동 갱신
    for (let i = monsters.length - 1; i >= 0; i--) {
        const monster = monsters[i];
        if (monster.hp > 0) {
            const isDestroyed = monster.move(base);
            // 패킷 쏴주기
            io.emit('monsterMove', { monsterId: i, x: monster.x, y: monster.y });
            console.log("monsterMove: ", { monsterId: i, x: monster.x, y: monster.y });
            if (isDestroyed) {
                /* 게임 오버 */
                // 게임 종료 시나리오
                //location.reload();
            }
        } else {
            /* 몬스터가 죽었을 때 */
            monsters.splice(i, 1);
        }
    }
    // #endregion
    // 100fps 실행
    setTimeout(gameLoop, 100);
}


export function initGame(socketIO) {
    io = socketIO;
    // #region initGame Logic
    // 몬스터 경로 생성
    monsterPath = generatePath();
    // 설정된 초기 타워 개수만큼 사전에 타워 배치
    placeInitialTowers();
    // 기지 배치
    placeBase();
    // 설정된 몬스터 생성 주기마다 몬스터 생성
    // setInterval(spawnMonster, monsterSpawnInterval);
    // 설정된 몬스터 생성 주기마다 몬스터 생성, 최대 3마리까지만 생성 
    let monsterSpawnCount = 0; // 몬스터 생성 횟수 초기화
    const monsterSpawnIntervalId = setInterval(() => {
        if (monsterSpawnCount < 2) { spawnMonster(); monsterSpawnCount++; }
        else {
            clearInterval(monsterSpawnIntervalId);
        }
    }, monsterSpawnInterval);
    // 게임 루프 최초 실행
    gameLoop();
    // #endregion
}
// initGame();



//#region model base
export class Base {
    constructor(x, y, maxHp) {
        // 생성자 안에서 기지의 속성을 정의한다고 생각하시면 됩니다!
        this.x = x; // 기지 이미지 x 좌표
        this.y = y; // 기지 이미지 y 좌표
        this.width = 170; // 기지 이미지 가로 길이 (이미지 파일 길이에 따라 변경 필요하며 세로 길이와 비율을 맞춰주셔야 합니다!)
        this.height = 225; // 기지 이미지 세로 길이
        this.hp = maxHp; // 기지의 현재 HP
        this.maxHp = maxHp; // 기지의 최대 HP
    }
    takeDamage(amount) {
        // 기지가 데미지를 입는 메소드입니다.
        // 몬스터가 기지의 HP를 감소시키고, HP가 0 이하가 되면 게임 오버 처리를 해요!
        this.hp -= amount;
        return this.hp <= 0; // 기지의 HP가 0 이하이면 true, 아니면 false
    }
}
//#endregion


//#region model tower
export class Tower {
    constructor(x, y, cost) {
        // 생성자 안에서 타워들의 속성을 정의한다고 생각하시면 됩니다!
        this.x = x; // 타워 이미지 x 좌표
        this.y = y; // 타워 이미지 y 좌표
        this.width = 78; // 타워 이미지 가로 길이 (이미지 파일 길이에 따라 변경 필요하며 세로 길이와 비율을 맞춰주셔야 합니다!)
        this.height = 150; // 타워 이미지 세로 길이
        this.attackPower = 40; // 타워 공격력
        this.range = 300; // 타워 사거리
        this.cost = cost; // 타워 구입 비용
        this.cooldown = 0; // 타워 공격 쿨타임
        this.beamDuration = 0; // 타워 광선 지속 시간
        this.target = null; // 타워 광선의 목표
        towers.push(this);
    }

    attack(monster) {
        // 타워가 타워 사정거리 내에 있는 몬스터를 공격하는 메소드이며 사정거리에 닿는지 여부는 game.js에서 확인합니다.
        if (this.cooldown <= 0) {
            monster.hp -= this.attackPower;
            this.cooldown = 180; // 3초 쿨타임 (초당 60프레임)
            this.beamDuration = 30; // 광선 지속 시간 (0.5초)
            this.target = monster; // 광선의 목표 설정
        }
    }

    updateCooldown() {
        if (this.cooldown > 0) {
            this.cooldown--;
        }
    }
}

export const GetTowerFromCoordinate = (x, y) => {
    return towers.find((e) => {
        return (e.x > x - e.width && e.x < x && e.y > y - e.height && e.y < y);
    })
};
//#endregion

// #region model Monster

export class Monster {
    constructor(path, level) {
        // 생성자 안에서 몬스터의 속성을 정의한다고 생각하시면 됩니다!
        if (!path || path.length <= 0) {
            throw new Error("몬스터가 이동할 경로가 필요합니다.");
        }

        this.monsterNumber = Math.floor(Math.random() * 4); // 몬스터 번호 (1 ~ 5. 몬스터를 추가해도 숫자가 자동으로 매겨집니다!)
        this.path = path; // 몬스터가 이동할 경로
        this.currentIndex = 0; // 몬스터가 이동 중인 경로의 인덱스
        this.x = path[0].x; // 몬스터의 x 좌표 (최초 위치는 경로의 첫 번째 지점)
        this.y = path[0].y; // 몬스터의 y 좌표 (최초 위치는 경로의 첫 번째 지점)
        this.width = 80; // 몬스터 이미지 가로 길이
        this.height = 80; // 몬스터 이미지 세로 길이
        this.speed = 10; // 몬스터의 이동 속도
        // this.image = monsterImages[this.monsterNumber]; // 몬스터 이미지
        this.level = level; // 몬스터 레벨
        this.init(level);
    }

    init(level) {
        this.maxHp = 100 + 10 * level; // 몬스터의 현재 HP
        this.hp = this.maxHp; // 몬스터의 현재 HP
        this.attackPower = 10 + 1 * level; // 몬스터의 공격력 (기지에 가해지는 데미지)
    }

    move(base) {
        if (this.currentIndex < this.path.length - 1) {
            const nextPoint = this.path[this.currentIndex + 1];
            const deltaX = nextPoint.x - this.x;
            const deltaY = nextPoint.y - this.y;
            // 2차원 좌표계에서 두 점 사이의 거리를 구할 땐 피타고라스 정리를 활용하면 됩니다! a^2 = b^2 + c^2니까 루트를 씌워주면 되죠!
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance < this.speed) {
                // 거리가 속도보다 작으면 다음 지점으로 이동시켜주면 됩니다!
                this.currentIndex++;
            } else {
                // 거리가 속도보다 크면 일정한 비율로 이동하면 됩니다. 이 때, 단위 벡터와 속도를 곱해줘야 해요!
                this.x += (deltaX / distance) * this.speed; // 단위 벡터: deltaX / distance
                this.y += (deltaY / distance) * this.speed; // 단위 벡터: deltaY / distance
            }
            return false;
        } else {
            const isDestroyed = base.takeDamage(this.attackPower); // 기지에 도달하면 기지에 데미지를 입힙니다!
            this.hp = 0; // 몬스터는 이제 기지를 공격했으므로 자연스럽게 소멸해야 합니다.
            return isDestroyed;
        }
    }
}


// #endregion
