
import { createChatServer } from './server.js';

// 채팅 서버와 서비스 인스턴스 생성
const { chatService } = createChatServer(io);

// 기본 채널 생성
chatService.createChannel('general', 'General Chat', '일반 대화방'); // 일반 대화방 채널 생성
chatService.createChannel('random', 'Random Chat', '자유 대화방'); // 자유 대화방 채널 생성
chatService.createChannel('news', 'News', '뉴스 채널'); // 뉴스 채널 생성

