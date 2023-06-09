import {VRange} from "./VRange";
import {Page, UserRange} from "@blocksuite/store";
import {nativeRange} from "./range";

export class VSelection {
    _range?: VRange;

    constructor(private _page: Page) {
    }

    setRange(range?: VRange) {
        this._range = range;
        this.applyToDomAndStore();
    }

    getRange(): VRange | undefined {
        return this._range;
    }

    get vRange(): VRange | undefined {
        return this.getRange()
    }

    set vRange(range: VRange | undefined) {
        this.setRange(range)
    }

    get isMultiLine() {
        return this._range?.startModel !== this._range?.endModel
    }

    private syncedInFrame = false
    private _lockSync = false;

    syncFromNative() {
        if (this.syncedInFrame || this._lockSync) {
            return
        }
        this.syncedInFrame = true;
        requestAnimationFrame(() => {
            this.syncedInFrame = false;
        })
        const native = nativeRange();
        if (native) {
            this._range = VRange.syncFromNative(this._page, native)
            this._range?.applyToStore();
        }
    }

    syncFromStack(userRange: UserRange) {
        const startModel = this._page.getBlockById(userRange.blockIds[0]);
        const endModel = this._page.getBlockById(userRange.blockIds[userRange.blockIds.length - 1]);
        if (!startModel || !endModel) return
        requestAnimationFrame(() => {
            this._range = new VRange(startModel, userRange.startOffset, endModel, userRange.endOffset);
            this._range?.applyToDom();
        })
    }

    private appliedInFrame = 0;

    applyToDomAndStore() {
        if (this.appliedInFrame) {
            return;
        }
        this._lockSync = true;
        this.appliedInFrame = requestAnimationFrame(() => {
            if (this._range) {
                this._range.applyToDom()
                this._range.applyToStore()
            } else {
                getSelection()?.removeAllRanges();
                this._page.awarenessStore.setLocalRange(this._page, null)
            }

            this._lockSync = false;
            this.appliedInFrame = 0;
        })
    }

    forceApply() {
        this._range?.applyToDom()
    }

    lockSync(value = true) {
        this._lockSync = value
    }

}
