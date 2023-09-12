/**
 * @file ClippedWMS.ts
 * @description 裁剪 WMS 图层
 * @version 1.0.0
 * @since 1.0.0
 * @date 2023-09-11
 * @modify 2023-09-11
 * @global
 * @exports ClippedWMS
 */

import { Coords, TileLayer, WMSOptions } from 'leaflet';
import { Bounds } from './typings/Bounds';
import { GeojsonPolygonal, Polygonal, Polygon, MultiPolygon } from './typings/Geometry';
import * as turf from '@turf/turf';

export class ClippedWMS extends TileLayer.WMS {

    clip?: Polygonal | undefined;          // 裁剪区域

    constructor(baseUrl: string, options: IClippedWMSOptions) {

        super(baseUrl, options);

        if (options.clip == undefined) {
            this.clip = undefined;
        } else if (options.clip.type === 'Polygon') {
            this.clip = Polygon.createFromGeoJSON(options.clip);
        } else {
            this.clip = MultiPolygon.createFromGeoJSON(options.clip);
        }
    }

    /**
     * 重写父类的 getTileUrl 方法
     * leaflet 地图框架会对屏幕上可见的每个瓦片调用一次此方法，以获取该瓦片对应范围的 URL
     * 我们不对父类的方法做任何修改，只是在父类方法的基础上，加上裁剪区域的参数
     * 需要算出此瓦片范围内的裁剪区域，将其转换为 wkt 格式，然后在 url 中添加 clipWkt 参数
     * @param coords 一组 zxy 瓦片坐标
     * @returns 瓦片对应的 URL
     */
    getTileUrl(coords: Coords): string {

        // 获取基础 URL
        const baseUrl = super.getTileUrl(coords);

        if (!this.clip) {
            return baseUrl;
        }

        // 获取瓦片的 Bounds
        /* 两种思路：
            * 1. 通过瓦片坐标 zxy，获取瓦片的 Bounds
            * 2. 从 url 中解析出瓦片的 Bounds   <--- 采用这种思路
            * 
            * url 参数中的 Bounds 格式为：BBOX=left,bottom,right,top
            * BBOX 大小写不敏感
            * example: BBOX=125.70556640625001,48.180738507303836,125.72753906250001,48.19538740833338
        */
        const regex = /[?&]bbox=([^&]*)/i;
        const match = regex.exec(baseUrl);
        if (!match) {
            throw new Error('WMS URL 中未找到 BBOX 参数');
        }
        const bbox = match[1].split(',').map(Number);
        const bounds = Bounds.createFromArray(bbox);

        // 计算裁剪边界，即计算 clip 与 bounds 的交集
        /**
         * 要点：
            * 如果 bounds 完全在 clip 内，则不需要裁剪
            * 如果 clip 完全在 bounds 内，则 clip 就是裁剪边界
            * 如果裁剪边界的点数过多，会导致 URL 过长，需要对裁剪边界进行简化
            * 如果 clip 本身点数很少，可以直接使用 clip？
         */
        let intersection = this._intersection(this.clip, bounds);
        if (intersection == null) {
            return baseUrl;
        }

        // 如果裁剪参数过长，需要对其进行简化
        if (intersection.nPoints() > 10) {
            intersection = intersection.simplify(0.001);
        }

        // 将裁剪边界转换为 wkt 格式
        const clipWkt = intersection.asWkt();

        // 将 wkt 格式的裁剪边界添加到 url 中
        const url = new URL(baseUrl);
        url.searchParams.set('clipWkt', clipWkt);

        // 返回新的 url
        return url.toString();
    }

    // ================= 以下是私有方法 =================

    /**
     * 计算『有意义的』交集边界。
     * 暂时使用 O(n) 的算法，后续再优化
     * @param clip 裁剪区域
     * @param bounds 矩形范围
     * @returns 『有意义的』交集边界。如果 clip 与 bounds 不相交，则返回 null
     */
    private _intersection(clip: Polygonal, bounds: Bounds): Polygonal | null {

        const c = clip.asGeoJSON();
        const b = bounds.asPolygon().asGeoJSON();

        if (turf.booleanContains(b, c)) {
            return clip;
        }

        const result = turf.intersect(c, b);

        if (result == null) {
            return null;
        }

        if (result.geometry.type === 'Polygon') {
            return Polygon.createFromGeoJSON(result.geometry);
        }

        return MultiPolygon.createFromGeoJSON(result.geometry);
    }
}


/**
 * 裁剪 WMS 图层的选项
 */
export interface IClippedWMSOptions extends WMSOptions {

    /**
     * 裁剪区域的 GeoJSON 对象
     */
    clip?: GeojsonPolygonal | undefined;
    // clip?: Bounds | GeojsonPolygonal | undefined;
}