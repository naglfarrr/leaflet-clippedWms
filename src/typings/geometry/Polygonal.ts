interface Polygonal {
  asGeoJSON(): GeojsonPolygonal;
  asWkt(): string;
  nPoints(): number;
  simplify(tolerance: number): Polygonal;
}
