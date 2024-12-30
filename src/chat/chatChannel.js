export class ChatChannel {
    constructor(channelId, name, description = '') {
        // 채널 ID, 이름, 설명 초기화
        this.channelId = channelId;
        this.name = name;
        this.description = description;
        // 메시지를 저장할 배열 초기화
        this.messages = [];
        // 채널에 참여 중인 사용자 ID를 저장할 Set 초기화
        this.users = new Set();
    }

    // 새 메시지를 채널에 추가
    addMessage(message) {
        this.messages.push(message); // 메시지를 배열에 추가
        // 메시지 수가 100을 초과하면 가장 오래된 메시지를 제거
        if (this.messages.length > 100) {
            this.messages.shift();
        }
        return message; // 추가된 메시지 반환
    }


    // 사용자 추가
    addUser(userId) {
        this.users.add(userId); // Set에 사용자 ID 추가
    }

    // 사용자 제거
    removeUser(userId) {
        this.users.delete(userId); // Set에서 사용자 ID 제거
    }

    // 현재 채널에 참여 중인 사용자 목록 반환
    getUsers() {
        return Array.from(this.users); // Set을 배열로 변환하여 반환
    }

    // 최근 메시지 목록 가져오기 (기본값: 50개)
    getRecentMessages(limit = 50) {
        return this.messages.slice(-limit); // 가장 최근의 메시지를 지정된 수만큼 반환
    }
}
