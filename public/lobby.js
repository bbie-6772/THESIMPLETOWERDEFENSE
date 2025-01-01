import { sendEvent, ready, getSocket, getRoom } from "./src/init/socket.js"
//import Monsters from "./src/model/monsterSpawner.js";
//import { getSocket, getRoom } from "./src/init/socket.js";
//import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { intiChat } from './src/chat/chat.js';
import showAlert from "./src/utils/sweetAlert.js";

let game = null;
let rooms = [];
let selectedRoom = null;
let roomId = null;

let roomCreationForm = null;
let enableCheckbox = null;
let passwordInput = null;

let roomList = null;
let roomSelectionModal = null;
let selectedRoomDetails = null;
let confirmRoomSelection = null;
let refreshButton = null;
let gameFrame = null;

let roomName = null;
let roomType = null;
let roomPassword = null;
let waitRoom = null
let waitRoomName = null;
let waitRoomType = null;
let waitRoomPassword = null;

let chatBox = null;
let host = null;
let entry = null;
let nickname = null;
let highScoreS = null;
let highScoreM = null;

let exitButton = null;
let kickButton = null;
let playButton = null;

let soloRank = null;
let multiRank = null;

let name = document.createElement('div');
let type = document.createElement('div');
let password = document.createElement('div');

document.addEventListener('DOMContentLoaded', () => {
    intiChat(getSocket())
    roomCreationForm = document.getElementById('roomCreationForm');
    enableCheckbox = document.getElementById('enablePasswordInput');
    passwordInput = document.getElementById('passwordInput');

    nickname = document.getElementById('nickname');
    highScoreS = document.getElementById('highScoreS');
    highScoreM = document.getElementById('highScoreM');
    soloRank = document.getElementById('soloRank');
    multiRank = document.getElementById('multiRank');

    roomList = document.getElementById('roomList');
    roomSelectionModal = new bootstrap.Modal(document.getElementById('roomSelectionModal'));
    selectedRoomDetails = document.getElementById('selectedRoomDetails');
    confirmRoomSelection = document.getElementById('confirmRoomSelection');
    refreshButton = document.getElementById('refreshButton');
    gameFrame = document.getElementById('gameFrame')

    roomName = document.getElementById('roomName')
    roomType = document.getElementById('roomType')
    roomPassword = document.getElementById('roomPassword')
    waitRoom = new bootstrap.Modal(document.getElementById('waitRoom'), {
        backdrop: 'static',
        keyboard: false
    });

    chatBox = document.getElementById('chatBox');
    host = document.getElementById('host');
    entry = document.getElementById('entry');

    playButton = document.getElementById('playButton');
    kickButton = document.getElementById('kickButton');
    exitButton = document.getElementById('exitButton');

    // 체크박스 상태에 따라 비밀번호 입력 필드 활성/비활성화  
    enableCheckbox.addEventListener('change', function () {
        if (this.checked) {
            passwordInput.disabled = false;
            passwordInput.focus();
        } else {
            passwordInput.disabled = true;
            passwordInput.value = '';
        }
    },);

    // 방 생성 이벤트 핸들러  
    roomCreationForm.addEventListener('submit', async function (e) {
        waitRoomName = document.getElementById('waitRoomName')
        waitRoomType = document.getElementById('waitRoomType')
        waitRoomPassword = document.getElementById('waitRoomPassword')

        e.preventDefault();

        const button = e.submitter.name;

        // 방 생성 성공 여부 확인 후 연결
        if (await sendEvent(1001, { gameName: roomName.value, type: roomType.value, password: passwordInput.value })) {
            // 방 생성 시
            if (button === "createRoom") {
                waitRoomName.append(name);
                waitRoomType.append(type);
                waitRoomPassword.append(password);
                waitRoom.show()
                // 싱글 플레이 시
            } else if (button === "singlePlay") ready(roomId, true)
        }

        this.reset();
    });

    // 새로고침 버튼
    refreshButton.addEventListener("click", function () {
        // 버튼 비활성화  
        this.disabled = true;
        // 방 새로고침 요청  
        sendEvent(1002);

        // 일정 시간 후 버튼 다시 활성화  
        setTimeout(() => {
            this.disabled = false;
            // 2초 후 다시 활성화 
        }, 2000);
    });

    // 방 선택 후 확인버튼 이벤트  
    confirmRoomSelection.addEventListener('click', async function () {
        if (selectedRoom) {
            waitRoomName = document.getElementById('waitRoomName')
            waitRoomType = document.getElementById('waitRoomType')
            waitRoomPassword = document.getElementById('waitRoomPassword')

            // 비밀번호가 있는 방일 시,
            if (selectedRoom.password) {
                console.log("비번있음")
            }

            if (await sendEvent(1001, { roomId: selectedRoom.gameId })) {
                // alert(`${selectedRoom.gameName}방으로 입장합니다`);
                showAlert('알림', `${selectedRoom.gameName}방으로 입장합니다`);
                
                roomId = selectedRoom.gameId
                roomSelectionModal.hide();

                waitRoomName.append(name);
                waitRoomType.append(type);
                waitRoomPassword.append(password);


                waitRoom.show()
            }
        }
    });

    // 준비 완료, 시작 이벤트
    playButton.addEventListener('click', function () {
        ready(roomId, false)
    });

    // 강퇴 이벤트
    kickButton.addEventListener('click', async function () {
        await sendEvent(1004, { roomId })
    });

    // 나가기 이벤트
    exitButton.addEventListener('click', async function () {
        await sendEvent(1003, { roomId })
    });

})

// 방 렌더링 함수  
function renderRooms() {
    roomList.innerHTML = '';
    rooms.forEach(room => {
        console.log(room)
        const roomCard = document.createElement('div');
        roomCard.className = 'col-md-4 mb-3';
        roomCard.innerHTML = `  
                <div class="card room-card" data-room-id="${room.gameId}">  
                    <div class="card-body">  
                        <h3 class="card-title">${room.gameName}</h5>  
                        <p class="card-text">  
                            난이도: ${getRoomTypeLabel(room.difficult)}<br>  
                            인원: ${room.userId2 ? 2 : 1} / ${room.userId2 === null && room.startTime > 0 ? 1 : 2} 명<br>
                            상태: ${room.startTime > 0 ? "진행중" : "대기중"}
                        </p>  
                    </div>  
                </div>  
            `;
        // 게임이 실행중이지 않을 때만 선택 가능
        roomCard.addEventListener('click', () => { if (room.startTime === 0) selectRoom(room) });
        roomList.appendChild(roomCard);
    });
}

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

// 방 선택 함수
function selectRoom(room) {
    selectedRoom = room;
    // 모든 카드에서 selected 클래스 제거
    document.querySelectorAll('.room-card').forEach(card => {
        card.classList.remove('selected');
    });

    // 선택된 카드에 selected 클래스 추가  
    const selectedCard = document.querySelector(`.room-card[data-room-id="${room.gameId}"]`);
    selectedCard.classList.add('selected');

    // 모달에 방 정보 표시  
    selectedRoomDetails.innerHTML = `  
            <p><strong>방 이름:</strong> ${selectedRoom.gameName}</p>  
            <p><strong>난이도: </strong> ${getRoomTypeLabel(selectedRoom.difficult)}</p>  
            <p><strong>인원:</strong> ${room.userId2 ? 2 : 1} / 2명</p>  
            `;
    roomSelectionModal.show();
}

// 대기방 업데이트 함수  
export const updateRoomInfo = (roomInfo) => {
    roomId = roomInfo.gameId
    // 방 정보 업데이트
    name.innerText = roomInfo.gameName
    type.innerText = getRoomTypeLabel(roomInfo.difficult)
    password.innerText = roomInfo.password || "없음"
}

// 대기방 유저 업데이트 함수
export const updateUser = (roomInfo) => {
    if (roomInfo) {
        host.innerText = roomInfo.userId1
        entry.innerText = roomInfo.userId2 || "비어 있음"
    }
}

// 유저 정보 업데이트
export const updateUserInfo = (name, score1, score2) => {
    let soloScore = document.createElement('div');
    let multiScore = document.createElement('div');

    nickname.innerText = name;
    soloScore.innerText = score1;
    multiScore.innerText = score2;
    
    highScoreS.append(soloScore)
    highScoreM.append(multiScore)
}

// 유저 정보 업데이트
export const updateRank = (solo, multi) => {
    solo.forEach((e) => {
        let soloScore = document.createElement('div');
        soloScore.innerText = `${e.user1.nickname}(${e.score})`;
        soloScore.className = "high-score mb-0"
        soloRank.append(soloScore)
    })

    multi.forEach((e) => {
        let multiScore = document.createElement('div');
        multiScore.innerText = `${e.user1.nickname}/${e.user2.nickname}(${e.score})`;
        multiScore.className = "high-score mb-0"
        multiRank.append(multiScore)
    })
}

// 대기방 나가기
export const exitRoom = () => {
    selectedRoom = null
    roomId = null
    waitRoom.hide()
    gameOver()
    // 방 대기열 요청
    sendEvent(1002);
}

// 대기열 방 업데이트
export const updateRooms = (roomsInfo) => {
    rooms = []
    if (Array.isArray(roomsInfo)) {
        roomsInfo.forEach((e) => rooms.push(e))
    }
    renderRooms()
}

// 게임 시작 
export const gameStart = () => {
    waitRoom.hide();

    import(`./src/game.js?${new Date().getTime()}`).then(module => {
        game = module;
        gameFrame.style.display = "block";
        console.log("게임 시작");

        gameEnd(getSocket(), getRoom());
    }).catch(err => {
        console.error("게임 모듈 로딩 실패:", err);
    });
    
    gameFrame.style.display = "block"


    gameEnd(getSocket(), getRoom());
}

// 게임 오버,끝
export const gameOver = () => {
    console.log(game);
    game = null;
    gameFrame.style.display = "none"
}

// 게임 종료. 
const gameEnd= (socket, getRoom) => {
    socket.on("gameEnd", (data) => {
        console.log(data);
        if(data.timer <= 0) {
            gameOver();
        }
    });
}