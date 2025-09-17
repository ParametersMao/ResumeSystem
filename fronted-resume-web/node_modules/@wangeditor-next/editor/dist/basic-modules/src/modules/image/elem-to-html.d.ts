/**
 * @description to html
 * @author wangfupeng
 */
import { Element } from 'slate';
declare function imageToHtml(elemNode: Element, _childrenHtml: string): string;
export declare const imageToHtmlConf: {
    type: string;
    elemToHtml: typeof imageToHtml;
};
export {};
