//====================================================================================================================
//====================================================================================================================
// src/init/pathGenerator.js
// js for map and path management in Client side
//====================================================================================================================
//====================================================================================================================

/* LEGACY CODE : 게임모드에 따라 다른 몬스터 경로 생성 << 모드 상관없이 단일 맵 기획변경
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
*/

export const generatePath = () => {
    const path = [];
    // 캔버스 위치로 snapping 현재 canvas width="1920" height="1080" 고려, 임시로 하드코딩 >> 추후 config로 설정값 관리 리팩토링 필요
    const basePoint = { x: 100, y: 100 };
    const incremWidth = (1920 * (8 / 10)) / 2;
    const incremHeight = 1080 * (8 / 10);
    // 순차적으로 가야하는 sequnece
    const simplifiedSequence = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 2, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0, y: 0 },
    ];
    const processedSequence = simplifiedSequence.map(point => ({
        x: basePoint.x + point.x * incremWidth,
        y: basePoint.y + point.y * incremHeight
    }));
    for (let point of processedSequence) {
        path.push(point);
        // 테스트 로그
        // console.log("Sequence : ", JSON.stringify(point));
    }
    return path;
}