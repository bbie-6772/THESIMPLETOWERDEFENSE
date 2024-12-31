import { validateMessage } from "../chat/chatValid.js";
import LocationSyncManager from "../manager/LocationSyncManager.js";
export function setupChatHandlers(io, socket, chatService) {
    // 채널 목록 요청 처리
    socket.on('getChannels', () => {
        // 모든 채널 정보를 클라이언트에 전송
        socket.emit('channelList', chatService.channelManager.getAllChannels());
    });

    // 채널 참여 처리
    socket.on('joinChannel', ({ channelId }) => {
        // 소켓을 지정된 채널에 참여시킴
        socket.join(channelId);
        chatService.joinChannel(socket.id, channelId); // 채널에 사용자 추가

        // 참여한 채널의 최근 메시지 가져오기
        const channel = chatService.channelManager.getChannel(channelId);
        socket.emit('channelHistory', {
            channelId,
            messages: channel.getRecentMessages() // 최근 메시지 전송
        });

        // 다른 사용자에게 새 사용자가 채널에 참여했음을 알림
        io.to(channelId).emit('userJoined', {
            channelId,
            userId: socket.id,
            timestamp: new Date().toISOString() // 현재 시간 기록
        });
    });

    // 채널 나가기 처리
    socket.on('leaveChannel', ({ channelId }) => {
        // 소켓을 지정된 채널에서 나가게 함
        socket.leave(channelId);
        chatService.leaveChannel(socket.id, channelId); // 채널에서 사용자 제거

        // 다른 사용자에게 사용자가 채널을 나갔음을 알림
        io.to(channelId).emit('userLeft', {
            channelId,
            userId: socket.id,
            timestamp: new Date().toISOString() // 현재 시간 기록
        });
    });

    // 메시지 전송 처리
    socket.on('sendMessage', async ({ channelId, content }) => {

        //todo : 여기 진행
        // 메시지 검증
        const result = await validateMessage(content); // 메시지 검증 함수 호출
        let lastMessage = content;
        // result가 객체인지 확인하고 content 추출
        let messageContent;
        if (typeof result === 'object' && result !== null && 'content' in result) {
            messageContent = result.content; // content 속성 추출
        } else {
            console.error('검증 결과가 유효하지 않습니다:', result);
        }

        const valid = messageContent.includes('승인'); // 검증 결과 확인

        if (!valid) {
            lastMessage = "server : 규칙을 통과하지 못한 메시지 입니다.";
            socket.emit('newMessage', {
                channelId,
                message: {
                    content: lastMessage,
                    userId: "server" // 서버에서 보낸 메시지임을 명시
                }
            });
            return; // 이후 처리 중단
        }

        console.log(messageContent); // 승인 메시지 로그

        // 메시지 객체 생성
        const message = {
            id: Date.now(), // 메시지 ID (현재 시간 기반)
            userId: socket.id, // 메시지를 보낸 사용자 ID
            content: lastMessage, // 메시지 내용
            timestamp: new Date().toISOString() // 현재 시간 기록
        };

        // 메시지를 채널에 전송
        chatService.sendMessage(channelId, message);
        // 모든 사용자에게 새 메시지를 전송
        io.to(channelId).emit('newMessage', { channelId, message });
    });

    return {
        // 사용자 연결 종료 처리
        handleDisconnect: () => {
            //#region 위치동기화 종료
            LocationSyncManager.getInstance().stopSync();
            //#endregion

            console.log('사용자가 연결을 종료했습니다:', socket.id);
            // 사용자가 참여한 모든 채널에서 나감
            chatService.channelManager.getAllChannels().forEach(channel => {
                if (channel.users.has(socket.id)) {
                    chatService.leaveChannel(socket.id, channel.channelId);
                    // 다른 사용자에게 사용자가 나갔음을 알림
                    io.to(channel.channelId).emit('userLeft', {
                        channelId: channel.channelId,
                        userId: socket.id,
                        timestamp: new Date().toISOString() // 현재 시간 기록
                    });
                }
            });
        }
    };
}
