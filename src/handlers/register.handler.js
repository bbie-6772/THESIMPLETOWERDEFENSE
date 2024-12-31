//uuid 생성 버전4
import { generatePath } from "../init/pathGenerator.js";
import { handleConnection, handleDisconnect, handlerEvent } from "./helper.js";
import { ready } from "./helper.js";
import { receiveMonsterMessage } from "./monsterEvents.handler.js";
import MonsterLifecycles from "../models/monster.lifecycles.model.js";
import LocationSyncManager from "../manager/LocationSyncManager.js";

const registerHandler = (io) => {
  // 모든 유저가 '연결' 시 콜백함수 실행
  io.on("connection", (socket) => {
    // 만든 유저 정보를 클라이언트로 전달
    handleConnection(socket);
    // '이벤트' 발생 시 맵핑 실행
    socket.on('event', (data) => handlerEvent(io, socket, data));
    // 유저가 '연결해제' 시 실행
    socket.on('disconnect', () => handleDisconnect(socket))
    // 준비
    socket.on("ready", (data) => ready(io, socket, data))
    // 삭제된 방에서 일괄 나가기
    socket.on('leaveRoom', (data) => socket.leave(data.roomId))
    //const monsterLifecycles = new MonsterLifecycles(io, socket);
    receiveMonsterMessage(io, socket);


    // #region LOCATION SYNC AND STOPSTNC
    // 동기화 시작
    socket.on('startSync', (data) => {
      LocationSyncManager.getInstance().startSync(data);
    });

    // 동기화 중지
    socket.on('stopSync', () => {
      LocationSyncManager.getInstance().stopSync();
    });
    // #endregion



    // '이벤트' 발생 시 맵핑 실행
    socket.on("event", (data) => handlerEvent(io, socket, data));
    // 유저가 '연결해제' 시 실행
    socket.on("disconnect", () => handleDisconnect(socket));
  });
};

export default registerHandler;
