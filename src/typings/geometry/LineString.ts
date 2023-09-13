class LineString {
  points: Point[];

  constructor(points: Point[]) {
    this.points = points;
  }

  isRing(): boolean {
    return this.points[0] === this.points[this.points.length - 1];
  }
}
