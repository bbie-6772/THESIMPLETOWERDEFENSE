import { enterRoom, loadRoom, exitRoom } from "./lobby.handler.js";
import { placeTower } from "./towerPlacement.handler.js";
import { TowerMerge, TowerUpgrade } from "./tower.merge.handler.js";

const handlerMappings = {
    1001: enterRoom,
    1002: loadRoom,
    1003: exitRoom,
    4001: placeTower,
    3001: TowerMerge,
    3002: TowerUpgrade,
};

export default handlerMappings;
