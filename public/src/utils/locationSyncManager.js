//====================================================================================================================
//====================================================================================================================
// public/src/utils/locationSyncManager.js
// js for location update sync in client
//====================================================================================================================
//====================================================================================================================

// 동기화 매니저 클래스화
export class LocationSyncManager {
  // 
  constructor(socket, syncInterval = 50) {
    this.socket = socket; // Socket.IO 클라이언트 인스턴스
    this.syncInterval = syncInterval; // 동기화 주기 (ms)
    this.localPosition = { x: 0, y: 0 }; // 로컬 플레이어 위치
    this.otherPlayers = {}; // 다른 플레이어의 위치 데이터
    this.syncTimer = null; // 동기화 주기를 관리할 타이머
  }

  // 초기화 함수
  initialize() {
    // 서버에서 위치 데이터를 수신
    this.socket.on("updatePositions", (positions) => {
      this.otherPlayers = positions;
    });

    // 서버로부터 연결 확인 메시지
    this.socket.on("connected", () => {
      console.log("Connected to server!");
    });

    // 동기화 시작
    this.startSync();
  }

  // 위치 동기화 시작
  startSync() {
    // 이미 실행 중인 경우 방지
    if (this.syncTimer) return;

    this.syncTimer = setInterval(() => {
      this.sendLocalPosition();
    }, this.syncInterval);
  }

  // 위치 동기화 종료
  stopSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  // 서버로 로컬 플레이어의 위치 전송
  sendLocalPosition() {
    this.socket.emit("updatePosition", this.localPosition);
  }

  // 로컬 플레이어 위치 업데이트
  updateLocalPosition(input) {

  }

  // 다른 플레이어들의 위치를 화면에 렌더링
  renderOtherPlayers(ctx) {

  }

  // 로컬 플레이어 위치를 화면에 렌더링
  renderLocalPlayer(ctx) {

  }
}
