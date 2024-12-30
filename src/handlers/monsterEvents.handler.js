import MonsterLifecycles  from "../models/monster.lifecycles.model.js";
import MonsterStorage from "../models/monsterStorage.model.js";

// 수신된 메세지 처리.
export const receiveMonsterMessage = (io, socket) => {
  const monsters = new MonsterLifecycles(io, socket);
  // 초기화.
  socket.on("monsterEventInit", (data) => {
    monsters.respawnInitializer(data);
    monsters.spawnMonster(1000);
    monsters.sendRespawnPing();
  });

  // 데미지 체크 테스트
  socket.on("monsterDamageMessage", (data) => {
    monsters.updateMonsterHealth(data.uuid, data.damage);
  });

};
