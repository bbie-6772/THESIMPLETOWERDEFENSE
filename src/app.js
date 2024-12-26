import express from "express";
import { createServer } from "http";
import initSocket from "./init/socket.js";
import { loadGameAssets } from "./init/assets.js";
import userRouter from "./routes/user.router.js";

const app = express();
const server = createServer(app);

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
initSocket(server);

/* 라우터 경로 배정 */
app.use("/api", userRouter);


server.listen(PORT, async () => {
  console.log("Server is running on PORT: " + PORT);

  try {
    // 서버 구동 시에 게임 Data Table 로드
    const assets = await loadGameAssets();

    console.log(assets);
  } catch (err) {
    console.error("Failed to load game assets: " + err.message);
  }
});
