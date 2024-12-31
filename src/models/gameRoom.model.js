import { v4 as uuidv4 } from "uuid";

let gameRooms = [];

export const addRoom = (userId, gameName, password, difficult) => {
    try {
        // 게임 방 고유 번호 생성
        const gameId = uuidv4()

        const timer = {
            1: 50,
            2: 30,
            3: 15,
            4: 5
        }

        const room = {
            gameId: gameId,
            gameName: gameName,
            userId1: userId,
            userId2: null,
            difficult: difficult,
            password: password,
            ready: false,
            score: 0,
            startTime: 0,
            monsterCount: 0,
            gameOverTimer: timer[difficult],
        }

        gameRooms.push(room)
        return true 
    } catch (err) {
        console.log(err)
        return false
    }

}

export const getRoom = (userId) => {
    return gameRooms.find((e) => e.userId1 === userId || e.userId2 === userId)
}

export const getRooms = () => {
    return gameRooms
}

export const joinRoom = (gameId, userId) => {
    const roomIdx = gameRooms.findIndex((e) => e.gameId === gameId)
    // 방이 서버에 있는 확인
    if (roomIdx === -1) return false     
    // 원래 방에 있던 인원인지 확인
    if (gameRooms[roomIdx].userId1 === userId || gameRooms[roomIdx].userId2 === userId) return true
    // 아닐 경우 참여
    else gameRooms[roomIdx].userId2 = userId
    return true
}

export const leaveRoom = (gameId, userId) => {
    const roomIdx = gameRooms.findIndex((e) => e.gameId === gameId)
    // 방이 서버에 있는 확인
    if (roomIdx === -1) return false
    // 호스트가 나갈 시 방 삭제
    if (gameRooms[roomIdx].userId1 === userId) {
        gameRooms.splice(roomIdx,1)
    // 참가자가 나갈 시 userId2를 비움
    } else if (gameRooms[roomIdx].userId2 === userId) {
        gameRooms[roomIdx].userId2 = null
    } else return false 

    return gameRooms[roomIdx]
}

export const destroyRoom = (userId) => {
    const roomIdx = gameRooms.findIndex((e) => e.userId1 === userId || e.userId2 === userId )
    if (roomIdx !== -1) return Object.assign(...gameRooms.splice(roomIdx, 1))
    else return false
}

export const gameReady = (gameId, userId, single) => {
    const roomIdx = gameRooms.findIndex((e) => e.gameId === gameId)
    // 방이 서버에 있는 확인
    if (roomIdx === -1) return false

    // 참가자가 준비완료/취소 했을 경우
    if (gameRooms[roomIdx].userId2 === userId) {
        gameRooms[roomIdx].ready = !gameRooms[roomIdx].ready
        return "ready"
    // 호스트의 시작이 성공했을 경우
    } else if ((gameRooms[roomIdx].userId1 === userId && gameRooms[roomIdx].ready) || single) {
        gameRooms[roomIdx].startTime = Date.now();
        return "start"
    }

    return "notReady"
}

export const kick = (gameId) => {
    const roomIdx = gameRooms.findIndex((e) => e.gameId === gameId)
    // 방이 서버에 있는 확인
    if (roomIdx === -1) return false
    // 서버에서 유저(참가자) 삭제
    gameRooms[roomIdx].userId2 = null
    
    return gameRooms[roomIdx]
}