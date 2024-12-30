import { getGameAssets } from '../init/assets.js';
import { getRandomInt } from '../utils/randNumberGenerate.js';
import { getUser } from '../models/users.model.js';
import { addTower, getTowers, getUsersTower } from '../models/tower.model.js';

//타워 설치 클라이언트에서 위치(x,y 그리드 위치) 랜덤 타워 
export const placeTower = (userId, payload, socket) => {

    const { towers } = getGameAssets();
    const { X, Y } = payload;
    const user = getUser(userId);

    const getRandomTower =  getRandomInt(0,towers.data.length);
    //

    try{
        //배치할 위치 확인
        if(getUsersTower(userId,X,Y) == undefined){
            return { status: 'failed', message: 'already taken position.' };
        }

        //유저 골드 확인
        if(user.gold < towers.data[getRandomTower].cost){
            return { status: 'failed', message: 'lack of money.' };
        }
        //데이터 적용
        const changedgold = user.gold - towers.data[getRandomTower].cost;
        addTower(userId,X,Y,towers.data[getRandomTower].id);
        setUserGold(userId, changedgold);

    }
    catch(err){
        return { status: 'failed', Error: err };
    }
  return { status: 'success',handlerId:'towerPlacement',towerid: towers.data[getRandomTower].id, x: X, y: Y, gold };
};