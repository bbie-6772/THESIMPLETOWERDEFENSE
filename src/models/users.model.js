let users = [];
export const addUser = (userId, nickname, socketId) => {
    // 중복 접속일 경우 추가 X
    const userIdx = users.findIndex((e) => e.userId === userId)
    if (userIdx !== -1) return

    const user =  {
        userId: userId,
        nickname: nickname,
        socketId : socketId,
        gold: 1000,
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

export const getUsers = (userId) => {
    return users
}


export const setUserGold = (userId, gold)=>{
    try{
        users.find((element) => element.userId === userId).gold = gold;
        return true;
    }
    catch(err){
        throw err;
    }
}

export const deleteUser = (socketId) => {
    const idx = users.findIndex((e) => e.socketId === socketId)
    if (idx !== -1 ) return Object.assign(...users.splice(idx, 1))
    else return false
}