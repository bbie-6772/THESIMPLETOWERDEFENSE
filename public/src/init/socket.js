import { CLIENT_VERSION } from "./constants.js";

let userId = null;
let nickname = null;
let highScoreS = null;
let highScoreM = null;

const token = localStorage.getItem("access-Token")
// 로그인이 안되어있을 시 로그인 창으로
if (!token) {
    alert("로그인이 필요한 서비스 입니다!")
    window.location.href = './login.html';
}

// localhost:3000 에 서버를 연결하여 값을 넘겨줌
const socket = io('http://localhost:3000', {
    query: {
        clientVersion: CLIENT_VERSION,
        // 엑세스 토큰을 줘서 사용자 로그인 여부 확인
        accessToken: token
    },
});

socket.once('connection', (data) => {
    if (data.status === "fail") {
        alert("다시 로그인 해주세요!")
        window.location.href = './login.html';
    } else {
        // 값 저장
        [ userId, nickname, highScoreS, highScoreM ]= data
    }
});

socket.on("response", (data) => {
    
})

// 클라이언트에서 총합적으로 server에 보내주는걸 관리
export const sendEvent = (handlerId, payload) => {
    socket.emit('event', {
        userId,
        handlerId,
        payload
    });
};