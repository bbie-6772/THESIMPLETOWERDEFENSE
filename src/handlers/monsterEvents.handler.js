import Monsters  from "../models/monsters.model.js";
import MonsterLifecycles  from "../models/monster.lifecycles.model.js";

// 수신된 메세지 처리.
export const receiveMonsterMessage = (io, socket) => {
  // 여기 문제 => const monsters = Monsters.getInstance(socket);
  // 리펙토링하면서 발견했다 ㅂㄷㅂㄷ.. 이부분 떄문에 .... 
  // 그래도 기왕 하는중이니깐 수정중. 
  const monsters = new MonsterLifecycles(io, socket);
  // 초기화.
  socket.on("monsterEventInit", (data) => {
    // 여기 문제 => monsters.monstersInitialization(data);
    // 야기 문제 => monsters.createMonster(io, 1000);
    monsters.respawnInitializer(data);
    monsters.spawnMonster(1000);
  });

  socket.on("respawnPong", (data) => {
    
  });


};
