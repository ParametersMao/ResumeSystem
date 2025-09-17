import { CUser } from './c-user.entity';
import { Template } from './template.entity';
export declare class Resume {
    id: number;
    title: string;
    content: string;
    templateId: number;
    userId: number;
    previewImage: string;
    status: number;
    version: number;
    createTime: Date;
    updateTime: Date;
    user: CUser;
    template: Template;
}
