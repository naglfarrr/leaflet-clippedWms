import { ClippedWMS, IClippedWMSOptions } from './ClippedWMS';

export function clippedWMS(baseUrl: string, options: IClippedWMSOptions): ClippedWMS {
  return new ClippedWMS(baseUrl, options);
}
