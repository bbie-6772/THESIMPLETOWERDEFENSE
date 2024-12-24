import express from "express";
import { createServer } from "http";
import initSocket from "./init/socket.js";
import { loadGameAssets } from "./init/assets.js";
import towerModel from "./models/tower.model.js";
import { getGameAssets } from "./init/assets.js";




const app = express();
const server = createServer(app);

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
initSocket(server);

server.listen(PORT, async () => {
  console.log("Server is running on PORT: " + PORT);

  try {
    // 서버 구동 시에 게임 Data Table 로드
    const assets = await loadGameAssets();

console.log(assets);

towerModel.addTower(1,0,0,1,1);
towerModel.addTower(1,0,1,1,1);
towerModel.addTower(1,0,2,1,1);
towerModel.addTower(1,0,3,1,1);
towerModel.addTower(1,0,3,1,1);
towerModel.addTower(1,0,3,1,1);
towerModel.addTower(2,0,3,1,1);
towerModel.addTower(3,0,3,1,1);
towerModel.addTower(2,0,3,1,1);

towerModel.removeUser(3);
towerModel.removeUsersTower(1,0,0);
console.log(towerModel.getTowers());
console.log(towerModel.getUsersTowers(1));
console.log(towerModel.getUsersTower(1,0,1));
 console.log(towerModel.currentTowerStat(1,0,1));







  } catch (err) {
    console.error("Failed to load game assets: " + err.message);
  }
});
