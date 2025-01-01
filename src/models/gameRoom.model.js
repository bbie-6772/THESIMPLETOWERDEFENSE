import { v4 as uuidv4 } from "uuid";
import LocationSyncManager from "../manager/LocationSyncManager.js";
import { removeUser } from "./tower.model.js";
import { setUserGold, resetUser } from "./users.model.js";
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

        const count = {
            1: 25,
            2: 20,
            3: 15,
            4: 10
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
            monsterCount: count[difficult],
            gameOverTimer: timer[difficult],
        }

        gameRooms.push(room)

        LocationSyncManager.initialize

        return true 
    } catch (err) {
        console.log(err)
        return false
    }

}
// room 정보 갱신.
export const roomInfoUpdate = (gameId, score, monsterCount, time)=> {
    const index = gameRooms.findIndex((room) => room.gameId === gameId )
    
    if(index !== -1){
        gameRooms[index].score = score;
        gameRooms[index].monsterCount = monsterCount;
        gameRooms[index].startTime = time;
    }
}

export const roomMonsterCountUpdate= (gameId)=> {
    const index = gameRooms.findIndex((room) => room.gameId === gameId )

    if(index !== -1){
        return gameRooms[index].monsterCount; 
    }
}

// room 게임오버 타이머 세팅(몬스터 리스폰).
export const roomGameOverTimerSetting = (gameId) => {
    const index = gameRooms.findIndex((room) => room.gameId === gameId )

    if(index !== -1){
        return gameRooms[index].gameOverTimer; 
    } else {
        return 60;
    }
}

// room 게임오버 타이머 (로비).
export const getStartTimer = (gameId,io)=> {
    const index = gameRooms.findIndex((room) => room.gameId === gameId )
    if(index !== -1){
        if(gameRooms[index].startTime <= 0){
            io.emit("gameEnd", {
                timer: gameRooms[index].startTime
            });

            const destroyed = destroyRoom(gameRooms[index].userId1);
            io.to(destroyed.gameId).emit('leaveRoom', { roomId: destroyed.gameId })
        }
    } else {
        io.emit("gameEnd", {
            timer: 60
        });
    }
}

export const getRoom = (userId) => {
    return gameRooms.find((e) => e.userId1 === userId || e.userId2 === userId)
}

export const getRoomFromGameId = (gameId) => {
    return gameRooms.find((e) => e.gameId === gameId);
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
        return false
    // 참가자가 나갈 시 userId2를 비움
    } else if (gameRooms[roomIdx].userId2 === userId) {
        gameRooms[roomIdx].userId2 = null
        // 얕은 복사 방지
        return { ...gameRooms[roomIdx] }
    } else return false  
}

export const destroyRoom = (userId) => {
    const roomIdx = gameRooms.findIndex((e) => e.userId1 === userId || e.userId2 === userId )
    if (roomIdx !== -1) return Object.assign(...gameRooms.splice(roomIdx, 1))
    else return false
}

export const gameReady = (gameId, userId, single) => {
    removeUser(userId);
    resetUser(userId);

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