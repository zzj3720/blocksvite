import {BaseBlockModel, Page} from "@blocksuite/store";

export const nativeRange = () => {
    const selection = getSelection();
    if (selection?.rangeCount) {
        const range = selection.getRangeAt(0)
        return range;
    }
}
export const getModelFromNode = (page: Page, node: Node) => {
    const ele = node instanceof Element ? node : node?.parentElement;
    const textEle = ele?.closest("[data-blocksvite-text]")
    const id = textEle?.getAttribute('data-blocksvite-text')
    if (id) {
        return page.getBlockById(id)
    }
    console.error(node, textEle, id)
    throw new Error("can't find text element")
}
const closestSegment = (node: Node) => {
    const ele = node instanceof Element ? node : node?.parentElement;
    return ele?.closest("[data-blocksvite-segment-index]")
}
const segmentIndex = (ele: Element) => {
    return Number(ele.getAttribute('data-blocksvite-segment-index'))
}
export const getPointFromNativePoint = (page: Page, node: Node, offset: number) => {
    const model = getModelFromNode(page, node)
    if (!model) {
        console.error("can't find model", page, node, offset)
        throw new Error('this is a bug')
    }
    const segment = closestSegment(node)
    if (!segment) {
        return {
            model,
            offset
        };
    }
    const index = segmentIndex(segment);
    const deltas = model.text?.toDelta() ?? [];
    const sum = deltas.slice(0, index).reduce((acc, v) => acc + (v.insert?.length ?? 0), 0)
    return {
        model,
        offset: sum + offset,
    }
}
export const getSegments = (s: string, mode?: "grapheme" | "word" | "sentence") => {
    return [...new Intl.Segmenter(undefined, {granularity: mode}).segment(s)]
}

export const findModelDom = (model: BaseBlockModel) => {
    return document.querySelector(`[data-blocksvite-text='${model.id}']`)
}
export const getDomPointByVPoint = (model: BaseBlockModel, offset: number) => {
    const ele = findModelDom(model)
    if (!ele) {
        throw new Error('this is a bug');
    }
    const segments = ele.querySelectorAll('[data-blocksvite-segment-index]')
    let rest = offset;
    for (let i = 0; i < segments.length; i++) {
        const segment = findTextNode(segments[i]);
        const length = segment.textContent?.length ?? 0;
        if (length >= rest) {
            return {node: segment, offset: rest}
        }
        rest -= length;
    }
    return {
        node: findTextNode(ele),
        offset,
    }
}
const findTextNode = (element: Element): Text => {
    for (let i = 0; i < element.childNodes.length; i++) {
        const node = element.childNodes[i];
        if (node instanceof Text) {
            return node
        }
    }
    throw new Error('this is a bug')
}
export const cleanDom = (model: BaseBlockModel) => {
    const ele = findModelDom(model)
    if (!ele) {
        throw new Error('bug')
    }
    ele.childNodes.forEach(v => {
        if (v instanceof HTMLSpanElement && v.getAttribute('data-blocksvite-segment-index') != null) {
            return
        }
        if (v instanceof Text && v.data === '') {
            return;
        }
        ele.removeChild(v)
    })
}
