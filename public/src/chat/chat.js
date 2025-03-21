
export const intiChat = (socket) => {

    let currentChannel = null; // 현재 채널을 저장할 변수 초기화
    // 게임 모드인지 확인
    const isGameMode = document.getElementById('gameFrame').style.display === 'block';

    // 게임 모드에 따라 다른 요소 선택
    const messageInput = document.getElementById(isGameMode ? 'game-messageInput' : 'messageInput');
    const sendButton = document.getElementById(isGameMode ? 'game-sendButton' : 'sendButton');
    const messagesDiv = document.getElementById(isGameMode ? 'game-messages' : 'messages');


    // 이벤트 리스너
    sendButton.onclick = sendMessage; // 전송 버튼 클릭 시 메시지 전송 함수 호출

    // 채널 목록 요청
    socket.emit('getChannels');

    // 채널 목록 수신
    socket.on('channelList', (channels) => {
        // 첫 번째 채널 자동 참여
        if (channels.length > 0) {
            joinChannel(channels[0]); // 첫 번째 채널에 자동으로 참여
        }
    });

    // 채널 참여
    function joinChannel(channel) {
        // 현재 채널이 있을 경우 나가기
        if (currentChannel) {
            socket.emit('leaveChannel', { channelId: currentChannel }); // 현재 채널에서 나가기 요청
        }

        currentChannel = channel.channelId; // 새로 참여할 채널 ID 저장
        socket.emit('joinChannel', { channelId: channel.channelId }); // 새 채널 참여 요청

        // UI 업데이트
        messageInput.disabled = false; // 메시지 입력 필드 활성화
        sendButton.disabled = false; // 전송 버튼 활성화
        messagesDiv.innerHTML = ''; // 이전 메시지 내용 초기화
    }

    // 메시지 전송
    function sendMessage() {
        const content = messageInput.value.trim(); // 입력된 메시지 내용 가져오기
        if (content && currentChannel) { // 내용이 있고 현재 채널이 있을 경우
            socket.emit('sendMessage', { // 메시지 전송 요청
                channelId: currentChannel,
                content: content
            });
            messageInput.value = ''; // 입력 필드 초기화
        }
    }

    // 메시지 수신 및 표시
    socket.on('newMessage', ({ channelId, message }) => {
        if (currentChannel === channelId) { // 현재 채널과 메시지 채널이 일치할 경우
            displayMessage(message); // 메시지 표시 함수 호출
        }
    });

    // 채널 히스토리 수신
    socket.on('channelHistory', ({ channelId, messages }) => {
        if (currentChannel === channelId) { // 현재 채널과 히스토리 채널이 일치할 경우
            messagesDiv.innerHTML = ''; // 이전 메시지 내용 초기화
            messages.forEach(message => {
                displayMessage(message); // 각 메시지 표시
            });
            messagesDiv.scrollTop = messagesDiv.scrollHeight; // 메시지 영역 스크롤 최하단으로 이동
        }
    });

    // 사용자 입장 메시지
    socket.on('userJoined', ({ channelId, userId, timestamp }) => {
        if (currentChannel === channelId) { // 현재 채널과 사용자 입장 채널이 일치할 경우
            const messageDiv = document.createElement('div'); // 새 메시지 요소 생성
            messageDiv.className = 'system-message'; // 클래스 이름 설정
            messageDiv.textContent = `새로운 사용자가 입장했습니다. (${new Date(timestamp).toLocaleTimeString()})`; // 메시지 내용 설정
            messagesDiv.appendChild(messageDiv); // 메시지 요소 추가
            messagesDiv.scrollTop = messagesDiv.scrollHeight; // 메시지 영역 스크롤 최하단으로 이동
        }
    });

    // 사용자 퇴장 메시지
    socket.on('userLeft', ({ channelId, userId, timestamp }) => {
        if (currentChannel === channelId) { // 현재 채널과 사용자 퇴장 채널이 일치할 경우
            const messageDiv = document.createElement('div'); // 새 메시지 요소 생성
            messageDiv.className = 'system-message'; // 클래스 이름 설정
            messageDiv.textContent = `사용자가 퇴장했습니다. (${new Date(timestamp).toLocaleTimeString()})`; // 메시지 내용 설정
            messagesDiv.appendChild(messageDiv); // 메시지 요소 추가
            messagesDiv.scrollTop = messagesDiv.scrollHeight; // 메시지 영역 스크롤 최하단으로 이동
        }
    });

    // 메시지 표시 함수
    function displayMessage(message) {
        const messageDiv = document.createElement('div'); // 메시지 요소 생성
        messageDiv.className = `message ${message.userId === socket.id ? 'sent' : 'received'}`; // 메시지 클래스 설정 (보낸 메시지 또는 받은 메시지)

        const contentDiv = document.createElement('div'); // 내용 요소 생성
        contentDiv.className = 'content'; // 클래스 이름 설정
        contentDiv.textContent = message.content; // 메시지 내용 설정
        messageDiv.appendChild(contentDiv); // 내용 요소 추가

        const metadataDiv = document.createElement('div'); // 메타데이터 요소 생성
        metadataDiv.className = 'metadata'; // 클래스 이름 설정
        metadataDiv.textContent = new Date(message.timestamp).toLocaleTimeString(); // 타임스탬프 설정
        messageDiv.appendChild(metadataDiv); // 메타데이터 요소 추가

        messagesDiv.appendChild(messageDiv); // 메시지 요소 추가
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // 메시지 영역 스크롤 최하단으로 이동
    }


    messageInput.onkeypress = (e) => { // 메시지 입력 시
        if (e.key === 'Enter') { // Enter 키가 눌리면
            sendMessage(); // 메시지 전송 함수 호출
        }
    };
}

