import {provide} from "vue";
import {BlockService} from "./utils/children";
import {BlockType} from "./block/help/types";
import {VEditor} from "@blocksuite/virgo";
import {nativeRange} from "./utils/range";
import {Page} from "@blocksuite/store";
import {VRange} from "./utils/VRange";

export * as RenderChildren from './block/help/RenderChildren.vue'
export * from './block'
export const provideBlocks = (blocks: BlockType[], page: Page) => {
    const map = Object.fromEntries(blocks.map(v => [v.schema.model.flavour, v]))
    const set = new Set<{ start: () => void; end: () => void }>()
    let origin: { x: number; y: number } | undefined = undefined;
    let range: VRange | undefined = undefined;
    window.addEventListener('mousedown', (e) => {
        origin = {
            x: e.x,
            y: e.y,
        }
    })
    window.addEventListener('mousemove', (e) => {
        if (origin && (Math.abs(e.x - origin.x) > 10 || Math.abs(e.y - origin.y) > 10)) {
            origin = undefined;
            set.forEach(v => v.start())
        }
    })
    window.addEventListener('mouseup', () => {
        origin = undefined;
        set.forEach(v => v.end())
        const selection = getSelection();
        if (selection) {
            const range0 = selection?.getRangeAt(0);
            selection.removeAllRanges();
            requestAnimationFrame(() => {
                selection.addRange(range0)
            })
        }
    })
    window.addEventListener('selectionchange', () => {
        const native = nativeRange();
        if (native) {
            range = new VRange(page, native)
        } else {
            range = undefined;
        }
    })
    const service: BlockService = {
        component(model) {
            const block = map[model.flavour]
            return block.view
        },
        onDrag(ops) {
            set.add(ops)
            return {
                dispose() {
                    set.delete(ops)
                }
            }
        },
        compositionStart() {

        },
    };
    provide(BlockService, service)
}
export {BlockService}
