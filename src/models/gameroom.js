import { v4 as uuidv4 } from "uuid";

let gameRooms = [];

export const addRoom = (userId, password, timer) => {
    // 게임 방 고유 번호 생성
    const gameId = uuidv4()

    const room = {
        gameId: gameId,
        userId1: userId,
        userId2: null,
        password: password,
        score: 0,
        startTime: 0,
        monsterCount: 0,
        gameOverTimer: timer,
    }

    gameRooms.push(room)
}