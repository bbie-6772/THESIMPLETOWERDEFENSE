import { sendEvent } from "./src/init/socket.js"

let rooms = [];
let selectedRoom = null;

let roomCreationForm = null;
let enableCheckbox = null;
let passwordInput = null;

let roomList = null;
let roomSelectionModal = null;
let selectedRoomDetails = null;
let confirmRoomSelection = null;
let playButton = null;
let refreshButton = null;

let roomName = null;
let roomType = null;
let roomPassword = null;

document.addEventListener('DOMContentLoaded', () => {
    roomCreationForm = document.getElementById('roomCreationForm');
    enableCheckbox = document.getElementById('enablePasswordInput');
    passwordInput = document.getElementById('passwordInput');

    roomList = document.getElementById('roomList');
    roomSelectionModal = new bootstrap.Modal(document.getElementById('roomSelectionModal'));
    selectedRoomDetails = document.getElementById('selectedRoomDetails');
    confirmRoomSelection = document.getElementById('confirmRoomSelection');
    playButton = document.getElementById('playButton');
    refreshButton = document.getElementById('refreshButton');

    roomName = document.getElementById('roomName').value;
    roomType = document.getElementById('roomType').value;
    roomPassword = passwordInput.value;

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
    roomCreationForm.addEventListener('submit', function (e) {
        e.preventDefault();

        //요청 보내기
        sendEvent(1001, { gameName: roomName, type: roomType, password: roomPassword })

        this.reset();
    });

    refreshButton.addEventListener("click", function () {
        // 버튼 비활성화  
        this.disabled = true;
        // 방 새로고침 요청  
        sendEvent(1002);

        // 일정 시간 후 버튼 다시 활성화  
        setTimeout(() => {
            this.disabled = false;
        }, 3000); // 3초 후 다시 활성화  
    });  

    // 방 선택 확인 이벤트  
    confirmRoomSelection.addEventListener('click', function () {
        if (selectedRoom) {

            // 비밀번호가 있는 방일 시,
            if (selectedRoom.password)

                alert(`${selectedRoom.name}방으로 입장합니다`);
            roomSelectionModal.hide();
        }
    });

})

// 방 렌더링 함수  
function renderRooms() {
    roomList.innerHTML = '';
    rooms.forEach(room => {
        const roomCard = document.createElement('div');
        roomCard.className = 'col-md-4 mb-3';
        roomCard.innerHTML = `  
                <div class="card room-card" data-room-id="${room.id}">  
                    <div class="card-body">  
                        <h3 class="card-title">${room.name}</h5>  
                        <p class="card-text">  
                            난이도: ${getRoomTypeLabel(room.type)}<br>  
                            인원: 1/2명  
                        </p>  
                    </div>  
                </div>  
            `;
        roomCard.addEventListener('click', () => selectRoom(room));
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
    const selectedCard = document.querySelector(`.room-card[data-room-id="${room.id}"]`);
    selectedCard.classList.add('selected');

    // 모달에 방 정보 표시  
    selectedRoomDetails.innerHTML = `  
            <p><strong>방 이름:</strong> ${room.name}</p>  
            <p><strong>난이도: </strong> ${getRoomTypeLabel(room.type)}</p>  
            <p><strong>최대 인원:</strong> 2명</p>  
            `;

    roomSelectionModal.show();
}

export const updateRooms = (roomsInfo) => {
    rooms = []
    roomsInfo.forEach((e) => rooms.push({
        id: e.gameId,
        name: e.gameName,
        type: e.difficult,
        password: e.password ? true : false
    }))
    renderRooms()
}




