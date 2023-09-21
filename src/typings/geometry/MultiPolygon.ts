import { Polygon } from './Polygon';
import { simplify } from '@turf/turf';

export class MultiPolygon implements Polygonal {
  private polygons: Polygon[];

  private constructor(polygons: Polygon[]) {
    this.polygons = polygons;
  }

  static createFromGeoJSON(geojson: GeoJSON.MultiPolygon): MultiPolygon {
    const polygons = geojson.coordinates.map((polygon) => {
      return Polygon.createFromArray(polygon);
    });
    return new MultiPolygon(polygons);
  }

  asGeoJSON(): GeoJSON.MultiPolygon {
    return {
      type: 'MultiPolygon',
      coordinates: this.asArray(),
    };
  }

  asArray(): number[][][][] {
    return this.polygons.map((polygon) => {
      return polygon.asArray();
    });
  }

  asWkt(): string {
    const polygons = this.polygons.map((polygon) => {
      return polygon.wktWithoutTitle();
    });
    return `MULTIPOLYGON(${polygons.join(',')})`;
  }

  nPoints(): number {
    return this.polygons.reduce((acc, polygon) => {
      return acc + polygon.nPoints();
    }, 0);
  }

  simplify(tolerance: number): MultiPolygon {
    const simplified = simplify(this.asGeoJSON(), { tolerance });
    return MultiPolygon.createFromGeoJSON(simplified);
  }
}
