import { enterRoom, loadRoom } from "./lobby.handler.js";
import { TowerMerge, TowerUpgrade } from "./tower.merge.handler.js";


const handlerMappings = {
    1001: enterRoom,
    1002: loadRoom,
    3001: TowerMerge,
    3002: TowerUpgrade,
};

export default handlerMappings;
