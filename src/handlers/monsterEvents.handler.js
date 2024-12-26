import Monsters  from "../models/monsters.model.js";

// 수신된 메세지 처리.
export const receiveMonsterMessage = (io, socket) => {
  const monsters = Monsters.getInstance(socket);
  // 초기화.
  socket.on("monsterEventInit", (data) => {
    monsters.monstersInitialization(data);
    monsters.createMonster(io, 1000);
  });

  socket.on(monsters.eventName, (data) => {
    // 업데이트 로직.?
  });
};
