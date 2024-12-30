import { enterRoom, loadRoom } from "./lobby.handler.js";
import { placeTower } from "./towerPlacement.handler.js";

const handlerMappings = {
    1001: enterRoom,
    1002: loadRoom,
    4001: placeTower,
    2001: testInitGame,
};

export default handlerMappings;
