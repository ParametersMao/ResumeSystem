import { CUser } from './c-user.entity';
import { Template } from './template.entity';
export declare class ResumeDownload {
    id: number;
    user_id: number;
    user: CUser;
    template_id: number;
    template: Template;
    download_time: Date;
}
