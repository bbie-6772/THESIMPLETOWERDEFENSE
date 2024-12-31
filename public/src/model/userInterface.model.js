let userGold = 1000; // 유저 골드
let score = 0; // 게임 점수
let highScore = 0; // 기존 최고 점수

export const setUserGold = (gold)=>{
    userGold = gold;
};

export const setScore = (newscore)=>{
    score = newscore;
};

export const setHighScore = (newscore)=>{
    highScore = newscore;
};

export const getUserGold = ()=>{
    return userGold;
};

export const getScore = ()=>{
    return score;
};

export const getHighScore = ()=>{
    return highScore;
};