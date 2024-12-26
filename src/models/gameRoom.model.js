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

export const deleteRoom  = (userId) => {
    // 유저가 호스트일 경우에만 파기
    const roomIdx = gameRooms.findIndex((e) => e.userId1 === userId)
    if (roomIdx === -1) return false        
    gameRooms.splice(roomIdx, 1) 
    return true
}

export const joinRoom = (gameId, userId) => {
    const roomIdx = gameRooms.findIndex((e) => e.gameId === gameId)
    // 방이 서버에 있는 확인
    if (roomIdx === -1) return false     
    // 방이 꽉 차 있는지 확인
    if (gameRooms[roomIdx].userId2) return false
    else gameRooms[roomIdx].userId2 = userId
    return true
}