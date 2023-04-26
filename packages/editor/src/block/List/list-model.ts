import {defineBlockSchema, type SchemaToModel} from '@blocksuite/store';
import {literal} from "../../utils/literal";
export type ListType = 'bulleted' | 'numbered' | 'todo' | 'toggle';
export const ListBlockSchema = defineBlockSchema({
    flavour: 'blocksvite:list',
    props: internal => ({
        type: 'bulleted' as ListType,
        text: internal.Text(),
        checked: false,
    }),
    metadata: {
        version: 1,
        role: 'content',
        tag: literal('blocksvite-list'),
    },
});

export type ListBlockModel = SchemaToModel<typeof ListBlockSchema>;
