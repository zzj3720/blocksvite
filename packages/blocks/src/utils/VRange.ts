import {assertExists, BaseBlockModel, Page} from "@blocksuite/store";
import {getModelFromNode} from "./range";

export class VRange {
    _range: Range
    _startModel: BaseBlockModel;
    _startOffset: number;
    _endModel: BaseBlockModel;
    _endOffset: number;

    constructor(private _page: Page, range: Range) {
        this._range = range.cloneRange();
        const startModel = getModelFromNode(_page, this._range.startContainer);
        assertExists(startModel)
        this._startModel = startModel;

        const endModel = getModelFromNode(_page, this._range.endContainer);
        assertExists(endModel)
        this._endModel = endModel;
    }

}
