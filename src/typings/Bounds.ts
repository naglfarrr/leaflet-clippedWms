import { LatLngBounds } from 'leaflet';
import { Polygon } from './geometry/Polygon';

/**
 * 区域边界
 */
export class Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;

  constructor(minX: number, minY: number, maxX: number, maxY: number) {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  static createFromArray(bbox: number[]): Bounds {
    // 验证元素个数
    if (bbox.length !== 4) {
      throw new Error('Bounds.create() 参数 bbox 的元素个数必须为 4');
    }
    return new Bounds(bbox[0], bbox[1], bbox[2], bbox[3]);
  }

  static createFromLatLngBounds(latLngBounds: LatLngBounds): Bounds {
    return new Bounds(latLngBounds.getWest(), latLngBounds.getSouth(), latLngBounds.getEast(), latLngBounds.getNorth());
  }

  asPolygon(): Polygon {
    return Polygon.createFromArray([
      [
        [this.minX, this.minY],
        [this.minX, this.maxY],
        [this.maxX, this.maxY],
        [this.maxX, this.minY],
        [this.minX, this.minY],
      ],
    ]);
  }
}
