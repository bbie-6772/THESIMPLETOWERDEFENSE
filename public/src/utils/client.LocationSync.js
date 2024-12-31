import Monsters from "../model/monsterSpawner.js";

// 위치 동기화 함수
export function updateLocationSync(monsters) {
    monsters.forEach((monster) => {
        console.log(`[LocationSync] 몬스터 UUID: ${monster.uuid} x: ${monster.x}, y: ${monster.y}`);

        // x, y 값이 null일 때 예외 처리
        if (monster.x === null || monster.y === null) {
            console.warn(`[LocationSync/Warning] Monster with UUID ${monster.uuid} has invalid position: x: ${monster.x}, y: ${monster.y}`);
            return;
        }

        // 위치 업데이트 로직
        const targetMonster = Monsters.getInstance().getMonsters().find(m => m.uuid === monster.uuid);
        if (targetMonster) {
            targetMonster.x = monster.x;
            targetMonster.y = monster.y;
            targetMonster.targetX = monster.targetX;
            targetMonster.targetY = monster.targetY;
            targetMonster.curIndex = monster.curIndex;
            console.log(`[LocationSync] 업데이트:  ${targetMonster.x}, ${targetMonster.y}, , ${targetMonster.targetX}, , ${targetMonster.targetY}, , ${targetMonster.curIndex}`);
        } else {
            console.log(`[LocationSync] 몬스터 UUID ${monster.uuid}을(를) 찾을 수 없습니다.`);
        }
    });
}