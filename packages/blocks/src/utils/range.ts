import {Page} from "@blocksuite/store";

export const nativeRange = () => {
    const selection = getSelection();
    if (selection?.rangeCount) {
        const range = selection.getRangeAt(0)
        return range;
    }
}
export const getModelFromNode = (page: Page, node: Node) => {
    const textEle = node.parentElement?.closest("[data-blocksvite-text]")
    const id = textEle?.getAttribute('data-blocksvite-text')
    if (id) {
        return page.getBlockById(id)
    }
    throw new Error("can't find text element")
}
export const nativeRangeToVRange = () => {

}
