# THESIMPLETOWERDEFENSE
타워 디펜스 



<br><br>

## IDE/language/technology stack
- IDE: VSCode
- runtime env: Node
- main framework: express, socketIO
- package manager: yarn
- DB: MySQL w. AWS RDS
- ORM: Prisma

<br>

## 프로젝트 세팅
```cmd
# yarn 초기화
yarn init -y

# 사용할 라이브러리들
yarn add express prisma @prisma/client cookie-parser jsonwebtoken

# DevDependency로 설치할 라이브러리
yarn add -D nodemon

# prisma 초기화
npx prisma init

# 프로젝트에 schema.prisma에 정의된 테이블을 MySQL에 생성
npx prisma db push

```

## WBS

jyko1101@gmail.com 's Tasks
- 8자 맵 구현
- 몬스터 이동 / 위치 동기화
- 몬스터 상태이상(경직) 이벤트