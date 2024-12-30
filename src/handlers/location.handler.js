import { initGame } from "../manager/gameSimulator.js";
/*
// 임시 게임시작 이후 위치 동기화
export const testGameStart = (userId, payload, io) => {
    initGame(io);
    return { 
        status: 'success', 
        resType: 'testGameStart',
    };
};
*/

// 임시: 게임시작 신호 클라>서버 전달
export const testInitGame = (userId, payload, io) => {
    initGame(io);
    return { 
        status: 'success', 
        resType: 'initGame',
    };
};

// 임시 위치 동기화 업데이트
export const locationUpdate = (userId, payload) => {
    // client로부터 받은 packet 속 location coord 정보
    const { coordX, coordY } = payload;
    // 서버 시간 타임스탬프
    const timestamp = Date.now();
    
    // TO DO: client로부터 받은 packet 속 location coord 정보 브로드캐스팅

    // TO DO: VALIDATION : 동일 alg 시뮬 결과 비교 통해 유효성 검증

    // TO DO: speed hack, teleport hack의 가능성에 대한 핸들링
    
    // 어뷰징 방지용 히스토리 기록
    recordItemHistory(userId, itemId, timestamp);

    return { 
        status: 'success', 
        resType: 'locationUpdate',
        broadcast: true,

        itemScore 
    };
};