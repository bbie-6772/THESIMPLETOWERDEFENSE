import { addRoom, getRoom, getRooms } from "../models/gameRoom.model.js";


export const makeRoom = (userId, payload) => {

    if (!addRoom(userId, payload.gameName, payload.password, payload.type)) return {
            status: "fail", 
            message: "방 생성에 실패하였습니다."
        }
    
    return { status: "success" }
};

export const loadRoom = () => {
    return { status: "success", rooms: getRooms() }
}