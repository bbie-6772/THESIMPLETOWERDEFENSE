import { enterRoom, loadRoom } from "./lobby.handler.js";


const handlerMappings = {
    1001: enterRoom,
    1002: loadRoom
};

export default handlerMappings;
