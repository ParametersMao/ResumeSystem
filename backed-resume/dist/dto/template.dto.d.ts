export declare class CreateTemplateDto {
    templateName: string;
    templateData: string;
    previewImage?: string;
    description?: string;
    industryTags?: string;
    status?: boolean;
}
export declare class UpdateTemplateDto {
    templateName?: string;
    templateData?: string;
    previewImage?: string;
    description?: string;
    industryTags?: string;
    status?: boolean;
}
export declare class TemplateListResponseDto {
    id: number;
    templateName: string;
    previewImage?: string;
    description?: string;
    industryTags?: string;
    status?: boolean;
    createTime: Date;
    updateTime: Date;
    useCount: number;
    downloadCount: number;
}
export declare class TemplateDetailResponseDto {
    id: number;
    templateName: string;
    templateData: string;
    previewImage?: string;
    description?: string;
    industryTags?: string;
    status?: boolean;
    createTime: Date;
    updateTime: Date;
    useCount: number;
    downloadCount: number;
}
export declare class TemplateResponseDto {
    id: number;
    templateName: string;
    templateData: string;
    previewImage?: string;
    description?: string;
    industryTags?: string;
    status?: boolean;
    createTime: Date;
    updateTime: Date;
    useCount: number;
    downloadCount: number;
}
