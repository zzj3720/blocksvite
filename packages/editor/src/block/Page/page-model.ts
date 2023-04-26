import {defineBlockSchema, SchemaToModel} from '@blocksuite/store';
import {literal} from "../../utils/literal";


export const PageBlockSchema = defineBlockSchema({
    flavour: 'affine:page',
    props: internal => ({
        title: internal.Text(),
    }),
    metadata: {
        version: 1,
        role: 'root',
        tag: literal('affine-page'),
    },
});

export type PageBlockModel = SchemaToModel<typeof PageBlockSchema>;
