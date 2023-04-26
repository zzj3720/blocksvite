import {assertExists, BaseBlockModel, Page, Text as YText} from "@blocksuite/store";
import {date} from "zod";
import {ZERO_WIDTH_SPACE} from "./consts";
import {Line, Segment} from "./types";

export const nativeRange = () => {
    const selection = getSelection();
    if (selection?.rangeCount) {
        const range = selection.getRangeAt(0)
        return range;
    }
}
export const getModelFromNode = (page: Page, node: Node) => {
    const textEle = closest(node, "[data-blocksvite-text]")
    const id = textEle?.getAttribute('data-blocksvite-text')
    if (id) {
        return page.getBlockById(id)
    }
    console.error(node, textEle, id)
    throw new Error("can't find text element")
}
const closestSegment = (node: Node) => {
    return closest(node, "[data-blocksvite-segment-index]")
}
const segmentIndex = (ele: Element) => {
    return Number(ele.getAttribute('data-blocksvite-segment-index'))
}
export const getPointFromNativePoint = (page: Page, node: Node, offset: number, backward: boolean) => {
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
    const deltas = getFixedDelta(model.text);
    const targetDelta = deltas[index];
    if (targetDelta.attributes?.single) {
        if (node !== segment) {
            offset = 1;
        }
        offset = backward ? offset === 0 ? 0 : 1 : offset > 0 ? 1 : 0;
    }
    const sum = deltas.slice(0, index).reduce((acc, v) => acc + v.text.length, 0)
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
export const getDomPointByVPoint = (model: BaseBlockModel, offset: number, backward: boolean) => {
    const ele = findModelDom(model)
    if (!ele) {
        throw new Error('this is a bug');
    }
    const deltas = getFixedDelta(model.text);
    let rest = offset;
    for (let i = 0; i < deltas.length; i++) {
        const delta = deltas[i];
        const length = delta.text.length;
        if (length >= rest) {
            const segment = ele.querySelector(`[data-blocksvite-segment-index="${i}"]`)
            assertExists(segment);
            if (delta.attributes?.single) {
                const range = new Range()
                range.selectNode(segment.childNodes[1]);
                const start = {node: range.startContainer, offset: range.startOffset};
                const end = {
                    node: range.endContainer,
                    offset: range.endOffset
                };
                const result = backward ? rest === 0 ? start : end : rest === 1 ? end : start;
                return result;
            }
            return {node: findTextNode(segment), offset: rest}
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
export const inEditor = (node: Node, page: Page) => {
    return closest(node, `[data-blocksvite-editor="${page.id}"]`) != null
}

export const closest = (node: Node, selector: string) => {
    return node instanceof Element ? node.closest(selector) : node.parentElement?.closest(selector)
}
export const getFixedDelta = (text?: YText): Line => {
    return text?.toDelta().flatMap<Segment>(v => {
        if (v.attributes?.single) {
            return v.insert?.split('').map(text => ({text, attributes: v.attributes ?? {}})) ?? []
        }
        return {text: v.insert ?? '', attributes: v.attributes ?? {}}
    }) ?? []
}
