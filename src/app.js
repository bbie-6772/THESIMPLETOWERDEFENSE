import express from "express";
import { createServer } from 'http';
import initSocket from "./init/socket.js";
import { loadGameAssets } from "./init/assets.js";

const app = express();
const server = createServer(app)

const  PORT = 3000;

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static("public"))
initSocket(server)

server.listen(PORT, async () => {
    console.log('Server is running on PORT: ' + PORT)

    try {
        // 서버 구동 시에 게임 Data Table 로드
        const assets = await loadGameAssets();
    } catch (err) {
        console.error('Failed to load game assets: '+ err.message)
    }
})
