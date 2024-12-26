import { makeRoom, loadRoom } from "./lobby.handler.js";


const handlerMappings = {
    1001: makeRoom,
    1002: loadRoom
};

export default handlerMappings;
