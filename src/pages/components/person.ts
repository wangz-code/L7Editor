// ==================== 核心处理函数 ====================
export function createWestPolygon(originalFeature: any, distance = 0.015) {  // distance 控制间距和大小
  const coords = originalFeature.geometry.coordinates[0]; // 假设是 Polygon
  if (!coords) return null;

  // 计算原始面的大致宽度（经度跨度）
  let minLng = Infinity, maxLng = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;

  coords.forEach(([lng, lat]: [number, number]) => {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });

  const width = maxLng - minLng;     // 原始宽度
  const height = maxLat - minLat;    // 原始高度

  // 在西边新建一个差不多大的矩形（可微调）
  const newMinLng = minLng - width - distance;   // 西边偏移
  const newMaxLng = newMinLng + width;
  const newMinLat = minLat;
  const newMaxLat = maxLat;

  const newPolygon = {
    type: 'Feature',
    properties: {
      ...originalFeature.properties,
      name: '西侧新建面',
      color: '#ff4d4f'
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [newMinLng, newMinLat],
        [newMaxLng, newMinLat],
        [newMaxLng, newMaxLat],
        [newMinLng, newMaxLat],
        [newMinLng, newMinLat]   // 闭合
      ]]
    }
  };

  return newPolygon;
}