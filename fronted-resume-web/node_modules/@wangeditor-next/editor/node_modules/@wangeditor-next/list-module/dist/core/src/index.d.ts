/**
 * @description core index
 * @author wangfupeng
 */
import './assets/index.less';
import { IDomEditor } from './editor/interface';
import { IRegisterMenuConf } from './menus/index';
import { IParseElemHtmlConf, IPreParseHtmlConf, ParseStyleHtmlFnType } from './parse-html/index';
import { IRenderElemConf, RenderStyleFnType } from './render/index';
import { IElemToHtmlConf, styleToHtmlFnType } from './to-html/index';
export * from './create/index';
export { IEditorConfig, IToolbarConfig, IUploadImageConfig, IUploadVideoConfig, } from './config/interface';
export * from './editor/dom-editor';
export * from './editor/interface';
export * from './render/index';
export * from './to-html/index';
export * from './parse-html/index';
export * from './menus/index';
export * from './upload/index';
export * from './i18n/index';
export * from './utils/dom';
export interface IModuleConf {
    menus: Array<IRegisterMenuConf>;
    renderStyle: RenderStyleFnType;
    renderElems: Array<IRenderElemConf>;
    styleToHtml: styleToHtmlFnType;
    elemsToHtml: Array<IElemToHtmlConf>;
    preParseHtml: Array<IPreParseHtmlConf>;
    parseStyleHtml: ParseStyleHtmlFnType;
    parseElemsHtml: Array<IParseElemHtmlConf>;
    editorPlugin: <T extends IDomEditor>(editor: T) => T;
}
