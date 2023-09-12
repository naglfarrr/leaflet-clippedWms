import * as turf from '@turf/turf';

export type GeojsonPolygonal = GeoJSON.Polygon | GeoJSON.MultiPolygon;

export interface Polygonal {
    asGeoJSON(): GeojsonPolygonal;
    asWkt(): string;
    nPoints(): number;
    simplify(tolerance: number): Polygonal;
}

class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static create(array: number[]) {
        if (array.length != 2) {
            throw new Error("");
        }
        return new Point(array[0], array[1]);
    }
}

class LineString {
    points: Point[];

    constructor(points: Point[]) {
        this.points = points;
    }

    isRing(): boolean {
        return this.points[0] == this.points[this.points.length - 1];
    }
}

export class Polygon implements Polygonal {

    private rings: LineString[];

    private constructor(rings: LineString[]) {
        this.rings = rings;
    }

    static createFromGeoJSON(geojson: GeoJSON.Polygon): Polygon {
        const rings = geojson.coordinates.map((ring) => {
            let points = ring.map((point) => {
                return Point.create(point);
            });
            return new LineString(points);
        });
        return new Polygon(rings);
    }

    static createFromArray(array: number[][][]): Polygon {
        const rings = array.map((ring) => {
            let points = ring.map((point) => {
                return Point.create(point);
            });
            return new LineString(points);
        });
        return new Polygon(rings);
    }

    asGeoJSON(): GeoJSON.Polygon {
        const coordinates = this.rings.map((ring) => {
            return ring.points.map((point) => {
                return [point.x, point.y];
            });
        });
        return {
            type: 'Polygon',
            coordinates: coordinates
        };
    }

    asWkt(): string {
        const coordinates = this.rings.map((ring) => {
            return ring.points.map((point) => {
                return `${point.x} ${point.y}`;
            });
        });
        const rings = coordinates.map((ring) => {
            return `(${ring.join(',')})`;
        });
        return `POLYGON(${rings.join(',')})`;
    }

    nPoints(): number {
        return this.rings.reduce((acc, ring) => {
            return acc + ring.points.length;
        }, 0);
    }

    simplify(tolerance: number): Polygon {
        const simplified = turf.simplify(this.asGeoJSON(), { tolerance: tolerance });
        return Polygon.createFromGeoJSON(simplified);
    }
}

export class MultiPolygon implements Polygonal {

    private polygons: Polygon[];

    private constructor(polygons: Polygon[]) {
        this.polygons = polygons;
    }

    static createFromGeoJSON(geojson: GeoJSON.MultiPolygon): MultiPolygon {
        throw new Error("Not implemented");
    }

    asGeoJSON(): GeoJSON.MultiPolygon {
        throw new Error("Not implemented");
    }

    asWkt(): string {
        throw new Error("Not implemented");
    }

    nPoints(): number {
        return this.polygons.reduce((acc, polygon) => {
            return acc + polygon.nPoints();
        }, 0);
    }

    simplify(tolerance: number): MultiPolygon {
        const simplified = turf.simplify(this.asGeoJSON(), { tolerance: tolerance });
        return MultiPolygon.createFromGeoJSON(simplified);
    }
}

