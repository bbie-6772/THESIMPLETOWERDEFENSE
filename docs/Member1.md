## 타워 배치 및 타워 공격

 ### 타워 배치
 - 클라이언트에서 그리드상의 좌표 전송 ex) 0, 3
 - 비어있는 위치 인지 확인
 - 멀티인지 싱글인지에 따라서 포탑 위치를 확인
 - 유저 골드 확인
 - 랜덤 타워 생성 및 클라이언트에 응답
 
 ### 타워 공격
 - 룸 목록 조회
 - 유저 조회
 - 유저 타워 조회
 - 유저 소켓 조회
 - 몬스터 조회
 - 각 타워의 쿨다운 확인
 - 각 타워와 몬스터의 거리 확인
 - 범위 타워일 경우 목표가 된 몬스터와 다른 몬스터의 거리 확인
 - 몬스터 모달에 데미지 전송
 - 클라이언트에 공격 표시용 전송
 - 타워당 공격 횟수 확인

## 트러블 슈팅
타워 공격은 사실상 모든 정보를 조회하면서 다른 개발자의 변경에 많은 영향을 받았다.
초기에 데이터 받는 내용은 회의를 기반으로 하기는 했으나 정해진 내용은 아니었다.

  const rooms = getRoom(); -> const rooms = getRooms();

  const sockets = getsocket -> 소켓 연결시 인터벌 적용

  const monsters = getmonsters() -> const monsters = monsterStorage.getMonsters(rooms[roomsIndex].gameId);

  특히 몬스터는 예상했던 배열이 아닌 객체 형식임으로 키-값을 기반으로 수정을 했다.
  몬스터를 관리하는 모달이 따로 생성이 되어있었다.
  monstercycle 을 생성한 곳에서 return을 받아 사용했다.
  
  소켓 연결시 인터벌 적용을 하면서 받아왔다.

    let monstercycle = receiveMonsterMessage(io, socket);

    const towerAttackCondtorlIntervalId = setInterval(() => {
      towerAttackCondtorl(io, monstercycle);
    }, 300);


서버가 켜진 상태에서 계속 사용하면 서버에 많은 부하를 주는 인터벌이 계속 생성되는것을 확인했다.


    // 유저가 '연결해제' 시 실행
    socket.on("disconnect", () => {
      clearInterval(towerAttackCondtorlIntervalId);
      handleDisconnect(socket, io);
    });

유저 disconnect시에 인터벌 종료를 추가했다.


## 후기
연결된 내용을 여러사람이서 하도록 작업을 나눈 결과 모든 작업이 비효율적으로 돌아갔다.