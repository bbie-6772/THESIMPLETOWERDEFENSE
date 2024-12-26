import { getGameAssets } from "../init/assets.js";

const towers = [];

const tier_scale_damage = 1;
const tier_scale_target = 1;
const tier_scale_range = 1;
const tier_scale_cost = 1;
const tier_scale_cooldown = 1;


//타워 추가
export const addTower = (userId, X, Y, towerId, tier) => {
  const gameAssetsTowers = getGameAssets().towers;

  let currentTower = gameAssetsTowers.data.find((Element) => {
    return Element.id == tower.towerId;
  });

  const user = towers.find((Element) => {
    return Element.userId === userId;
  });
  //유저 없을경우 추가
  if (!user) {
    towers.push({
      userId,
      data: [{ X, Y, towerId, tier, cooldown: currentTower.cooldown }],
    });
  } else {
    //중복된 위치 삭제
    removeUsersTower(userId, X, Y);
    user.data.push({ X, Y, towerId, tier, cooldown: currentTower.cooldown });
  }
};

// 전체 타워 조회
export const getTowers = () => {
  return towers;
};

// 유저 타워 조회
export const getUsersTowers = (userId) => {
  return towers.find((Element) => {
    return Element.userId === userId;
  }).data;
};

// 단일 타워 조회
export const getUsersTower = (userId, X, Y) => {
  return getUsersTowers(userId).find((Element) => {
    return Element.X == X && Element.Y == Y;
  });
};

// 배열에서 유저 삭제
export const removeUser = (userId) => {
  let indexofuser = towers.findIndex((Element) => {
    return Element.userId === userId;
  });
  if (indexofuser < 0) return false;
  towers.splice(indexofuser, 1);
  return true;
};

// 배열에서 타워 삭제
export const removeUsersTower = (userId, X, Y) => {
  let userstowers = getUsersTowers(userId);
  const indexoftower = userstowers.findIndex((Element) => {
    return Element.X == X && Element.Y == Y;
  });
  if (indexoftower < 0) return false;
  userstowers.splice(indexoftower, 1);
  return true;
};

//타워 스탯 확인인
export const currentTowerStat = (userId, X, Y) => {
  const gameAssetsTowers = getGameAssets().towers;

  let tower = getUsersTower(userId, X, Y);
  if (tower === null || tower === undefined) return false;

  let currentTower = gameAssetsTowers.data.find((Element) => {
    return Element.id == tower.towerId;
  });

  currentTower.damage += tower.tier * tier_scale_damage;
  currentTower.target += tower.tier * tier_scale_target;
  currentTower.range += tower.tier * tier_scale_range;
  currentTower.cost += tower.tier * tier_scale_cost;
  currentTower.cooldown -= tower.tier * tier_scale_cooldown;

  return currentTower;
};

export const towerCoolDown = (tower, cooldown, deltaTime) => {
  tower.cooldown -= deltaTime;
  if (tower.cooldown < 0) {
    tower.id += cooldown;
    return true;
  }
  return false;
};

export const merge = (userId, one, other) => {
  towerModel.getTower(one, other);
}

export const upgrade = (towerId) => {

}

const towerModel = {
  addTower,
  getTowers,
  getUsersTowers,
  getUsersTower,
  removeUser,
  removeUsersTower,
  currentTowerStat,
  towerCoolDown,
};

export default towerModel;
