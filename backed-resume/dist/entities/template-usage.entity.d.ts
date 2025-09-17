import { CUser } from './c-user.entity';
import { Template } from './template.entity';
export declare class TemplateUsage {
    id: number;
    user_id: number;
    user: CUser;
    template_id: number;
    template: Template;
    usage_type: string;
    create_time: Date;
}
