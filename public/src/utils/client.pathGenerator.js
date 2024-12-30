//====================================================================================================================
//====================================================================================================================
// js for location update sync in client
//====================================================================================================================
//====================================================================================================================
export const tmpGeneratePath = () => {
  const path = [];
  // 캔버스 위치로 snapping 현재 canvas width="1920" height="1080" 고려, 임시로 하드코딩 >> 추후 config로 설정값 관리 리팩토링 필요
  const basePoint = { x: 100, y: 100 };
  const incremWidth = (1920 * (8 / 10)) / 2;
  const incremHeight = 1080 * (8 / 10);
  // 순차적으로 가야하는 sequnece
  const simplifiedSequence = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0, y: 0 },
  ];
  const processedSequence = simplifiedSequence.map(point => ({
      x: basePoint.x + point.x * incremWidth,
      y: basePoint.y + point.y * incremHeight
  }));
  for (let point of processedSequence) {
      path.push(point);
      // 테스트 로그
      console.log("Sequence : ", JSON.stringify(point));
  }
  return path;
}