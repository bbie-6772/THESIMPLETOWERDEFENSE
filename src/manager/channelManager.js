import { ChatChannel } from '../chat/chatChannel.js';

export class ChannelManager {
    constructor() {
        // 채널 정보를 저장하기 위한 Map 객체 초기화
        this.channels = new Map();
    }

    // 새 채널 생성
    createChannel(channelId, name, description = '') {
        // 같은 ID의 채널이 이미 존재하는지 확인
        if (this.channels.has(channelId)) {
            throw new Error(`Channel ${channelId} already exists`); // 예외 처리
        }
        // ChatChannel 인스턴스 생성
        const channel = new ChatChannel(channelId, name, description);
        // 채널을 Map에 추가
        this.channels.set(channelId, channel);
        return channel; // 생성된 채널 반환
    }

    // 채널 삭제
    removeChannel(channelId) {
        // 삭제하려는 채널이 존재하는지 확인
        if (!this.channels.has(channelId)) {
            throw new Error(`Channel ${channelId} does not exist`); // 예외 처리
        }
        // 채널을 Map에서 삭제
        this.channels.delete(channelId);
    }

    // 특정 채널 가져오기
    getChannel(channelId) {
        const channel = this.channels.get(channelId);
        // 채널이 존재하지 않을 경우 예외 처리
        if (!channel) {
            throw new Error(`Channel ${channelId} does not exist`);
        }
        return channel; // 존재하는 채널 반환
    }

    // 모든 채널 목록 가져오기
    getAllChannels() {
        // Map의 모든 값을 배열로 변환하여 반환
        return Array.from(this.channels.values());
    }
}
