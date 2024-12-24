import { Server as SocketIO } from 'socket.io';

const initSocket = (server) => {
    // 서버 생성
    const io = new SocketIO()
    // initSocket에 받은 server의 포트와 연결함
    io.attach(server)
    // 핸들러 등록
}

export default initSocket