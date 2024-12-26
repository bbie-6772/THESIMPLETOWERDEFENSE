import { CLIENT_VERSION } from "../constant.js"
import handlerMappings from "./handler.Mapping.js"
import { prisma } from "../init/prisma.js";
import { addUser, getUser } from "../models/users.js";
import jwt from "jsonwebtoken";

export const handleConnection = async (socket) => {
    try {
        const information = socket.handshake.query
        const authorization = information.accessToken
        const [tokenType, token] = authorization.split(' ');

        //클라이언트 버전 확인
        if (!CLIENT_VERSION.includes(information.clientVersion)) {
            socket.emit('connection', {
                status: "fail",
                message: "Client version not found"
            });
            return;
        }

        // token이 비어있거나(없는 경우) tokenType이 Bearer가 아닌경우
        if (!token || tokenType !== 'Bearer') {
            socket.emit('connection', {
                status: "fail",
                message: "Not a valid account"
            });
            return;
        }

        // 토큰 검증
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        //JWT 토큰에서 가져온 사용자 정보를 이용해서 데이터베이스에서 해당 사용자가 실제로 존재하는지 확인하는 작업
        const loginUser = await prisma.users.findUnique({ where: { id: decoded.id } });
        // 사용자 정보가 데이터베이스에 없는 경우
        if (!loginUser) {
            socket.emit('connection', {
                status: "fail",
                message: "Can't find account please log-in again "
            });
            return; ``
        }

        //유저 추가
        addUser(loginUser.id, loginUser.nickname)

        console.log(loginUser.id, "접속")

        //유저와 연결되면 클라이언트에게 인터페이스 용 값 전달
        socket.emit('connection', [loginUser.id, loginUser.nickname, loginUser.highScoreS, loginUser.highScoreM])

    } catch (err) {
        console.log(err)
        socket.emit('connection', {
            status: "fail",
            message: "Not a valid token"
        });
        return;
    }
}

export const handleDisconnect = (socket, uuid) => {

}

export const handlerEvent = (io, socket, data) => {

    console.log(data)
    //클라이언트 버전 확인
    if (!CLIENT_VERSION.includes(data.clientVersion)) {
        socket.emit('response', {
            status: "fail",
            message: "Client version not found"
        });
        return;
    }

    const user = getUser(data.userId)
    if (!user) {
        socket.emit('response', {
            status: "fail",
            message: "User not found"
        });
        return;
    }

    const handler = handlerMappings[data.handlerId]
    if (!handler) {
        socket.emit('response', {
            status: "fail",
            message: "Handler not found"
        })
        return;
    }

    const response = handler(data.userId, data.payload)

    // 서버 전 유저에게 알림
    if (response.broadcast) {
        io.emit('response', response);
        return;
    }
    // 대상 유저에게만 보냄
    socket.emit('response', [data.handlerId, response]);
}
