import Monsters  from "../models/monsters.model.js";
import MonsterStorage from "../models/monsterStorage.model.js"

// 수신된 메세지 처리.
export const receiveMonsterMessage = (io, socket) => {
  const monsters = Monsters.getInstance(socket);
  // 초기화.
  socket.on("monsterEventInit", (data) => {
    console.log("여긴오나요?")
    monsters.monstersInitialization(data);
    monsters.createMonster(io, 1000);
  });


  // 테스트3 - 테스트입니다 지울예정
  socket.on("monsterDamageMessage", (data) => {
    console.log("여긴 오니?");
    console.log(data)
    monsters.setMonsterHealth(data.uuid, data.damage);
  });

  // 테스트4 - 테스트입니다 지울예정
  socket.on("monsterInfoMessage", (data) => {
    socket.emit(data.message.gameId, {
      message : {
        eventName : "monsterInfoMessage",
        data : MonsterStorage.getInstance().getInfo(data.message.gameId),
      }
    });
  });


  
  //monsterInfoMessage

  // 테스트5.

  
};
