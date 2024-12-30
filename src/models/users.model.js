let users = [];
export const addUser = (userId, nickname) => {
    // 중복 접속일 경우 추가 X
    const userIdx = users.findIndex((e) => e.userId === userId)
    if (userIdx !== -1) return

    const user =  {
        userId: userId,
        nickname: nickname,
        gold: 0,
        monsterKill: 0,
        totalDamage:0,
        upgrades : {
        },
    }
    users.push(user)
}

export const getUser = (userId) => {
    return users.find((e) => e.userId === userId)
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