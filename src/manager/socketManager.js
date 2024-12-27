import { setupChatHandlers } from '../handlers/chat.handler.js'; // 채팅 핸들러 설정 함수 임포트

export class SocketManager {
    constructor(io, chatService) {
        this.io = io; // Socket.IO 인스턴스 저장
        this.chatService = chatService; // 채팅 서비스 인스턴스 저장
        this.handlers = new Map(); // 소켓 ID와 핸들러 매핑을 위한 Map 초기화
    }

    // 소켓 연결 초기화
    initialize() {
        // 새로운 소켓 연결 이벤트 리스너 설정
        this.io.on('connection', (socket) => {
            console.log('새로운 사용자가 연결되었습니다:', socket.id); // 연결된 사용자의 ID 로그

            // 채팅 핸들러 설정
            const chatHandlers = setupChatHandlers(this.io, socket, this.chatService);
            this.handlers.set(socket.id, chatHandlers); // 소켓 ID와 핸들러를 Map에 저장

            // 연결 해제 이벤트 리스너 설정
            socket.on('disconnect', () => {
                const handlers = this.handlers.get(socket.id); // 해당 소켓의 핸들러 가져오기
                if (handlers) {
                    handlers.handleDisconnect(); // 연결 해제 처리
                    this.handlers.delete(socket.id); // 핸들러 삭제
                }
            });
        });
    }
}
