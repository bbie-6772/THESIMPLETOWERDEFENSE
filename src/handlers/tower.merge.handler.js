import { getGameAssets } from "../init/assets.js";
import { getRoom } from "../models/gameRoom.model.js";
import towerModel from "../models/tower.model.js";
import { getUser, setUserGold } from "../models/users.model.js";
import { getio } from "./register.handler.js";

// 타워 합성 핸들러, handlerID : 3001
export const TowerMerge = (uuid, payload) => {
    const { x1, y1, x2, y2 } = payload;
    // console.log(`tower.merge.handler.js:9 - ${uuid}`);
    // 검증
    // uuid가 유효한지 검사 (uuid가 존재하는지)
    const room = getRoom(uuid);
    if (!room) return { status: 'fail', message: '유저를 찾을 수 없습니다' };
    // 타워가 유효한지 검사 (타워가 존재하는지)
    const one = towerModel.getUsersTower(uuid, x1, y1);
    const other = towerModel.getUsersTower(uuid, x2, y2);
    if (!one || !other) return { status: 'fail', message: '타워를 찾을 수 없습니다' };
    // 합성이 유효한지 검사 (타워 티어가 같은지, 타워가 최고티어가 아닌지)
    if (one.uuid !== other.uuid) return {status: 'fail', message: '자신의 타워를 선택해야합니다'}
    if (one === other) return { status: 'fail', message: '서로 다른 타워를 선택해야합니다' };
    if (one.towerId !== other.towerId) return { status: 'fail', message: '같은 타입의 타워를 선택해야합니다' };
    if (one.tier !== other.tier) return { status: 'fail', message: '타워의 티어가 서로 다릅니다' };
    if (one.tier === towerModel.max_tier) return { status: 'fail', message: '타워가 최대 티어입니다' };
    // { uuid, type, tier, x, y }
    return { ...towerModel.merge(uuid, x1, y1, x2, y2), roomcast: true };
}

// 타워 강화 핸들러, handlerID : 3002
export const TowerUpgrade = (uuid, payload) => {
    const towerId = payload;

    // 검증
    // uuid가 유효한지 검사 (uuid가 존재하는지)
    const room = getRoom(uuid);
    if (!room) return { status: 'fail', message: '유저를 찾을 수 없습니다' };

    // 검증하기 위한 데이터
    const user = getUser(uuid);
    const upgrades = getGameAssets().upgrades.data;
    if (!user.upgrades[towerId]) {
        user.upgrades[towerId] = 0;
    }
    const currentLevel = user.upgrades[towerId];

    // 타워 업그레이드가 최대 레벨인지 검증
    if (currentLevel === towerModel.max_upgrade) return { status: 'fail', message: '타워 업그레이드가 최대 레벨입니다' };
    // 골드가 충분한지 검증
    if (user.gold < upgrades[currentLevel]) return { status: "fail", message: "lack of money." };

    const remainGold = user.gold - upgrades[currentLevel];
    setUserGold(uuid, remainGold);
    
    const response = { ...towerModel.upgrade(uuid, towerId), remainGold };
    // console.log(response);
    return response;
}

// 타워 판매 핸들러, handlerID : 3003
export const TowerSell = (uuid, payload) => {
    const { x, y } = payload;

    // 검증
    // uuid가 유효한지 검사 (uuid가 존재하는지)
    const room = getRoom(uuid);
    if (!room) return { status: 'fail', message: '유저를 찾을 수 없습니다' };

    // 타워가 유효한지 검사 (타워가 존재하는지)
    const tower = towerModel.currentTowerStat(uuid, x, y);
    if (!tower) return { status: 'fail', message: '타워를 찾을 수 없습니다' };


    // 판매 시 보상 계산 70%
    const sellPrice = Math.floor(tower.cost * 0.7);

    // 타워 제거
    towerModel.removeUsersTower(uuid, x, y);

    // 유저에게 보상 추가
    const user = getUser(uuid);
    const newGold = user.gold + sellPrice;
    setUserGold(uuid, newGold); // UI 업데이트

    const io = getio();

    io.sockets.sockets
      .get(getUser(room.userId1).socketId)
      .emit("selltower", {
        x, y
      });
  
    if (room.userId2 != null) {
      io.sockets.sockets
        .get(getUser(room.userId2).socketId)
        .emit("selltower", {
            x, y
        });
    }
    return { status: 'success', message: '타워가 판매되었습니다.', newGold, x, y };
}