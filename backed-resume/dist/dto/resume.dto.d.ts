export declare class CreateResumeDto {
    title: string;
    content: string;
    templateId?: number;
    userId: number;
    previewImage?: string;
}
export declare class UpdateResumeDto {
    title?: string;
    content?: string;
    templateId?: number;
    previewImage?: string;
    version?: number;
}
export declare class ResumeResponseDto {
    id: number;
    title: string;
    content: string;
    templateId?: number;
    templateName?: string;
    userId: number;
    userName?: string;
    previewImage?: string;
    status: number;
    version: number;
    createTime: Date;
    updateTime: Date;
}
export declare class ResumeListResponseDto {
    id: number;
    title: string;
    templateId?: number;
    templateName?: string;
    userId: number;
    userName?: string;
    previewImage?: string;
    status: number;
    version: number;
    createTime: Date;
    updateTime: Date;
}
