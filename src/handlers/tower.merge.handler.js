import towerModel from "../models/tower.model";

// 타워 합성 핸들러
export const TowerMerge = (uuid, payload) => {
    const { x1, y1, x2, y2 } = payload;

    // 검증
    // uuid가 유효한지 검사 (uuid가 존재하는지)
    // 타워가 유효한지 검사 (타워가 존재하는지)
    // 합성이 유효한지 검사 (타워 티어가 같은지, 타워가 최고티어가 아닌지)

    towerModel.merge(uuid, x1, y1, x2, y2);
    const response = { x, y, towerId, tier };
    return response;
}

export const TowerUpgrade = (uuid, payload) => {
    const { towerId } = payload;

    // 검증
    // uuid가 유효한지 검사 (uuid가 존재하는지)
    // 
}