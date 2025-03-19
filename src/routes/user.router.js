import express from "express";
import { prisma } from "../init/prisma.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

//환경 변수 파일(.env)을 로드
dotenv.config();

const router = express.Router();

// 회원가입 API
router.post("/sign-up", async (req, res) => {
    try{
        const { id, pw, pwCheck, nickname } = req.body; // 요청 본문에서 입력 데이터를 추출합니다.

        // 아이디 형식을 검증하는 정규식
        // 영어 소문자로 시작해 영어 소문자 + 숫자로 된 6~20자 
        const idRegex = /^[a-z]+[a-z0-9]{5,19}$/g;

        const pwRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{6,}$/;
        // 비밀번호가 영어 소문자, 숫자, 특수기호를 포함하고 6자 이상인지 확인하는 정규식

        // 아이디 형식 유효성 검증
        if (!id || !idRegex.test(id)) return res
            .status(400)
            .json({ errorMessage: "아이디는 영어 소문자, 숫자로 이루어진 6~20 글자로 작성해주세요" });

        // 비밀번호 유효성 검증
        if (!pw || !pwRegex.test(pw)) return res
            .status(400)
            .json({ errorMessage: "비밀번호는 영어 소문자, 숫자, 특수기호 하나 이상 혼합하여 6자 이상으로 작성해주세요"});

        // 비밀번호 확인 입력 여부 검증
        if (!pwCheck) return res
            .status(400)
            .json({ errorMessage: "비밀번호 확인란을 작성해주세요" });

        // 비밀번호와 비밀번호 확인 값 일치 여부 검증
        if (pw !== pwCheck)return res
            .status(401)
            .json({ errorMessage: "비밀번호가 일치하지 않습니다" });

        // 이미 동일한 아이디가 존재하는지 데이터베이스에서 확인.
        const isExistUser = await prisma.users.findFirst({ where: { id } });
        // 중복된 아이디가 있으면 409 상태 코드와 에러 메시지를 반환.
        if (isExistUser) return res
            .status(409)
            .json({ errorMessage: "이미 존재하는 아이디입니다" });

        // 닉네임 중복 확인
        const isExistUserByNickname = await prisma.users.findFirst({where: { nickname }});
        if (isExistUserByNickname) return res
            .status(409)
            .json({ errorMessage: "이미 존재하는 닉네임입니다" });

        // 비밀번호를 암호화(bcrypt 사용)하여 저장.
        const hashedPassword = await bcrypt.hash(pw, 10);

        // user 생성
        const user = await prisma.users.create({
            data: {
                id, 
                password: hashedPassword,
                nickname,
            }
        });

        // 성공 시 사용자 정보를 포함하여 응답 반환
        return res
            .status(201)
            .json({
                message: "회원가입이 완료되었습니다",
                nickname: user.nickname, 
            });

    } catch (error) {
        // 에러를 콘솔에 출력
        console.error(error); 
        // 서버 에러 메시지 반환
        return res
            .status(500)
            .json({ errorMessage: "서버 에러" }); 
    }
})

// 로그인 API
router.post("/sign-in", async (req, res) => {
    try {
        // 요청 본문에서 아이디와 비밀번호를 추출
        const { id, pw } = req.body; 

        // 데이터베이스에서 아이디를 기준으로 사용자 조회
        const user = await prisma.users.findFirst({ where: { id } });
        // 사용자가 존재하지 않을 경우 404 상태 코드와 에러 메시지 반환
        if (!user) return res
            .status(404)
            .json({ errorMessage: "아이디 또는 비밀번호가 틀렸습니다" });

        // 입력된 비밀번호와 데이터베이스의 암호화된 비밀번호를 비교
        const isPasswordValid = await bcrypt.compare(pw, user.password);
        // 비밀번호가 일치하지 않으면 401 상태 코드와 에러 메시지 반환
        if (!isPasswordValid) return res
            .status(401)
            .json({ errorMessage: "아이디 또는 비밀번호가 틀렸습니다" });

        // 비밀번호가 일치하면 JWT 생성
        // JWT 페이로드에 사용자 아이디 사용
        const token = jwt.sign({id: user.id},
            process.env.SECRET_KEY, 
            { expiresIn: "3h" }
        );

        // 성공 시 헤더에 authorization 토큰 추가
        res.setHeader("authorization", `Bearer ${token}`);
        // 로그인 성공 메시지와 사용자 키 반환

        return res
            .status(200)
            .json({message: "로그인 되었습니다"});
            
    } catch (error) {
        // 에러를 콘솔에 출력
        console.error(error); 
        // 서버 에러 메시지 반환
        return res
            .status(500)
            .json({ errorMessage: "서버 에러" }); 
    }
});

export default router