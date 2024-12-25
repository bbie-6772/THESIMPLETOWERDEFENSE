export function chat(io) {

    // 클라이언트 연결 시 이벤트 처리
    io.on('connection', (socket) => {
        console.log('A client connected');

        // 클라이언트로부터 메시지를 받았을 때 처리
        socket.on('internalmessage', (data) => {
            // 해당 데이터에 id 있나?! 누가 들어왔지?!
            console.log('Received from client:', data);
            // 해당 데이터에 id 있나?!
            socket.emit('serverResponse', { message: data.message });
        });

        io.on('fullmessage', (data) => {
            console.log('full message : ', data);
            // 해당 데이터에 id 있나?!
            io.emit('serverResponse', { message: data.message });

        });

        socket.on('disconnect', () => {
            // 해당 데이터에 id 있나?! 누가 나갔지?!
            console.log('A client disconnected');
        });

        //nickname

        // 금칙어 서버에서
        let forbiddenword = [];

    });
}


