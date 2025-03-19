import { CLIENT_VERSION } from "./constants.js";
import {
  updateRooms,
  updateRoomInfo,
  updateUser,
  gameStart,
  exitRoom,
  updateUserInfo,
  updateRank,
  getCountBar
} from "../../lobby.js";
import { settingAttack } from "../model/towerBase.model.js";
import { removeTower, setNewTower, sellTower } from "../model/tower.js";
import { setUserGold, MonsterCount } from "../model/userInterface.model.js";

let userId = null;
let nickname = null;
let highScoreS = null;
let highScoreM = null;
let roomId = null;
let monsterCount = null;

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
    updateRank(data[5], data[6])
  }
});

socket.on("response", (data) => {
  // 타워 핸들러
  if (data[1]?.status === "fail") return;

  if(data[0] === 4001){
    // data[1] : { gold, tier, towerId, userId, x, y }
    var { gold, tier, towerId, uuid, x, y } = data[1];
    setNewTower(data[1]);
    if(uuid === userId)
      setUserGold(gold);
  } 

  if(data[0] === 3001){
    // 타워 합성 핸들러
    // data[1] : { uuid, towerId, tier, x, y, removeX, removeY }
    const { uuid, towerId, tier, x, y, rx, ry } = data[1];
    // 기존 타워 삭제
    removeTower(x, y);
    removeTower(rx, ry);
    // 상위 타워 생성
    setNewTower({towerid : towerId, x : x, y : y, tier: tier});
  } else if(data[0] === 3002){
    // 타워 강화 핸들러
    // data[1] : { level, remainGold, towerId, uuid }
    const { level, remainGold, towerId, uuid } = data[1];
    setUserGold(remainGold);
  } 
  else if (data[0] === 3003) {
    const { newGold, x, y } = data[1];
    //타워 판매 핸들러
    sellTower(x, y, newGold);
  }
});

socket.on("ready", (data) => {
  alert(data.message);
  if (data.status === "start") gameStart();
});

// #endregion

socket.on("room", (data) => {
  updateUser(data);
});

socket.on("selltower", (data) => {
  const { x, y} = data;
  console.log(data);
  // 기존 타워 삭제
  removeTower(x, y);
});

socket.on("attack", (data) => {
  settingAttack(data);
});

// 방이 파괴되었을 시 
socket.on('leaveRoom', (data) => {
  roomId = null
  monsterCount = null
  exitRoom()
  socket.emit('leaveRoom', { roomId: data.roomId })
}) 

socket.on("gold", (data) => {
  if(data.user1 === userId){
    setUserGold(data.gold1);
  }else if(data.user2 === userId){
    setUserGold(data.gold2);
  }
})

// 클라이언트에서 총합적으로 server에 보내주는걸 관리
export const sendEvent = async (handlerId, payload) => {
  const log = await new Promise((resolve, reject) => {
    socket.emit("event", {
      userId,
      token,
      handlerId,
      clientVersion: CLIENT_VERSION,
      payload,
    });

    socket.once("response", (data) => {
      if (data[1]?.status === "fail") {
        alert(data[1].message);
        return resolve(false);
      }
      // 방 입장 핸들러
      if (data[0] === 1001) {
        updateRoomInfo(data[1].room);
        updateUser(data[1].room);
        monsterCount = new MonsterCount(data[1].room.monsterCount, getCountBar())
        monsterCount.updateCountBar()
        roomId = data[1].room.gameId
        // 방 로딩 핸들러
      } else if (data[0] === 1002) {
        updateRooms(data[1].rooms);
      }
    
      return resolve(true);
    });
  });
return log;
};

socket.on("monsterCount", (data) => {
  if (monsterCount) monsterCount.update(data)
})

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

export const getUserId = () => {
  return userId;
}