import { CLIENT_VERSION } from "../constant.js"
import handlerMappings from "./handler.Mapping.js"
import { getRanking, loadRanking } from "../models/ranking.model.js"

export const handleConnection = (socket, userInfo) => {

    //유저와 연결되면 uuid를 메세지로 전달
    socket.emit('connection', userInfo )
}

export const handleDisconnect = (socket, uuid) => {

}

export const handlerEvent = (io, socket, data) => {
    loadRanking()
    //클라이언트 버전 확인
    if (!CLIENT_VERSION.includes(data.clientVersion)) {
        socket.emit('response', { 
            status: "fail",
            message: "Client version not found"
        });
        return;
    }

    const handler = handlerMappings[data.handlerId]
    if (!handler) {
        socket.emit('response', {
            status : "fail",
            message: "Handler not found"
        })
        return;
    }

    const response = handler(data.userId, data.payload);

    // 디버깅용 확인
    // if (response.status !== "success") console.log(response)

    io.emit('rank', getRanking())
    // 서버 전 유저에게 알림
    if (response.broadcast) {
        io.emit('response', response);
        return;
    }
    // 대상 유저에게만 보냄
    socket.emit('response', response);
}
