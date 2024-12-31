import MonsterLifecycles from "../models/monster.lifecycles.model.js";
import MonsterStorage from "../models/monsterStorage.model.js";

// 수신된 메세지 처리.
export const receiveMonsterMessage = (io, socket) => {
  const monsterStorage = MonsterStorage.getInstance();
  const monsters = new MonsterLifecycles(io, socket);

  // 초기화.
  socket.on("monsterEventInit", (data) => {
    //#region 테스트 로그
    console.log("[MEH/TEST] data.message.gameId: ", data.message.gameId);
    console.log("[MEH/TEST] monsterStorage.getInfo(data.message.gameId) is null? : ", monsterStorage.getInfo(data.message.gameId) == null);
    //#endregion

    const roomCount = Object.keys(monsterStorage.getInfo(data.message.gameId)).length;
    
    if (roomCount === 0) {
      monsters.respawnInitializer(data);
      monsters.spawnMonster();
    } else {
      monsters.eventNameInitializer(data);
      socket.emit("monsterEventInit", monsterStorage.getInfo(data.message.gameId));
    }
    monsters.sendRespawnPing();
  });

  // 데미지 체크 테스트
  socket.on("monsterDamageMessage", (data) => {
    monsters.updateMonsterHealth(data.uuid, data.damage);
  });

};
