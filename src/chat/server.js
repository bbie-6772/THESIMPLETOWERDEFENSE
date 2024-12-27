import { ChatService } from './chatService.js'; // 채팅 서비스 임포트
import { SocketManager } from '../manager/socketManager.js'; // 소켓 관리 클래스 임포트

export function createChatServer(io) {

    const chatService = new ChatService(); // 채팅 서비스 인스턴스 생성
    // 소켓 이벤트 핸들러 설정
    const socketManager = new SocketManager(io, chatService); // SocketManager 인스턴스 생성
    socketManager.initialize(); // 소켓 이벤트 핸들러 초기화

    return { chatService };
}
