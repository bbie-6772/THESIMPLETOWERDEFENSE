import { enterRoom, loadRoom, exitRoom, kickUser } from "./lobby.handler.js";
import { placeTower } from "./towerPlacement.handler.js";
import { TowerMerge, TowerUpgrade, TowerSell } from "./tower.merge.handler.js";

const handlerMappings = {
    1001: enterRoom,
    1002: loadRoom,
    1003: exitRoom,
    1004: kickUser,
    4001: placeTower,
    3001: TowerMerge,
    3002: TowerUpgrade,
    3003: TowerSell,
};

export default handlerMappings;
