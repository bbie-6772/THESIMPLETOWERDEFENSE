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

export class MonsterCount {
    constructor(maxCount, countBar) {
        this.maxCount = maxCount;
        this.currentCount = 0;
        this.countBar = countBar;
    }

    // 몬스터 수 감소
    down(amount) {
        this.currentCount = Math.max(0, this.currentCount - amount);
        this.updateCountBar();
    }

    // 몬스터 수 증가
    up(amount) {
        this.currentCount = Math.min(this.maxCount, this.currentCount + amount);
        this.updateCountBar();
    }

    //몬스터바 업데이트 메서드  
    updateCountBar() {
        const percentage = (this.currentCount / this.maxCount) * 100;
        this.countBar.style.width = `${percentage}%`;
        this.countBar.setAttribute('aria-valuenow', this.currentCount);
        this.countBar.textContent = `${this.currentCount} / ${this.maxCount}`;

        // 체력에 따라 색상 변경  
        if (percentage > 80) {
            this.countBar.style.backgroundColor = 'red';
        } else if (percentage > 60) {
            this.countBar.style.backgroundColor = 'orange';
        } else {
            this.countBar.style.backgroundColor = 'green';
        }
    }
} 