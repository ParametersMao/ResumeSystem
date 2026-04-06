import { z } from 'zod';
const colorValue = z.string().min(1);
const colorPaletteSchema = z.record(colorValue).or(z.object({
    primary: colorValue.optional(),
    secondary: colorValue.optional(),
    tertiary: colorValue.optional(),
    background: colorValue.optional(),
    border: colorValue.optional(),
    text: z
        .record(colorValue)
        .optional()
        .or(z.object({
        primary: colorValue.optional(),
        secondary: colorValue.optional(),
        muted: colorValue.optional()
    }))
}));
const typographySchema = z
    .object({
    fontFamily: z
        .object({
        body: z.string().optional(),
        heading: z.string().optional()
    })
        .optional(),
    fontSize: z.record(z.string()).optional(),
    fontWeight: z.record(z.union([z.string(), z.number()])).optional(),
    lineHeight: z.record(z.string()).optional()
})
    .partial();
const spacingSchema = z
    .object({
    xs: z.string().optional(),
    sm: z.string().optional(),
    md: z.string().optional(),
    lg: z.string().optional(),
    xl: z.string().optional(),
    xxl: z.string().optional(),
    sectionMargin: z.string().optional(),
    elementMargin: z.string().optional()
})
    .partial();
const themeSchema = z
    .object({
    colors: colorPaletteSchema.optional(),
    typography: typographySchema.optional(),
    spacing: spacingSchema.optional(),
    borders: z.record(z.any()).optional()
})
    .partial();
const layoutColumnsSchema = z.object({
    widths: z.array(z.string()).optional(),
    gap: z.string().optional(),
    leftStyle: z.record(z.string()).optional(),
    middleStyle: z.record(z.string()).optional(),
    rightStyle: z.record(z.string()).optional()
});
const layoutConfigSchema = z.object({
    type: z.string(),
    container: z.record(z.string()).optional(),
    content: z.record(z.string()).optional(),
    columns: layoutColumnsSchema.optional(),
    custom: z.record(z.any()).optional()
});
const sectionStyleSchema = z
    .object({
    container: z.record(z.any()).optional(),
    title: z.record(z.any()).optional(),
    content: z.record(z.any()).optional(),
    items: z.record(z.any()).optional(),
    custom: z.record(z.record(z.any())).optional()
})
    .partial();
const sectionDefinitionSchema = z.object({
    id: z.string().optional(),
    type: z.string(),
    title: z.string().optional(),
    visible: z.boolean().optional(),
    order: z.number().optional(),
    items: z.any().optional(),
    config: z.record(z.any()).optional(),
    style: z.record(z.any()).optional(),
    data: z.record(z.any()).optional()
});
const assetSchema = z
    .object({
    icons: z.record(z.string()).optional(),
    images: z.record(z.string()).optional()
})
    .partial();
export const templateSchema = z
    .object({
    schemaVersion: z.union([z.number(), z.string()]).optional(),
    templateName: z.string().min(1),
    templateType: z
        .enum(['single-column', 'two-column', 'three-column', 'custom'])
        .optional(),
    version: z.union([z.number(), z.string()]).optional(),
    description: z.string().optional(),
    theme: themeSchema.optional(),
    globalStyles: z.record(z.any()).optional(),
    layout: z.union([layoutConfigSchema, z.array(layoutConfigSchema)]).optional(),
    sectionStyles: z.record(sectionStyleSchema).optional(),
    sections: z.array(sectionDefinitionSchema).optional(),
    assets: assetSchema.optional(),
    profile: z.record(z.any()).optional(),
    customCss: z.string().optional(),
    responsive: z.record(z.any()).optional()
})
    .passthrough();
export function validateTemplateData(raw) {
    const result = templateSchema.safeParse(raw);
    if (result.success) {
        return {
            success: true,
            data: result.data
        };
    }
    const issues = result.error.issues.map((issue) => {
        const path = issue.path.length ? issue.path.join('.') : 'root';
        return `[${path}] ${issue.message}`;
    });
    return {
        success: false,
        issues
    };
}
