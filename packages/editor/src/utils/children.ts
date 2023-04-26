import {Component, InjectionKey} from "vue";
import {BaseBlockModel, Page} from "@blocksuite/store";
import {VSelection} from "./VSelection";

export type BlockService = {
    component: (model: BaseBlockModel) => Component<{ model: BaseBlockModel }>
    getVSelection(): VSelection;
    getPage(): Page
}
export const BlockService: InjectionKey<BlockService> = Symbol('BlockService')
