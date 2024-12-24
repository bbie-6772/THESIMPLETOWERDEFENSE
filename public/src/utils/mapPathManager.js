//====================================================================================================================
//====================================================================================================================
// public/src/utils/mapPathManager.js
// js for map and path management in Client side
//====================================================================================================================
//====================================================================================================================

// 임시 게임모드 enum 역할
export const GameMode = Object.freeze({
    SINGLE: 'single',
    DUO: 'duo'
});

// 게임모드에 따라 몬스터 경로 생성
export const generateMonsterPath = (gameMode) => {
    switch (gameMode) {
        case GameMode.SINGLE:
            break;
        case GameMode.DUO:
            break;
        default:
            break;
    }
};

//
export const generateSingleModePath = () => {
    const path = [];
    let currentX = 0;
    let currentY = Math.floor(Math.random() * 21) + 500; // 500 ~ 520 범위의 y 시작
    path.push({ x: currentX, y: currentY });
    // 캔버스 위치로 snapping
    /*
    while (currentX < canvas.width) {
        currentX += Math.floor(Math.random() * 100) + 50; // 50 ~ 150 범위의 x 증가
        if (currentX > canvas.width) currentX = canvas.width;

        currentY += Math.floor(Math.random() * 200) - 100; // -100 ~ 100 범위의 y 변경
        if (currentY < 0) currentY = 0;
        if (currentY > canvas.height) currentY = canvas.height;

        path.push({ x: currentX, y: currentY });
    }
        */

    return path;
}