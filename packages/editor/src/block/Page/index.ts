import ParagraphView from "./PageView.vue";
import {PageBlockSchema} from "./page-model";
import {createBlock} from "../types";

export const PageBlock = createBlock({
    view: ParagraphView,
    schema: PageBlockSchema,
})
