import {BaseTextAttributes} from "./base-attributes";
import {BaseBlockModel} from "@blocksuite/store";

export type Segment = {
    text: string;
    attributes: BaseTextAttributes;
};
export type Line = Segment[]
export type InsertDelta = { insert: string; attributes?: BaseTextAttributes }
