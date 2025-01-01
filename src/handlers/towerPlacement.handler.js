import { getGameAssets } from "../init/assets.js";
import { getRandomInt } from "../utils/randNumberGenerate.js";
import { getUser, setUserGold } from "../models/users.model.js";
import { addTower, getTowers, getUsersTower } from "../models/tower.model.js";
import { getRoom } from "../models/gameRoom.model.js";

//타워 설치 클라이언트에서 위치(x,y 그리드 위치) 랜덤 타워
export const placeTower = (userId, payload, socket) => {
  const { towers } = getGameAssets();
  const { X, Y } = payload;
  const user = getUser(userId);

  const getRandomTower = getRandomInt(0, towers.data.length);
  //
  try {
    //유저가 1번인지 2번인지 확인하는 내용.
    const room = getRoom(userId);
    if (room.userId2 !== null) {
      if (
        (room.userId1 == userId && X > 1) ||
        (room.userId2 == userId && X < 2)
      ) {
        return { status: "fail", message: "wrongPosition" };
      }
    }
    //배치할 위치 확인
    if (getUsersTower(userId, X, Y) !== undefined) {
      return { status: "fail", message: "already taken position." };
    }

    //유저 골드 확인
    if (user.gold < towers.data[getRandomTower].cost) {
      return { status: "fail", message: "lack of money." };
    }
    //데이터 적용
    const changedgold = user.gold - towers.data[getRandomTower].cost;
    addTower(userId, X, Y, towers.data[getRandomTower].id, 1);
    setUserGold(userId, changedgold);
    return {
      userId: userId,
      towerid: towers.data[getRandomTower].id,
      x: X,
      y: Y,
      gold: changedgold,
      tier: 1,
      roomcast: true,
    };
  } catch (err) {
    return { status: "fail", message: err.message };
  }
};
