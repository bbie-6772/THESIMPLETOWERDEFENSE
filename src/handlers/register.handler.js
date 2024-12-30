//uuid 생성 버전4 
import { generatePath } from "../init/pathGenerator.js";
import { handleConnection, handleDisconnect, handlerEvent } from "./helper.js";
import { ready } from "./helper.js";

const registerHandler = (io) => {
    // 모든 유저가 '연결' 시 콜백함수 실행
    io.on('connection', (socket) => {
        // 만든 유저 정보를 클라이언트로 전달
        handleConnection(socket);

        // '이벤트' 발생 시 맵핑 실행
        socket.on('event', (data) => handlerEvent(io, socket, data));
        // 유저가 '연결해제' 시 실행
        socket.on('disconnect', () => handleDisconnect(socket))
        // 
        socket.on("ready", (data) => ready(io, socket, data))
    })
}

export default registerHandler
