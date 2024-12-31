import LocationSyncManager from "../manager/LocationSyncManager.js";
import MonsterLifecycles from "../models/monster.lifecycles.model.js";
import MonsterStorage from "../models/monsterStorage.model.js";

// 수신된 메세지 처리.
export const receiveMonsterMessage = (io, socket) => {
  const monsterStorage = MonsterStorage.getInstance();
  const monsters = new MonsterLifecycles(io, socket);
  //#region  locationSyncManager 추가
  // const locationSyncManager = new LocationSyncManager(io, socket);
  //#endregion
  // 초기화.
  socket.on("monsterEventInit", (data) => {

    console.log(data.message.gameId);

    const roomCount = Object.keys(monsterStorage.getInfo(data.message.gameId)).length;
    
    if (roomCount === 0) {
      monsters.respawnInitializer(data);
      monsters.spawnMonster();
    } else {
      monsters.eventNameInitializer(data);
      socket.emit("monsterEventInit", monsterStorage.getInfo(data.message.gameId));
    }

    monsters.monsterDamageMessage();
    monsters.sendRespawnPing();

    //#region locationSyncManager 싱크 시작
    LocationSyncManager.getInstance().startSync(data);
    //#endregion

  });

  return monsters;

};
