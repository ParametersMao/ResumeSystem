import { Resume } from './resume.entity';
export declare class ResumeVersion {
    id: number;
    resumeId: number;
    userId: number;
    sourceVersion: number;
    content: string;
    createTime: Date;
    resume: Resume;
}
