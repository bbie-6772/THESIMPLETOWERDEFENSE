import { CLIENT_VERSION } from "./constants.js";
import {
  updateRooms,
  updateRoomInfo,
  updateUser,
  gameStart,
  exitRoom,
  updateUserInfo,
} from "../../lobby.js";
import Monsters from "../model/monsterSpawner.js";
import { settingAttack } from "../model/towerBase.model.js";
import { removeTower, setNewTower } from "../model/tower.js";
import { updateLocationSync } from "../utils/client.LocationSync.js";

let userId = null;
let nickname = null;
let highScoreS = null;
let highScoreM = null;
let roomId = null;

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

socket.once("connection", (data) => {
  if (data.status === "fail") {
    alert("다시 로그인 해주세요!");
    window.location.href = "login.html";
  } else {
    // 값 저장
    [userId, nickname, highScoreS, highScoreM] = data;
    // 방 목록 업데이트
    updateRooms(data[4]);
    updateUserInfo(nickname,highScoreS,highScoreM)
  }
});

socket.on("response", (data) => {
});

socket.on("ready", (data) => {
  alert(data.message);
  if (data.status === "start") gameStart();
});

// #region 위치동기화 받기
socket.on("locationSync", (data) => {
  // validation
  if (!data || !Array.isArray(data.data)) {
    console.error("[LocationSync/Error] Invalid data format.");
    return;
  }
  // 몬스터 데이터
  const monsters = data.data;
  console.log("[LocationSync/Received] monsters: ", monsters);

  // 게임 로직으로 위치 동기화
  updateLocationSync(monsters);
});
// #endregion


socket.on("room", (data) => {
  updateUser(data);
});

socket.on("attack", (data) => {
  settingAttack(data);
});

// 방이 파괴되었을 시 
socket.on('leaveRoom',(data) => {
  roomId = null
  exitRoom()
  socket.emit('leaveRoom', { roomId: data.roomId })
})

// 클라이언트에서 총합적으로 server에 보내주는걸 관리
export const sendEvent = async (handlerId, payload) => {
  const log = await new Promise((resolve, reject) => {
    console.log("보냄")
    socket.emit("event", {
      userId,
      token,
      handlerId,
      clientVersion: CLIENT_VERSION,
      payload,
    });

    const loadError = setTimeout(() => {
      alert("서버와 연결이 원할하지 않습니다");
      return reject(false);
    }, 2000);

    socket.once("response", (data) => {
      if (data[1]?.status === "fail") {
        alert(data[1].message);
        clearTimeout(loadError);
        return resolve(false);
      }
      // 방 입장 핸들러
      if (data[0] === 1001) {
        updateRoomInfo(data[1].room);
        updateUser(data[1].room);
        roomId = data[1].room.gameId
        // 방 로딩 핸들러
      } else if (data[0] === 1002) {
        updateRooms(data[1].rooms);
      }
      if(data[0] === 3001){
        try{
          // 타워 합성 핸들러
          // data[1] : { uuid, type, tier, x, y, removeX, removeY }
          const payload = data[1];
          console.log(payload);
          const { uuid, towerId, tier, x, y, rx, ry } = data[1];
          // 기존 타워 삭제
          removeTower(x, y);
          removeTower(rx, ry);
          // 상위 타워 생성
          setNewTower({towerid : towerId, x : x, y : y, gold : 0, tier: tier});
        }catch(err){
          console.log(err);
        }
      }else if(data[0] === 3002){
        // 타워 강화 핸들러
        // data[1] : {}
        console.log(data[1]);
      }
      // 타워 핸들러
      if(data[0] === 4001){
        setNewTower(data[1]);
      } 
      clearTimeout(loadError);
      return resolve(true);
    });
  });
  return log;
};

// 준비 신호
export const ready = (roomId, single) => {
  socket.emit("ready", {
    userId,
    token,
    clientVersion: CLIENT_VERSION,
    roomId,
    single,
  });
};

export const getSocket = () => {
  return socket;
};

export const getRoom = () => {
  return roomId
}

