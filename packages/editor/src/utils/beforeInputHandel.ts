import {assertExists, BaseBlockModel, Page, Text as YText} from "@blocksuite/store";
import {getSegments} from "./range";
import {VRange} from "./VRange";
import {VSelection} from "./VSelection";

const deleteSelected = (page: Page, vRange: VRange, selection: VSelection) => {
    const {start, end, others} = vRange.getAllSelectedModel();
    const startText = start.model.text;
    const endText = end.model.text;
    if (!startText || !endText) {
        throw new Error('bug')
    }
    transact(page, () => {
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
const deleteBackward = (page: Page, selection: VSelection, model: BaseBlockModel, offset: number, mode?: "grapheme" | "word" | "sentence") => {
    const yText = model.text?.yText;
    if (!yText) {
        throw new Error('this is a bug')
    }
    const pre = yText.toString().slice(0, offset);
    if (pre.length === 0) {

    }
    const segments = getSegments(pre, mode);
    const length = segments[segments.length - 1].segment.length;
    const newOffset = offset - length;
    transact(page, () => {
        yText.delete(newOffset, length);
    });
    applyToDom(selection, VRange.createCollapsedPoint(page, model, newOffset))
}
const deleteForward = (page: Page, model: BaseBlockModel, offset: number, mode?: "grapheme" | "word" | "sentence") => {
    const yText = model.text?.yText;
    if (!yText) {
        throw new Error('this is a bug')
    }
    const segments = getSegments(yText.toString().slice(offset), mode);
    const length = segments[0].segment.length;
    transact(page, () => {
        yText.delete(offset, length);
    });
    return {
        model,
        offset,
    }
}
export const handleDelete = (page: Page, vRange: VRange, selection: VSelection) => {
    if (vRange.isCollapsed) {
        deleteBackward(page, selection, vRange.startModel, vRange.startOffset);
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
        transact(page, () => {
            text.delete(0, vRange.startOffset)
        })
        applyToDom(selection, VRange.createCollapsedPoint(page, model, 0))
    } else {
        return handleDelete(page, vRange, selection)
    }

}
export const handleInsertText = (page: Page, vRange: VRange, selection: VSelection, data: string) => {
    transact(page, () => {
        if (!vRange.isCollapsed) {
            deleteSelected(page, vRange, selection);
        }
        const {startModel, startOffset} = vRange;
        const text = startModel.text;
        assertExists(text)
        assertExists(text.yText.doc)
        text.insert(data, startOffset)
        applyToDom(selection, VRange.createCollapsedPoint(page, startModel, startOffset + data.length))
    })
}
export const handleWordDelete = (page: Page, vRange: VRange, selection: VSelection) => {
    if (vRange.isCollapsed) {
        deleteBackward(page, selection, vRange.startModel, vRange.startOffset, 'word')
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
    const id = transact(page, () => {
        page.updateBlock(model, {children: []});
        return page.addBlock(
            model.flavour,
            {
                text: right,
                type: model.type,
                children,
            },
            parent,
            index
        );
    })
    const newModel = page.getBlockById(id);
    if (newModel) {
        selection.setRange(VRange.createCollapsedPoint(page, newModel, 0))
    }
};
export const handleBlockMergeToPrev = (page: Page, selection: VSelection, model: BaseBlockModel) => {
    if (!(model.text instanceof YText)) return;
    const parent = page.getParent(model);
    if (!parent) return;

}
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
export const transact = <T>(page: Page, fn: () => T): T => {
    return page.doc.transact(fn, page.doc.clientID)
}
