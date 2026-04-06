import { defineStore } from 'pinia';
function now() { return Date.now(); }
export const useResumeStore = defineStore('resume', {
    state: () => ({
        resume: null,
        lastSavedSnapshot: null,
        saveState: 'idle'
    }),
    actions: {
        setResume(resume) {
            this.resume = resume;
            this.lastSavedSnapshot = JSON.parse(JSON.stringify(resume));
        },
        applyPatch(mutator) {
            if (!this.resume)
                return;
            const draft = JSON.parse(JSON.stringify(this.resume));
            mutator(draft);
            draft.meta.updatedAt = now();
            this.resume = draft;
        }
    }
});
