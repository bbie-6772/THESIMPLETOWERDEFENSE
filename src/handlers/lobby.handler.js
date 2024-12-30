import { addRoom, getRoom, getRooms, joinRoom, leaveRoom } from "../models/gameRoom.model.js";

export const enterRoom = (userId, payload, socket) => {

    //방 중복 참여 검증 + 참여한 방 재참가인지 확인
    if (getRooms().some((e) => (e.userId1 === userId || e.userId2 === userId) && e.gameId !== payload?.roomId )) return {
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
    // 방 생성 시 성공 여부
    } else if (!addRoom(userId, payload.gameName, payload.password, payload.type, socket)) return {
        status: "fail", 
        message: "방 생성에 실패하였습니다."
    }
    
    let room = getRoom(userId)

    socket.to(room.gameId).emit('room', { room })

    socket.join(room.gameId)

    return { status: "success", room: room }
};

export const exitRoom = (userId, payload, socket, io) => {
    const room = leaveRoom(payload.roomId, userId)
    console.log(room)
    if (room) {
        // 업뎃 정보 공유
        socket.to(payload.roomId).emit('room', { room })
        // 참가자가 나갔을 시 참가자만 제외
        socket.leave(payload.roomId)
    // 호스트가 나갈 시 인원 전부 삭제하도록 요구
    } else io.to(payload.roomId).emit('leaveRoom', { roomId: payload.roomId })

    return { status: "success" }
}

export const loadRoom = () => {
    // 값 변환
    const rooms = getRooms().map((e) => {
        return {
            gameId: e.gameId,
            gameName: e.gameName,
            userId1: e.userId1,
            userId2: e.userId2,
            startTime: e.startTime,
            difficult: e.difficult,
            password: e.password ? true : false
        }
    })

    return { status: "success", rooms }
}
