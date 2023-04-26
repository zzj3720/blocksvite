import ParagraphView from "./ParagraphView.vue";
import {ParagraphBlockSchema} from "./paragraph-model";
import {createBlock} from "../types";

export const ParagraphBlock = createBlock({
    view: ParagraphView,
    schema: ParagraphBlockSchema,
})
