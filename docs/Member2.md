# 구현 기능

- 회원가입

- 로그인

- 랭킹 조회

- 멀티플레이 룸

- 몬스터 수 확인

## 기능

### 회원가입

기존의 REST API 통신을 이용한 회원가입 기능을 가져와 변환하여 사용하였음

클라이언트와 연결 시키기 위해 register.html 도 같이 디자인 함

클라이언트 내부에선 fetch를 통해 api를 호출하여 사용하였음

```html
<script type="module">
// 백엔드 API 주소
const API_BASE_URL = 'http://localhost:3000/api'; 

document.getElementById("register").addEventListener("click", async (event) => {
    const id = document.getElementById("username").value;
    const pw = document.getElementById("password").value;
    const pwCheck = document.getElementById("passwordCheck").value;
    const nickname = document.getElementById("nickname").value;

    try {
    // API 요청
    const response = await fetch(`${API_BASE_URL}/sign-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pw, pwCheck, nickname }),
    });

    // 결과 확인
    const result = await response.json();
    if (response.ok) {
        alert(result.message);
        window.location.href = "login.html";
    // 회원가입 실패 시 이유를 클라이언트에게 전달
    } else {
        alert(result.errorMessage)
    }

    } catch (error) {
    alert('오류가 발생했습니다.');
    console.error(error);
    }
});
</script>
```

### 로그인

- 로그인 시 회원가입과 마찬가지로 fetch를 이용해 서버와 통신을 하였음

- 로그인에 성공 시 받은 엑세스 토큰을 저장하기 위해 로컬 스토리지를 사용하였음

```jsx
// 결과 확인
const result = await response.json();
if (response.ok) {
    alert(result.message);
    // showAlert("알림", result.message);
    // 로컬 스토리지에 적용  
    localStorage.setItem('access-Token', response.headers.get("authorization"));

    // 로그인 성공으로 lobby 이동
    window.location.href = "lobby.html";
} else {
    // alert(result.errorMessage);
    showAlert("알림", result.message);
}
```

- 추가로 socket 통신을 통해 사용자 검증을 할 수 있도록  
클라이언트의 socket.js 에서 token을 읽어 서버 연결 시 보내도록 설계함

```jsx
/* socket.js */
const token = localStorage.getItem("access-Token");
// 로그인이 안되어있을 시 로그인 창으로
if (!token) {
  alert("로그인이 필요한 서비스 입니다!");
  window.location.href = "./login.html";
}

// localhost:3000 에 서버를 연결하여 값을 넘겨줌
const socket = io("http://localhost:3000", {
  query: {
    clientVersion: CLIENT_VERSION,
    // 엑세스 토큰을 줘서 사용자 로그인 여부 확인
    accessToken: token,
  },
});
```

- 또한 서버에 요청 할 때마다 토큰과 아이디를 보내 검증할 수 있도록 서버의 helper.js 핸들러에 검증 함수를 추가함

```jsx
const Auth = (data) => {
    try {
        //클라이언트 버전 확인
        if (!CLIENT_VERSION.includes(data.clientVersion)) {
            socket.emit('response', {
                status: "fail",
                message: "Client version not found"
            });
            return false;
        }
        const [tokenType, token] = data.token.split(' ');
        // token이 비어있거나(없는 경우) tokenType이 Bearer가 아닌경우
        if (!token || tokenType !== 'Bearer') {
            socket.emit('connection', {
                status: "fail",
                message: "Not a valid account"
            });
            return false ;
        }
        // 토큰 + 사용자 검증
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (data.userId !== decoded.id) {
            socket.emit('response', {
                status: "fail",
                message: "Not valid Id"
            });
            return false;
        }
        // 서버 접속 유무 확인
        const user = getUser(data.userId)
        if (!user) {
            socket.emit('response', {
                status: "fail",
                message: "User not found"
            });
            return false;
        }
        return true
    } catch (err) {
        console.log(err)
        socket.emit('connection', {
            status: "fail",
            message: "Not a valid token"
        });
        return false;
    }
}
```

### 랭킹 조회

- 클라이언트가 서버에 소켓으로 연결되었을 시
데이터를 가져올 수 있도록 prisma로 값을 불러와 줄 수 있도록 구현하였음

```jsx
const soloRank = await prisma.ranks.findMany({
    where: { userId2: null},
    orderBy: [{
        score: 'desc',
    }], 
    // 줄 때 사용자 id가 아닌 닉네임을 줄 수 있도록
    select: {
        user1: { select: { nickname: true } },
        score: true
    },
    take: 10 
})

const multiRank = await prisma.ranks.findMany({
    where: { userId2: { not: null} },
    orderBy: [{
        score: 'desc',
    }],
    select: {
        user1: {select : { nickname: true }},
        user2: {select: { nickname: true } },
        score: true
    },
    take: 10 
})
```

- 이를 화면에 보이게하기 위해 부트스트랩의 fixed 속성을 사용하였음 (+ 추가로 사용자 정보도 보일 수 있도록 설정)

```html
<div class="fixed-top p-3 d-flex justify-content-between" style="pointer-events: none">
        <div class="user-profile-card">
            <div class="d-flex align-items-center">
                <div>
                    <h5 class="nickname mb-1" id="nickname">닉네임</h5>
                    <p class="high-score mb-0" id="highScoreS">최고 점수(싱글)</p>
                    <p class="high-score mb-0" id="highScoreM">최고 점수(협동)</p>
                </div>
            </div>
        </div>
        <div class="ranking-card">
            <div class="d-flex align-items-center">
                <div>
                    <h5 class="nickname mb-1" id="soloRank">TOP 10(싱글)</h5>
                    <h5 class="nickname mb-1" id="multiRank">TOP 10(협동)</h5>
                </div>
            </div>
        </div>
    </div>
```

### 멀티 플레이

- 멀티 플레이를 구현하기 위해 사용자들이 방을 생성, 참여할 수 있도록 클라이언트를 구현함

- 방 생성/참여 시 서버에 요청을 통해 성공하였을 시 방(모달)에 입장할 수 있도록 하였음

- 그렇게 참여한 방에만 서버가 데이터를 보낼 수 있도록
socket.join()과 socket.to() 기능을 사용함

- 방에 참여한 사용자가 방을 나가거나 연결이 끊어졌을 때(또는 강퇴되었을 때)  
서버에서 참여자가 호스트(생성자) 또는 참가자인지 여부를 통해  
방을 파기, 사용자만 방에서 제외 하도록 구현하였음
( 또한 게임이 시작되었을 경우엔 무조건 방이 파괴되도록)

- 방에 참여한 사용자가 준비/시작 을 통해 게임이 시작될 수 있도록 만들었음

## 트러블 슈팅

### 회원가입/로그인

- 클라이언트가 서버에 요청을 하고 값을 읽는 과정에서 cors 오류 ( 서로 다른 출처간의 리소스 요청 ) 를 방지 하기 위해 아래와 같은 코드를 app.js에 추가하였음

```jsx
//외부 출처의 요청을 허용
app.use(cors({ origin: "*" }))
```

### 게임 플레이

- 멀티 플레이를 구현하면서 제일 힘들었던 부분은 바로
**게임 실행** 이었다

- 게임 실행을 본래 html 파일로 분리하여 game.html 과 그에 종속된 game.js을 불러오도록 window.location.href를 사용했으나..

- 서버와 연결된 소켓이 초기화 된다는 오류가 있었다

- 그래서 game.html과 game.js를 lobby에 편입시켜야 했다

#### 게임 시작

- 게임 화면은 게임이 시작되고 보여야 하기 때문에 display : none 속성을 이용해 시작 전 게임 캔버스를 가렸다

- 게임 실행 로직은 game.js가 가지고 있기에 이를 게임이 시작 되었을 때 부를 수 있도록 import()를 사용했다

```jsx
// 게임 시작 
export const gameStart = () => {
    // 사용자 대기방 모달
    waitRoom.hide();
    import("./src/game.js")
    // 게임 화면
    gameFrame.style.display = "block"
}
```

### 게임 끝

- 게임이 끝나면 import한 js 파일을 삭제하여야 했는데 
이를 어떻게 구현해야하나 싶었다..

- 그러다 발견한 것이 변수에 할당하여 변수를 초기화 시켜주는 방법 이였다!

```jsx
// 게임 시작 
export const gameStart = () => {
    waitRoom.hide();
    import("./src/game.js").then( module => {
        game = module
    });
    gameFrame.style.display = "block"
}

// 게임 오버,끝
export const gameOver = () => {
    game = null
    gameFrame.style.display = "none"
}
```

- 이러면 game에 불러들인 game.js가 사라져 게임이 끝나게 된다!

## 후기

- 초기 설계를 최대한 많이했다고 생각했지만, 조금 미흡했었던 것 같아 아쉬웠습니다

- 하루마다 병합을 했는데 이 때 코드리뷰를 통해 각 코드들이 어떻게 동작하는지 공유되었으면 좋았을 것 같았습니다.

- 병합과정에서 트러블 슈팅을 하면서 여러 코드를 볼 수 있었던 건 좋았습니다