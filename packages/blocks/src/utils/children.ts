import {Component, InjectionKey} from "vue";
import {BaseBlockModel, Disposable} from "@blocksuite/store";

export type BlockService = {
    component: (model: BaseBlockModel) => Component<{ model: BaseBlockModel }>
    onDrag(ops: { start: () => void, end: () => void }): Disposable
    compositionStart(): void;
}
export const BlockService: InjectionKey<BlockService> = Symbol('BlockService')
