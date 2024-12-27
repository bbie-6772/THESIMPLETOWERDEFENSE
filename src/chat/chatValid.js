import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// 메시지 검증 함수
export async function validateMessage(message) {
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

        const result = chatCompletion.choices[0]?.message || "";
        console.log("내용 : ", result);

        if (!result) {
            return '반려: 결과가 없습니다.'; // 유효하지 않은 경우
        }

        return result;
    } catch (error) {
        console.error('Message validation error:', error);
        return false;
    }
}