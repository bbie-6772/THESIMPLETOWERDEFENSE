import { EventEmitter } from 'events';
import { ChannelManager } from '../manager/channelManager.js';
import { validateMessage } from './chatValid.js';

export class ChatService {
    constructor() {
        // 이벤트를 처리하기 위한 EventEmitter 인스턴스 초기화
        this.eventBus = new EventEmitter();
        // 채널 관리자를 초기화
        this.channelManager = new ChannelManager();
        // 이벤트 핸들러 설정
        this.setupEventHandlers();
    }

    // 이벤트 핸들러 설정
    setupEventHandlers() {
        // 사용자가 채널에 참여할 때 처리
        this.eventBus.on('userJoinChannel', ({ userId, channelId }) => {
            const channel = this.channelManager.getChannel(channelId); // 채널 가져오기
            channel.addUser(userId); // 사용자 추가
        });

        // 사용자가 채널에서 나갈 때 처리
        this.eventBus.on('userLeaveChannel', ({ userId, channelId }) => {
            const channel = this.channelManager.getChannel(channelId); // 채널 가져오기
            channel.removeUser(userId); // 사용자 제거
        });

        // 새 메시지가 도착할 때 처리
        this.eventBus.on('newMessage', ({ channelId, message }) => {
            const channel = this.channelManager.getChannel(channelId); // 채널 가져오기
            channel.addMessage(message); // 메시지 추가
        });
    }

    // 새 채널 생성
    createChannel(channelId, name, description) {
        const channel = this.channelManager.createChannel(channelId, name, description); // 채널 생성
        // 채널 생성 이벤트를 발생시킴
        this.eventBus.emit('channelCreated', { channelId, name, description });
        return channel; // 생성된 채널 반환
    }

    // 채널 삭제
    removeChannel(channelId) {
        this.channelManager.removeChannel(channelId); // 채널 삭제
        // 채널 삭제 이벤트를 발생시킴
        this.eventBus.emit('channelRemoved', { channelId });
    }

    // 메시지 전송
    sendMessage(channelId, message) {

        // 새 메시지 이벤트를 발생시킴
        this.eventBus.emit('newMessage', { channelId, message });
    }

    // 사용자 채널 참여 요청
    joinChannel(userId, channelId) {
        // 사용자 참여 이벤트를 발생시킴
        this.eventBus.emit('userJoinChannel', { userId, channelId });
    }

    // 사용자 채널 나가기 요청
    leaveChannel(userId, channelId) {
        // 사용자 나가기 이벤트를 발생시킴
        this.eventBus.emit('userLeaveChannel', { userId, channelId });
    }
}
