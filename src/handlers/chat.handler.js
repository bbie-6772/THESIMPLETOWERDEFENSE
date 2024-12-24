export function chat(io) {

    // 클라이언트 연결 시 이벤트 처리
    io.on('connection', (socket) => {
        console.log('A client connected');

        // 클라이언트로부터 메시지를 받았을 때 처리
        socket.on('clientMessage', (data) => {
            console.log('Received from client:', data);
            //socket.emit('serverMessage', { message: 'Hello from server!' });
            socket.emit('serverResponse', { message: data.message });
        });

        socket.on('disconnect', () => {
            console.log('A client disconnected');
        });

        //nickname

        // 금칙어 서버에서
        let forbiddenword = [];

    });
}


