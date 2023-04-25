import {BaseBlockModel, Page} from "@blocksuite/store";
import {getDomPointByVPoint, getPointFromNativePoint} from "./range";

export class VRange {
    isCollapsed: boolean;

    constructor(
        private _page: Page,
        private _startModel: BaseBlockModel,
        private _startOffset: number,
        private _endModel: BaseBlockModel,
        private _endOffset: number
    ) {
        this.isCollapsed = _startModel === _endModel && _startOffset === _endOffset;
    }

    static syncFromNative(page: Page, nativeRange: Range) {
        const start = getPointFromNativePoint(page, nativeRange.startContainer, nativeRange.startOffset);
        const end = getPointFromNativePoint(page, nativeRange.endContainer, nativeRange.endOffset);
        return new VRange(page, start.model, start.offset, end.model, end.offset);
    }

    static createCollapsedPoint(page: Page, model: BaseBlockModel, offset: number) {
        return new VRange(page, model, offset, model, offset)
    }

    getAllSelectedModel() {
        return {
            start: {
                model: this._startModel,
                offset: this._startOffset,
            },
            others: findAllSelectedModel(this._page, this._startModel, this._endModel),
            end: {
                model: this._endModel,
                offset: this._endOffset,
            }
        }
    }

    get startModel() {
        return this._startModel
    }

    get startOffset() {
        return this._startOffset
    }

    get endModel() {
        return this._endModel
    }

    get endOffset() {
        return this._endOffset
    }

    applyToDom() {
        const selection = getSelection();
        if (selection) {
            const startPoint = getDomPointByVPoint(this._startModel, this._startOffset);
            const endPoint = getDomPointByVPoint(this._endModel, this._endOffset);
            const range = new Range()
            console.log(range,startPoint,endPoint)
            range.setStart(startPoint.node, startPoint.offset)
            range.setEnd(endPoint.node, endPoint.offset)
            selection.removeAllRanges();
            selection.addRange(range)
        }
    }

    applyToStore() {
        const {start, end, others} = this.getAllSelectedModel();
        this._page.awarenessStore.setLocalRange(this._page, {
            startOffset: start.offset,
            endOffset: end.offset,
            blockIds: start.model === end.model ? [start.model.id] : [start.model.id, ...others.map(v => v.id), end.model.id]
        })
    }
}

const findAllSelectedModel = (page: Page, start: BaseBlockModel, end: BaseBlockModel) => {
    let record = false;
    const result: BaseBlockModel[] = []
    const find = (parent: BaseBlockModel) => {
        for (const model of parent.children) {
            if (model.id === start.id) {
                record = true;
            }
            if (model.children.length !== 0) {
                find(model)
            } else if (record) {
                result.push(model)
            }
            if (model.id === end.id) {
                record = false;
            }
        }
    }
    if (page.root) {
        find(page.root)
    }
    result.pop();
    result.shift();
    return result;
}
