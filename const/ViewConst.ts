/**
 * todo: 这里只是容错，后面所有适配将放入fgui解决，这个将删除
 */

export enum GainCenterType {
    /**
     * 按照最大比例扩大并居中
     */
    NORMAL = 0,

    /**
     * 扩大到整个视口大小
     */
    HIGH = 1
}

export class GainCenterStyle {
    public constructor(public type: GainCenterType, public node: Node) { }
}