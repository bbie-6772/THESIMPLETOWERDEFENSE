import { CLIENT_VERSION } from "./constants.js";
import { updateRooms, updateRoomInfo, updateUser } from "../../lobby.js"

let userId = null;
let nickname = null;
let highScoreS = null;
let highScoreM = null;
let room = null;

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
        window.location.href = 'login.html';
    } else {
        // 값 저장
        [ userId, nickname, highScoreS, highScoreM]= data
        // 방 목록 업데이트
        updateRooms(data[4])
    }
});

socket.on("response", (data) => {
})

// 클라이언트에서 총합적으로 server에 보내주는걸 관리
export const sendEvent = async (handlerId, payload) => {

    const log = await new Promise((resolve, reject) => {
        socket.emit('event', {
            userId,
            token,
            handlerId,
            clientVersion: CLIENT_VERSION,
            payload
        });

        socket.once('response', (data) => {
            if (data[1]?.status === "fail") {
                alert(data[1].message)
                return resolve(false)
            }
            // 방 입장 핸들러
            if (data[0] === 1001) {
                updateRoomInfo(data[1].room)
                updateUser(data[1].room)
            }
            // 방 로딩 핸들러
            if (data[0] === 1002) {
                updateRooms(data[1].rooms)
            }
            return resolve(true)
        })


        
        setTimeout(reject,2000)
    })
    return log
};

export const getRoom = () => {
    return room
}