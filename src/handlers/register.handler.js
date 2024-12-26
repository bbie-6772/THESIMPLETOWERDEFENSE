//uuid 생성 버전4 
import { handleConnection, handleDisconnect, handlerEvent } from "./helper.js";

const registerHandler = (io) => {
    // 모든 유저가 '연결' 시 콜백함수 실행
    io.on('connection', (socket) => {
        // 만든 유저 정보를 클라이언트로 전달
        handleConnection(socket)
        console.log("들어옴")

        // '이벤트' 발생 시 맵핑 실행
        socket.on('event', (data) => handlerEvent(io, socket, data));
        // 유저가 '연결해제' 시 실행
        socket.on('disconnect', () => handleDisconnect(socket))
    })
}

export default registerHandler
