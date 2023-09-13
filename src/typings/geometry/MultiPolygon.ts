import { Polygon } from './Polygon';
import { simplify } from '@turf/turf';

export class MultiPolygon implements Polygonal {
  private polygons: Polygon[];

  private constructor(polygons: Polygon[]) {
    this.polygons = polygons;
  }

  static createFromGeoJSON(geojson: GeoJSON.MultiPolygon): MultiPolygon {
    throw new Error('Not implemented');
  }

  asGeoJSON(): GeoJSON.MultiPolygon {
    throw new Error('Not implemented');
  }

  asWkt(): string {
    throw new Error('Not implemented');
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
