import {assertExists, BaseBlockModel, Page, Text as YText} from "@blocksuite/store";
import {getSegments} from "./range";
import {VRange} from "./VRange";
import {VSelection} from "./VSelection";
import {BaseTextAttributes} from "./base-attributes";

const deleteSelected = (vRange: VRange, selection: VSelection) => {
    const {start, end, others} = vRange.getAllSelectedModel();
    const startText = start.model.text;
    const endText = end.model.text;
    if (!startText || !endText) {
        throw new Error('bug')
    }
    const page = start.model.page;
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
const deleteBackward = (selection: VSelection, model: BaseBlockModel, offset: number, mode?: "grapheme" | "word" | "sentence") => {
    const page = model.page;
    const yText = model.text?.yText;
    if (!yText) {
        throw new Error('this is a bug')
    }
    const pre = yText.toString().slice(0, offset);
    if (pre.length === 0) {
        //TODO make it more configurable
        if (model.flavour !== 'blocksvite:paragraph') {
            const newModel = changeFlavor(model, 'blocksvite:paragraph')
            if (newModel) {
                selection.setRange(VRange.createCollapsedPoint(newModel, 0))
            }
            return;
        } else if (model.type !== 'text') {
            transact(page, () => {
                page.updateBlock(model, {type: 'text'})
            })
        } else {
            const findPreModel = (model: BaseBlockModel) => {
                const parent = page.getParent(model);
                if (!parent) {
                    return
                }
                const index = parent.children.indexOf(model)
                if (index === 0) {
                    return parent;
                }
                const pre = parent.children[index - 1];
                const getDeepLastChild = (model: BaseBlockModel): BaseBlockModel => {
                    if (model.children.length) {
                        return getDeepLastChild(model.children[model.children.length - 1])
                    }
                    return model;
                }
                return getDeepLastChild(pre)
            }
            const pre = findPreModel(model);
            const preText = pre?.text;
            const modelText = model?.text;
            if (pre && preText && modelText) {
                const length = preText.length
                const children = [...model.children, ...pre.children];
                transact(page, () => {
                    preText.join(modelText)
                    page.updateBlock(pre, {children: children});
                    page.deleteBlock(model)
                })
                selection.setRange(VRange.createCollapsedPoint(pre, length))
            }
        }
        return
    }
    const segments = getSegments(pre, mode);
    const length = segments[segments.length - 1].segment.length;
    const newOffset = offset - length;
    transact(page, () => {
        yText.delete(newOffset, length);
    });
    applyToDom(selection, VRange.createCollapsedPoint(model, newOffset))
}
const deleteForward = (model: BaseBlockModel, offset: number, mode?: "grapheme" | "word" | "sentence") => {
    const page = model.page;
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
export const handleDelete = (vRange: VRange, selection: VSelection) => {
    if (vRange.isCollapsed) {
        deleteBackward(selection, vRange.startModel, vRange.startOffset);
    } else {
        const {model, offset} = deleteSelected(vRange, selection)
        applyToDom(selection, VRange.createCollapsedPoint(model, offset))
    }
};
export const handleLineDelete = (vRange: VRange, selection: VSelection) => {
    const page = vRange.startModel.page;
    if (vRange.isCollapsed) {
        const model = vRange.startModel;
        const text = model.text
        assertExists(text)
        assertExists(text.yText.doc)
        transact(page, () => {
            text.delete(0, vRange.startOffset)
        })
        applyToDom(selection, VRange.createCollapsedPoint(model, 0))
    } else {
        return handleDelete(vRange, selection)
    }

}
export const handleInsertText = (vRange: VRange, selection: VSelection, data: string) => {
    if (!vRange.isCollapsed) {
        deleteSelected(vRange, selection);
    }
    const {startModel, startOffset} = vRange;
    const page = startModel.page;
    const text = startModel.text;
    assertExists(text)
    // TODO match markdown prefix
    // if (data === ' ' && handleMarkdownPrefix(vRange, selection)) {
    //     return
    // }
    const [delta] = text.sliceToDelta(startOffset - 1, startOffset);
    const attributes = delta?.attributes?.single ? {} : undefined
    transact(page, () => {
        text.insert(data, startOffset, attributes)
    })
    applyToDom(selection, VRange.createCollapsedPoint(startModel, startOffset + data.length))
}
export const handleWordDelete = (vRange: VRange, selection: VSelection) => {
    if (vRange.isCollapsed) {
        deleteBackward(selection, vRange.startModel, vRange.startOffset, 'word')
    } else {
        handleDelete(vRange, selection)
    }
}
export const handleForwardDelete = (vRange: VRange, selection: VSelection) => {
    if (vRange.isCollapsed) {
        const {model, offset} = deleteForward(vRange.startModel, vRange.startOffset, 'word')
        applyToDom(selection, VRange.createCollapsedPoint(model, offset))
    } else {
        handleDelete(vRange, selection)
    }
}
export const handleBlockSplit = (
    model: BaseBlockModel,
    offset: number,
    selection: VSelection,
) => {
    if (!(model.text instanceof YText)) return;
    const page = model.page;
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
        selection.setRange(VRange.createCollapsedPoint(newModel, 0))
    }
};
export const handleInsertParagraph = (vRange: VRange, selection: VSelection) => {
    if (!vRange.isCollapsed) {
        handleDelete(vRange, selection)
    }
    const model = vRange.startModel;
    const offset = vRange.startOffset;
    handleBlockSplit(model, offset, selection)
}
const applyToDom = (selection: VSelection, vRange: VRange) => {
    selection.setRange(vRange)
}
export const transact = <T>(page: Page, fn: () => T): T => {
    return page.doc.transact(fn, page.doc.clientID)
}
export const handleChangeSelectedAttributes = (range: VRange, attributes: BaseTextAttributes) => {
    const {start, end, others} = range.getAllSelectedModel();
    const page = start.model.page;
    transact(page, () => {
        const startText = start.model.text;
        if (range.startModel === range.endModel) {
            startText?.format(start.offset, end.offset - start.offset, attributes)
            return
        }
        const endText = end.model.text;
        if (startText) {
            startText.format(start.offset, startText.length - start.offset, attributes)
        }
        if (endText) {
            endText.format(0, end.offset, attributes)
        }
        others.forEach((model) => {
            const text = model.text
            if (text) {
                text.format(0, text.length, attributes)
            }
        })
    })
}
export const handleMarkdownPrefix = (vRange: VRange, selection: VSelection) => {
    if (!vRange.isCollapsed) {
        return false
    }
    const text = vRange.startModel.text?.toString().slice(0, vRange.startOffset);
    if (!text) {
        return false;
    }
}
const changeFlavor = (model: BaseBlockModel, flavor: string) => {
    const page = model.page;
    const parent = page.getParent(model)
    if (!parent) {
        return
    }
    const text = model.text?.clone();
    const children = [...model.children];
    const index = parent.children.indexOf(model);
    const id = transact(page, () => {
        page.deleteBlock(model);
        return page.addBlock(flavor, {
            text,
            children,
        }, parent, index)
    })
    return page.getBlockById(id);
}
export const handleIndent = (range: VRange) => {

}
