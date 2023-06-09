import {Page, Workspace} from "@blocksuite/store";
import {provide} from "vue";
import {VSelection} from "./VSelection";
import {BlockService} from "./children";
import { BlockType } from "../block/types";

export const useEditor = (blocks: BlockType[]) => {
    const workspace = new Workspace({id: 'test'}).register(blocks.map(v => v.schema))
    const page = workspace.createPage('page0');
    provideBlocks(blocks, page);
    return page;
}

export const provideBlocks = (blocks: BlockType[], page: Page) => {
    const map = Object.fromEntries(blocks.map(v => [v.schema.model.flavour, v]))
    const selection = new VSelection(page)
    document.addEventListener('selectionchange', () => {
        selection.syncFromNative();
    })
    const service: BlockService = {
        component(model) {
            const block = map[model.flavour]
            return block.view
        },
        getVSelection(): VSelection {
            return selection
        },
        getPage(): Page {
            return page
        }
    };
    provide(BlockService, service)
}
