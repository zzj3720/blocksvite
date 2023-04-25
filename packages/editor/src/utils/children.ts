import {Component, InjectionKey} from "vue";
import {BaseBlockModel} from "@blocksuite/store";
import {VSelection} from "./VSelection";

export type BlockService = {
    component: (model: BaseBlockModel) => Component<{ model: BaseBlockModel }>
    getVSelection(): VSelection
}
export const BlockService: InjectionKey<BlockService> = Symbol('BlockService')
