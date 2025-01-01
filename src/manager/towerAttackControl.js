import towerModel from "../models/tower.model.js";
import MonsterStorage from "../models/monsterStorage.model.js";
import { getRooms } from "../models/gameRoom.model.js";
import { getUser } from "../models/users.model.js";
import { GetTowerCoordinateFromGrid } from "../../public/src/model/tower.js";
//0,0 좌표의 타워
const tower0Position = [200, 200];
// 타워끼리의 거리
const towersGapX = 200;
const towersGapY = 200;
// 블럭과의 거리
const blockGap = 200;

let previousTime = 0;
let currentTime = 0;
let deltaTime = 0;

let isInit = false;
let monsterStorage = MonsterStorage.getInstance(); // MonsterStorage 인스턴스 연결
export const towerAttackCondtorl = (io, monstercycle) => {
  try{
  if (!isInit) {
    previousTime = Date.now();
    isInit = true;
  }
  currentTime = Date.now();
  deltaTime = currentTime - previousTime;
  previousTime = currentTime;

  const rooms = getRooms();
  for (let roomsIndex = 0; roomsIndex < rooms.length; roomsIndex++) {
    const monsters = monsterStorage.getMonsters(rooms[roomsIndex].gameId);
    if (Object.values(monsters).length > 0) {
      let allUsersTowers = [];
      let allUsersSockets = [];

      let user1towers = towerModel.getUsersTowers(rooms[roomsIndex].userId1);

      if (user1towers != undefined && user1towers.length > 0) {
        allUsersTowers.push(...user1towers);
      }

      allUsersSockets.push(
        io.sockets.sockets.get(getUser(rooms[roomsIndex].userId1).socketId)
      );
      if (rooms[roomsIndex].userId2 != null) {
        let user2towers = towerModel.getUsersTowers(rooms[roomsIndex].userId2);

        if (user2towers != undefined && user2towers.length > 0) {
          allUsersTowers.push(...user2towers);
        }

        allUsersSockets.push(
          io.sockets.sockets.get(getUser(rooms[roomsIndex].userId2).socketId)
        );
      }
      for (
        let allUsersTowersIndex = 0;
        allUsersTowersIndex < allUsersTowers.length;
        allUsersTowersIndex++
      ) {
        //타워 현재 스탯을 가져온다.
        const tmpTower = towerModel.currentTowerStat(
          allUsersTowersIndex < (user1towers ?? []).length
            ? rooms[roomsIndex].userId1
            : rooms[roomsIndex].userId2,
          allUsersTowers[allUsersTowersIndex].X,
          allUsersTowers[allUsersTowersIndex].Y
        );
        //타워 쿨다운 확인
        if (
          towerModel.towerCoolDown(
            allUsersTowers[allUsersTowersIndex],
            tmpTower.cooldown,
            deltaTime
          )
        ) {
          //타워 위치 계산
          const { xPosition, yPosition } = GetTowerCoordinateFromGrid(
            allUsersTowers[allUsersTowersIndex].X,
            allUsersTowers[allUsersTowersIndex].Y
          );
          const mosterkey = Object.keys(monsters);
          for (
            let monstersIndex = 0;
            monstersIndex < mosterkey.length;
            monstersIndex++
          ) {
            if (monsters[mosterkey[monstersIndex]] != undefined&&
              distanceCheck(
                xPosition,
                yPosition,
                monsters[mosterkey[monstersIndex]].x,
                monsters[mosterkey[monstersIndex]].y
              ) < tmpTower.range
            ) {
              //클라이언트에 전송
              allUsersSockets.forEach((Element) => {
                if(Element !== undefined && Element !== null)
                sendToClient(
                  Element,
                  tmpTower.type,
                  xPosition,
                  yPosition,
                  monsters[mosterkey[monstersIndex]].x,
                  monsters[mosterkey[monstersIndex]].y
                );
              });
              const tmpupgradeuser = getUser((user1towers ?? []).length
              ? rooms[roomsIndex].userId1
              : rooms[roomsIndex].userId2);
              const upgrade = (tmpupgradeuser.upgrades[tmpTower.type]??1) + 1;
              
              //공격회수 차감
              tmpTower.target--;
              //범위공격 타워
              if (tmpTower.type == 2) {
                for (let i = 0; i < mosterkey.length; i++) {
                  if (monsters[mosterkey[monstersIndex]] != undefined&&
                    monsters[mosterkey[i]] != undefined&&
                    distanceCheck(
                      monsters[mosterkey[monstersIndex]].x,
                      monsters[mosterkey[monstersIndex]].y,
                      monsters[mosterkey[i]].x,
                      monsters[mosterkey[i]].y
                    ) < 100
                  ) {
                    //데미지 함수
                    monstercycle.updateMonsterHealth(
                      monsters[mosterkey[i]].uuid,
                      tmpTower.damage +  (20* upgrade)
                    );
                  }
                }
              } //단일공격 타워를 디폴트로
              else {
                //데미지 함수
                monstercycle.updateMonsterHealth(
                  monsters[mosterkey[monstersIndex]].uuid,
                  tmpTower.damage +  (20* upgrade)
                );
              }
            }
            if (tmpTower.target <= 0) break;
          }
        }
      }
    }
  }

  }
  catch(err){
    console.log(err.message)
  }
};

function distanceCheck(objectAX, objectAY, objectBX, objectBY) {
  return Math.sqrt(
    Math.pow(objectAX - objectBX, 2) + Math.pow(objectAY - objectBY, 2)
  );
}

function sendToClient(
  socket,
  towertype,
  towerX,
  towerY,
  targetX,
  targetY,
  duration = 1000
) {
  socket.emit("attack", {
    type: towertype,
    tower: { towerX, towerY },
    target: { targetX, targetY },
    duration,
  });
}
