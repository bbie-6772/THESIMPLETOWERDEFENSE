import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();
process.noDeprecation = true;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let tempmsg = [];
// 메시지 검증 함수
async function validateMessage(message) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `다음 메시지가 적절한지 검사해주세요. 
                    부적절한 내용이 있다면 '반려'를, 그리고 부적절한 이유를 5글자 이하로 '반려' 뒤에 적어주세요.,
                    적절하다면 '승인'를 반환해주세요: "${message}"`,
                },
            ],
            model: "llama3-8b-8192",
        });

        const result = chatCompletion.choices[0]?.message?.content || "";

        const valid = result.includes('승인');
        if (!valid) {
            tempmsg = result.split('반려');
            console.log(result);
            console.log(tempmsg[1]);
        }

        return valid;
    } catch (error) {
        console.error('Message validation error:', error);
        return false;
    }
}

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('chat message', async (msg) => {
        try {
            const isValid = await validateMessage(msg);

            if (isValid) {
                // 메시지가 승인된 경우
                io.emit('chat message', {
                    type: 'approved',
                    message: msg
                });
            } else {
                // 메시지가 거부된 경우
                socket.emit('chat message', {
                    type: 'rejected',
                    message: `${tempmsg[1]}`
                });
            }
        } catch (error) {
            console.error('Error processing message:', error);
            socket.emit('chat message', {
                type: 'error',
                message: '메시지 처리 중 오류가 발생했습니다.'
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});
