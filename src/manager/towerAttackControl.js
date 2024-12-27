import { getrooms } from "../models/rooms.model.js";
import towerModel from "../models/tower.model";

//0,0 좌표의 타워
const tower0Position = [200, 200];
// 타워끼리의 거리
const towersGapX = 200;
const towersGapY = 200;
// 블럭과의 거리
const blockGap = 200;

export const towerAttackCondtorl = (deltaTime) => {
  const rooms = getrooms();
  for (let roomsIndex = 0; roomsIndex < rooms.length; roomsIndex++) {
    if (rooms.monsterCount > 0) {
      let allUsersTowers = [];
      allUsersTowers.push(
        ...towerModel.getUsersTowers(rooms[roomsIndex].userId1)
      );
      if (rooms[roomsIndex].userId2 != null)
        allUsersTowers.push(
          ...towerModel.getUsersTowers(rooms[roomsIndex].userId2)
        );
      for (
        let allUsersTowersIndex = 0;
        allUsersTowersIndex < allUsersTowers.length;
        allUsersTowersIndex++
      ) {
        //타워 현재 스탯을 가져온다.
        const tmpTower = towerModel.currentTowerStat(
          allUsersTowers[allUsersTowersIndex].userid,
          allUsersTowers[allUsersTowersIndex].X,
          allUsersTowers[allUsersTowersIndex].Y
        );
        //타워 쿨다운 확인인
        if (
          towerModel.towerCoolDown(
            allUsersTowers[allUsersTowersIndex],
            tmpTower.cooldown,
            deltaTime
          )
        ) {
            //타워 위치 계산
          const tmpTowerPositionX =
            tower0Position[0] +
            allUsersTowers[allUsersTowersIndex].X * towersGapX +
            (allUsersTowers[allUsersTowersIndex].X > 1 ? blockGap : 0);
          const tmpTowerPositionY =
            tower0Position[1] +
            allUsersTowers[allUsersTowersIndex].Y * towersGapY;

          //
          const monsters = []; ///몬스터들을 받아오는 내용
          //

          for (
            let monstersIndex = 0;
            monstersIndex < monsters.length;
            monstersIndex++
          ) {
            if (
              distanceCheck(
                tmpTowerPositionX,
                tmpTowerPositionY,
                monsters[monstersIndex].X,
                monsters[monstersIndex].Y
              ) < tmpTower.range
            ) {
              //공격회수 차감
              tmpTower.target--;
              //범위공격 타워
              if (tmpTower.type == 2) {
                for (let i = 0; i < monsters.length; i++) {
                  if (
                    distanceCheck(
                      monsters[monstersIndex].X,
                      monsters[monstersIndex].Y,
                      monsters[i].X,
                      monsters[i].Y
                    ) < 30
                  ) {
                    //데미지 함수
                  }
                }
              } //단일공격 타워를 디폴트로
              else {
                //데미지 함수
              }
            }
            if (tmpTower.target <= 0) break;
          }
        }
      }
    }
  }
};

function distanceCheck(objectAX, objectAY, objectBX, objectBY) {
  return (distance = Math.sqrt(
    Math.pow(objectAX - objectBX, 2) + Math.pow(objectAY - objectBY, 2)
  ));
}
