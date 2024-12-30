import { enterRoom, loadRoom } from "./lobby.handler.js";
import { testInitGame } from "./location.handler.js";


const handlerMappings = {
    1001: enterRoom,
    1002: loadRoom,
    2001: testInitGame,
};

export default handlerMappings;
