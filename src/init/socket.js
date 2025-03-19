import { Server as SocketIO } from 'socket.io';
import registerHandler from '../handlers/register.handler.js';
import { createChatServer } from '../chat/server.js';

const initSocket = (server) => {
    // 서버 생성
    const io = new SocketIO()
    // initSocket에 받은 server의 포트와 연결함
    io.attach(server)
    // 핸들러 등록
    registerHandler(io)

    // 채팅 서버와 서비스 인스턴스 생성
    const { chatService } = createChatServer(io);

    // 기본 채널 생성
    chatService.createChannel('general', 'General Chat', '일반 대화방'); // 일반 대화방 채널 생성
    chatService.createChannel('random', 'Random Chat', '자유 대화방'); // 자유 대화방 채널 생성
    chatService.createChannel('news', 'News', '뉴스 채널'); // 뉴스 채널 생성
}

export default initSocket