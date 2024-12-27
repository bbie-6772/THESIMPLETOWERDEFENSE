let roomName = null;
let roomType = null;
let roomPassword = null;

let chatBox = null;
let host = null;
let entry = null;

let exitButton = null;
let kickButton = null;
let playButton = null;

document.addEventListener('DOMContentLoaded', () => {
    roomName = document.getElementById('roomName')
    roomType = document.getElementById('roomType')
    roomPassword = document.getElementById('roomPassword')

    chatBox = document.getElementById('chatBox');
    host = document.getElementById('host');
    entry = document.getElementById('entry');

    playButton = document.getElementById('playButton');
    kickButton = document.getElementById('kickButton');
    exitButton = document.getElementById('exitButton');

    // 준비 완료, 시작 이벤트
    playButton.addEventListener('click', function () {
    });

    // 강퇴 이벤트
    kickButton.addEventListener('click', function () {
    });

    // 나가기 이벤트
    exitButton.addEventListener('click', function () {
    });
})

// 방 유형 라벨 변환 함수  
function getRoomTypeLabel(type) {
    const labels = {
        1: '쉬움',
        2: '보통',
        3: '어려움',
        4: '극악'
    };
    return labels[type] || type;
}
// 방 업데이트 함수  
export const updateRoomInfo = (roomInfo) => {
    // 방 정보 업데이트
    const name = document.createElement('div')
    name.innerText = roomInfo.gameName
    const type = document.createElement('div')
    type.innerText = getRoomTypeLabel(roomInfo.difficult)
    const password = document.createElement('div')
    password.innerText = roomInfo.password

    name.append(roomName);
    type.append(roomType);
    password.append(roomPassword);
}

// 유저 업데이트 함수
export const updateUser = (roomInfo) => {
    host.innerText = roomInfo.userId1
    entry.innerText = roomInfo.userId2
}



