# gameMapDocs.md
위치 동기화에 대한 문서

<br>

---

<br>

> #### 1224 이동 동기화 피드백

2가지 방법 중 선택

#### 1. frame rate 로 업데이트

- 100ms framerate로 시작해서 점차 줄여가면서 최적화 시도
- 주기적 broadcasting으로 부하가 생기는 defect
- 프레임을 낮추게 되면 뚝뚝 끊기는 현상
- - 클라이언트 단에서의 보정 필요 -> lerp 선형 보간


#### 2. 목적지 단위 업데이트

- simple map이기 때문에 가능