import { Bounds, CRS, TileLayer, WMSOptions } from "leaflet";
import { ClippedWMS, IClippedWMSOptions } from "./ClippedWMS";

// 非常简单的加法函数
export function add(a: number, b: number): number {
    return a + b;
}

export function clippedWMS(baseUrl: string, options: IClippedWMSOptions): ClippedWMS {

    return new ClippedWMS(baseUrl, options);
}