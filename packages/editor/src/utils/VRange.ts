import {BaseBlockModel, Page} from "@blocksuite/store";
import {getDomPointByVPoint, getPointFromNativePoint, inEditor} from "./range";

export class VRange {
    isCollapsed: boolean;
    others: BaseBlockModel[]

    constructor(
        private _page: Page,
        private _startModel: BaseBlockModel,
        private _startOffset: number,
        private _endModel: BaseBlockModel,
        private _endOffset: number,
        others?: BaseBlockModel[],
    ) {
        this.isCollapsed = _startModel === _endModel && _startOffset === _endOffset;
        if (!others) {
            if (_startModel === _endModel) {
                this.others = []
            } else {
                this.others = VRange.getOthersByVRange(_page, _startModel, _startOffset, _endModel, _endOffset)
            }
        } else {
            this.others = others;
        }
    }

    static getOthersByVRange(page: Page, start: BaseBlockModel, startOffset: number, end: BaseBlockModel, endOffset: number) {
        if (start === end) {
            return []
        }
        const startPoint = getDomPointByVPoint(start, startOffset, true);
        const endPoint = getDomPointByVPoint(end, endOffset, true);
        const range = new Range();
        range.setStart(startPoint.node, startPoint.offset)
        range.setEnd(endPoint.node, endPoint.offset)
        return this.getOthersByNativeRange(page, range)
    }

    static getOthersByNativeRange(page: Page, range: Range) {
        if (range.startContainer === range.endContainer) {
            return []
        }
        const result: BaseBlockModel[] = []
        if (range.commonAncestorContainer instanceof Element) {
            const eles = range.commonAncestorContainer.querySelectorAll('[data-blocksvite-text]');
            eles.forEach(ele => {
                if (range.intersectsNode(ele)) {
                    const id = ele.getAttribute('data-blocksvite-text');
                    let model = id ? page.getBlockById(id) : null;
                    model && result.push(model)
                }
            })
        }
        return result.slice(1, result.length - 1)
    }

    static syncFromNative(page: Page, nativeRange: Range) {
        if (!inEditor(nativeRange.startContainer, page) || !inEditor(nativeRange.endContainer, page)) {
            return
        }
        const clone = nativeRange.cloneRange();
        const others = this.getOthersByNativeRange(page, nativeRange);
        const start = getPointFromNativePoint(page, nativeRange.startContainer, nativeRange.startOffset, true);
        const end = getPointFromNativePoint(page, nativeRange.endContainer, nativeRange.endOffset, false);
        // console.log('sync', clone, start, end)
        return new VRange(page, start.model, start.offset, end.model, end.offset, others);
    }

    static createCollapsedPoint(page: Page, model: BaseBlockModel, offset: number) {
        return new VRange(page, model, offset, model, offset)
    }

    getStartAsRange() {
        const {node, offset} = getDomPointByVPoint(this._startModel, this._startOffset, true);
        const range = new Range()
        range.setStart(node, offset);
        range.setEnd(node, offset);
        return range;
    }

    getEndAsRange() {
        const {node, offset} = getDomPointByVPoint(this._endModel, this._endOffset, false);
        const range = new Range()
        range.setStart(node, offset);
        range.setEnd(node, offset);
        return range;
    }

    getAllSelectedModel() {
        return {
            start: {
                model: this._startModel,
                offset: this._startOffset,
            },
            others: this.others,
            end: {
                model: this._endModel,
                offset: this._endOffset,
            }
        }
    }

    getDelta() {
        const {start, end, others} = this.getAllSelectedModel();
        if (start.model === end.model) {
            return start.model.text?.sliceToDelta(start.offset, end.offset) ?? []
        }
        return [
            ...start.model.text?.sliceToDelta(start.offset) ?? [],
            ...others.flatMap(model => model.text?.toDelta() ?? []),
            ...end.model.text?.sliceToDelta(0, end.offset) ?? [],
        ]
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
            const startPoint = getDomPointByVPoint(this._startModel, this._startOffset, true);
            const endPoint = getDomPointByVPoint(this._endModel, this._endOffset, false);
            const range = new Range()
            range.setStart(startPoint.node, startPoint.offset)
            range.setEnd(endPoint.node, endPoint.offset)
            // console.log('apply', this, range)
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
