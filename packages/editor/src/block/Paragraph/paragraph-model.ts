import {defineBlockSchema, type SchemaToModel} from '@blocksuite/store';
import {literal} from "../../utils/literal";

export const ParagraphBlockSchema = defineBlockSchema({
    flavour: 'affine:paragraph',
    props: internal => ({
        type: 'text' as ParagraphType,
        text: internal.Text(),
    }),
    metadata: {
        version: 1,
        role: 'content',
        tag: literal('affine-paragraph'),
    },
});

export type ParagraphBlockModel = SchemaToModel<typeof ParagraphBlockSchema>;
