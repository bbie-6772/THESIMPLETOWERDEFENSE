let users = [];
export const addUser = (userId, nickname, gold) => {
    const user =  {
        userId: userId,
        nickname: nickname,
        gold: gold,
        monsterKill: 0,
        totalDamage:0
    }
    users.push(user)
}

export const getUser = (userId) =>{
    return userId.find((element) => element.userId === userId);
}

export const setUserGold = (userId, gold)=>{
    try{
        userId.find((element) => element.userId === userId).gold = gold;
        return true;
    }
    catch(err){
        throw err;
    }
}