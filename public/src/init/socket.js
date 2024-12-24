import { CLIENT_VERSION } from "./constants.js";

let userInfo = null
let rankings = null

// localhost:3000 에 서버를 연결하여 값을 넘겨줌
const socket = io('http://localhost:3000', {
    query: {
        clientVersion: CLIENT_VERSION,
        // 로컬에 저장된 id 정보를 같이 보냄
    },
});

socket.on('response', (data) => {
    
});

// 클라이언트에서 총합적으로 server에 보내주는걸 관리
export const sendEvent = (handlerId, payload) => {
    socket.emit('event', {
        userId: userInfo.uuid,
        clientVersion: CLIENT_VERSION,
        handlerId,
        payload,
    });
};