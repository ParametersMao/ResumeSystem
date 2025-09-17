/**
 * @description upload interface
 * @author wangfupeng
 */
import { UppyFile } from '@uppy/core';
import { IDomEditor } from '../editor/interface';
type FilesType = {
    [key: string]: UppyFile<{}, {}>;
};
type InsertFn = (src: string, poster?: string, alt?: string, href?: string) => void | Promise<void>;
interface IBaseUploadConfig {
    fieldName?: string;
    maxFileSize?: number;
    maxNumberOfFiles?: number;
    meta?: Record<string, unknown>;
    metaWithUrl: boolean;
    headers?: Headers | ((file: UppyFile<Record<string, unknown>, Record<string, unknown>>) => Headers) | undefined;
    withCredentials?: boolean;
    timeout?: number;
    onBeforeUpload?: (files: FilesType) => boolean | FilesType;
    onSuccess: (file: UppyFile<{}, {}>, response: any) => void;
    onProgress?: (progress: number) => void;
    onFailed: (file: UppyFile<{}, {}>, response: any) => void;
    onError: (file: UppyFile<{}, {}>, error: any, res: any) => void;
    allowedFileTypes?: string[];
    customInsert?: (res: any, insertFn: InsertFn) => void;
    customUpload?: (files: File, insertFn: InsertFn, editor: IDomEditor) => void;
    customBrowseAndUpload?: (insertFn: InsertFn) => void;
    uppyConfig?: Record<string, any>;
    xhrConfig?: Record<string, any>;
}
interface IUploadConfigWithCustomUpload extends IBaseUploadConfig {
    server?: string;
    customUpload: (files: File, insertFn: InsertFn, editor: IDomEditor) => void;
}
interface IUploadConfigWithoutCustomUpload extends IBaseUploadConfig {
    server: string;
    customUpload?: never;
}
/**
 * 配置参考 https://uppy.io/docs/uppy/
 */
export type IUploadConfig = IUploadConfigWithCustomUpload | IUploadConfigWithoutCustomUpload;
export {};
