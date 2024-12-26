import { addRoom, getRoom } from "../models/gameRoom.js";


export const makeRoom = (userId, payload) => {
    // 초 단위로 게임 오버 시간

    addRoom(userId, payload.gameName, payload.password, payload.type)
    
    return getRoom(userId)
};