import { simplify } from '@turf/turf';
import { Point } from './Point';
import { LineString } from './LineString';

export class Polygon implements Polygonal {
  private rings: LineString[];

  private constructor(rings: LineString[]) {
    this.rings = rings;
  }

  static createFromGeoJSON(geojson: GeoJSON.Polygon): Polygon {
    const rings = geojson.coordinates.map((ring) => {
      const points = ring.map((point) => {
        return Point.create(point);
      });
      return new LineString(points);
    });
    return new Polygon(rings);
  }

  static createFromArray(array: number[][][]): Polygon {
    const rings = array.map((ring) => {
      const points = ring.map((point) => {
        return Point.create(point);
      });
      return new LineString(points);
    });
    return new Polygon(rings);
  }

  asArray(): number[][][] {
    return this.rings.map((ring) => {
      return ring.points.map((point) => {
        return [point.x, point.y];
      });
    });
  }

  asGeoJSON(): GeoJSON.Polygon {
    // const coordinates = this.rings.map((ring) => {
    //   return ring.points.map((point) => {
    //     return [point.x, point.y];
    //   });
    // });
    return {
      type: 'Polygon',
      coordinates: this.asArray(),
    };
  }

  asWkt(): string {
    return `POLYGON${this.wktWithoutTitle()}`;
  }

  wktWithoutTitle(): string {
    const coordinates = this.rings.map((ring) => {
      return ring.points.map((point) => {
        return `${point.x} ${point.y}`;
      });
    });
    const rings = coordinates.map((ring) => {
      return `(${ring.join(',')})`;
    });
    return `(${rings.join(',')})`;
  }

  nPoints(): number {
    return this.rings.reduce((acc, ring) => {
      return acc + ring.points.length;
    }, 0);
  }

  simplify(tolerance: number): Polygon {
    const simplified = simplify(this.asGeoJSON(), { tolerance });
    return Polygon.createFromGeoJSON(simplified);
  }
}
