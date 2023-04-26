import ListView from "./ListView.vue";
import {ListBlockSchema} from "./list-model";
import {createBlock} from "../types";

export const ListBlock = createBlock({
    view: ListView,
    schema: ListBlockSchema,
})
