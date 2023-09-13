class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static create(array: number[]) {
    if (array.length !== 2) {
      throw new Error('');
    }
    return new Point(array[0], array[1]);
  }
}
