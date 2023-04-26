import {Component} from "vue";
import {BlockSchema} from "@blocksuite/store";
import {z} from "zod";

export type BlockType = {
    view: Component,
    schema: z.infer<typeof BlockSchema>
};
export const createBlock = (block: BlockType) => {
    return block;
}
