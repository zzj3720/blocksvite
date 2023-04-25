import {assertExists, BaseBlockModel, Page, Text as YText} from "@blocksuite/store";
import {VRange} from "./VRange";
import {getSegments} from "./range";
import {VSelection} from "./VSelection";

const deleteSelected = (page: Page, vRange: VRange, selection: VSelection) => {
    const {start, end, others} = vRange.getAllSelectedModel();
    const startText = start.model.text;
    const endText = end.model.text;
    if (!startText || !endText) {
        throw new Error('bug')
    }
    page.doc.transact(() => {
        if (start.model === end.model) {
            startText.delete(start.offset, end.offset - start.offset)
        } else {
            startText.delete(start.offset, startText.toString().length - start.offset);
            endText.delete(0, end.offset);
            startText.join(endText)
            page.deleteBlock(end.model)
        }
        others.forEach(model => {
            page.deleteBlock(model)
        })
    })
    return {
        model: start.model, offset: start.offset
    }
}
const deleteBackward = (page: Page, model: BaseBlockModel, offset: number, mode?: "grapheme" | "word" | "sentence") => {
    const yText = model.text?.yText;
    if (!yText) {
        throw new Error('this is a bug')
    }
    const segments = getSegments(yText.toString().slice(0, offset), mode);
    const length = segments[segments.length - 1].segment.length;
    const newOffset = offset - length;
    yText.doc?.transact(() => {
        yText.delete(newOffset, length);
    });
    return {
        model,
        offset: newOffset,
    }
}
const deleteForward = (page: Page, model: BaseBlockModel, offset: number, mode?: "grapheme" | "word" | "sentence") => {
    const yText = model.text?.yText;
    if (!yText) {
        throw new Error('this is a bug')
    }
    const segments = getSegments(yText.toString().slice(offset), mode);
    const length = segments[0].segment.length;
    yText.doc?.transact(() => {
        yText.delete(offset, length);
    });
    return {
        model,
        offset,
    }
}
export const handleDelete = (page: Page, vRange: VRange, selection: VSelection) => {
    if (vRange.isCollapsed) {
        const {model, offset} = deleteBackward(page, vRange.startModel, vRange.startOffset);
        applyToDom(selection, VRange.createCollapsedPoint(page, model, offset))
    } else {
        const {model, offset} = deleteSelected(page, vRange, selection)
        applyToDom(selection, VRange.createCollapsedPoint(page, model, offset))
    }
};
export const handleLineDelete = (page: Page, vRange: VRange, selection: VSelection) => {
    if (vRange.isCollapsed) {
        const model = vRange.startModel;
        const text = model.text
        assertExists(text)
        assertExists(text.yText.doc)
        text.yText.doc.transact(() => {
            text.delete(0, vRange.startOffset)
        })
        applyToDom(selection, VRange.createCollapsedPoint(page, model, 0))
    } else {
        return handleDelete(page, vRange, selection)
    }

}
export const handleInsertText = (page: Page, vRange: VRange, selection: VSelection, data: string) => {
    page.doc.transact(() => {
        if (!vRange.isCollapsed) {
            deleteSelected(page, vRange, selection);
        }
        const {startModel, startOffset} = vRange;
        const text = startModel.text;
        assertExists(text)
        assertExists(text.yText.doc)
        text.yText.doc.transact(() => {
            text.insert(data, startOffset)
        })
        applyToDom(selection, VRange.createCollapsedPoint(page, startModel, startOffset + data.length))
    })
}
export const handleWordDelete = (page: Page, vRange: VRange, selection: VSelection) => {
    if (vRange.isCollapsed) {
        const {model, offset} = deleteBackward(page, vRange.startModel, vRange.startOffset, 'word')
        applyToDom(selection, VRange.createCollapsedPoint(page, model, offset))
    } else {
        handleDelete(page, vRange, selection)
    }
}
export const handleForwardDelete = (page: Page, vRange: VRange, selection: VSelection) => {
    if (vRange.isCollapsed) {
        const {model, offset} = deleteForward(page, vRange.startModel, vRange.startOffset, 'word')
        applyToDom(selection, VRange.createCollapsedPoint(page, model, offset))
    } else {
        handleDelete(page, vRange, selection)
    }
}
export const handleBlockSplit = (
    page: Page,
    model: BaseBlockModel,
    offset: number,
    selection: VSelection,
) => {
    if (!(model.text instanceof YText)) return;
    const parent = page.getParent(model);
    if (!parent) return;

    const right = model.text.split(offset);
    let index = parent.children.indexOf(model) + 1;
    const children = [...model.children];
    page.updateBlock(model, {children: []});
    const id = page.addBlock(
        model.flavour,
        {
            text: right,
            type: model.type,
            children,
        },
        parent,
        index
    );
    const newModel = page.getBlockById(id);
    if (newModel) {
        selection.setRange(VRange.createCollapsedPoint(page, newModel, 0))
    }
};

export const handleInsertParagraph = (page: Page, vRange: VRange, selection: VSelection) => {
    if (!vRange.isCollapsed) {
        handleDelete(page, vRange, selection)
    }
    const model = vRange.startModel;
    const offset = vRange.startOffset;
    handleBlockSplit(page, model, offset, selection)
}
const applyToDom = (selection: VSelection, vRange: VRange) => {
    selection.setRange(vRange)
}
