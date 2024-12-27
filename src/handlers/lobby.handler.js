import { addRoom, getRoom, getRooms, joinRoom } from "../models/gameRoom.model.js";


export const enterRoom = (userId, payload) => {
    
    //방 중복 참여 검증
    if (getRooms().some((e) => e.userId1 === userId || e.userId2 === userId)) return {
        status: "fail",
        message: "이미 참여 중인 방이 있습니다!"
    }

    // 방 참여일 시
    if (payload?.roomId) {
        // 방 참여 성공 여부 
        if(!joinRoom(payload.roomId,userId)) return {
            status: "fail",
            message: "방에 참여할 수 없습니다"
        }
    }
    // 방 생성 시 성공 여부
    else if (!addRoom(userId, payload.gameName, payload.password, payload.type)) return {
        status: "fail", 
        message: "방 생성에 실패하였습니다."
    }
    
    return { status: "success", room: getRoom(userId) }
};

export const loadRoom = () => {
    return { status: "success", rooms: getRooms() }
}