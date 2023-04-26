<template>
    <div
            ref="toolbarRef"
            v-if="showPosition"
            style="position: absolute;pointer-events: none;padding: 6px;"
            :style="showPosition.position==='top'?`left:${showPosition.x}px;top:${showPosition.y}px`:`left:${showPosition.x}px;top:${showPosition.y}px`">
        <div class="blockToolbar">
            <div :class="actionClass('bold')" @click="clickAction('bold')">
                <span style="font-weight: bold">B</span>
            </div>
            <div :class="actionClass('italic')" @click="clickAction('italic')">
                <span style="font-style: italic">i</span>
            </div>
            <div :class="actionClass('underline')" @click="clickAction('underline')">
                <span style="text-decoration: underline">U</span>
            </div>
            <div :class="actionClass('strike')" @click="clickAction('strike')">
                <span style="text-decoration: line-through">S</span>
            </div>
            <div :class="actionClass('code')" @click="clickAction('code')">
                <svg viewBox="0 0 30 30" class="code"
                     style="width: 15px; height: 15px; display: block; fill: inherit; flex-shrink: 0; backface-visibility: hidden;">
                    <path d="M11.625,4L0,15l11.625,11L13,24.563L2.906,15L13,5.438L11.625,4z M18.375,4L17,5.438L27.094,15L17,24.563L18.375,26L30,15L18.375,4z"></path>
                </svg>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {computed, inject, ref, shallowRef} from "vue";
import {BlockService} from "../utils/children";
import {handleChangeSelectedAttributes} from "../utils/beforeInputHandel";
import {VRange} from "../utils/VRange";

export type BlockToolBarProps = {
    vRange: VRange,
    rootRect: DOMRect,
    mousePoint: { x: number; y: number }
};
const props = defineProps<{
    data?: BlockToolBarProps;
    'update:data'?: (data: BlockToolBarProps | undefined) => void;
}>()
const toolbarRef = ref<HTMLDivElement>()
const actionClass = (actionType: ActionType) => {
    return ['action', attributes.value[actionType] && 'active']
}
const distance = (a: { x: number, y: number }, b: { x: number, y: number }) => {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}
const detectAttrList = ['bold', 'italic', 'underline', 'strike', 'code'] as const;
const attributes = shallowRef<Record<string, boolean>>({})
const showPosition = computed(() => {
    const data = props.data;
    if (data) {
        const {vRange, rootRect, mousePoint} = data;
        let isBackward = vRange.startModel === vRange.endModel;
        const start = vRange.getStartAsRange();
        const startRect = start.getBoundingClientRect();
        computeAttributes(vRange);
        if (!isBackward) {
            isBackward = distance(startRect, mousePoint) < 20;
        }
        if (isBackward) {
            return {
                position: 'top',
                x: startRect.left - rootRect.left,
                y: startRect.top - rootRect.top - 44,
            }
        } else {
            const end = vRange.getEndAsRange();
            const endRect = end.getBoundingClientRect();
            return {
                position: 'bottom',
                x: endRect.left - rootRect.left,
                y: endRect.bottom - rootRect.top,
                attributes
            }
        }
    }
})
const computeAttributes = (vRange?: VRange) => {
    if (!vRange) {
        return {}
    }
    const deltas = vRange.getDelta();
    attributes.value = detectAttr(deltas.filter(delta => delta.insert?.length).map(delta => delta.attributes??{}))
}
const service = inject(BlockService)!
type ActionType = typeof detectAttrList[number]
const clickAction = (type: ActionType) => {
    const page = service.getPage();
    const vRange = props.data?.vRange
    if (!vRange) {
        throw new Error('this is a bug');
    }
    switch (type) {
        case "bold":
        case "strike":
        case "underline":
        case "code":
        case "italic":
            handleChangeSelectedAttributes(vRange, {[type]: !attributes.value[type]})
            service.getVSelection().applyToDomAndStore();
            computeAttributes(service.getVSelection().vRange)
    }
}
const detectAttr = (attrList: Record<string, any>[]) => {
    const needDetect = new Set(detectAttrList)
    for (const attr of attrList) {
        if (!needDetect.size) {
            return {}
        }
        for (const name of needDetect) {
            if (!Boolean(attr[name])) {
                needDetect.delete(name)
            }
        }
    }
    return Object.fromEntries([...needDetect.keys()].map(name => [name, true]))
}
</script>

<style scoped>
.blockToolbar {
    pointer-events: auto;
    user-select: none;
    box-shadow: rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px;
    border-radius: 4px;
    display: flex;
    overflow: hidden;
    font-size: 14px;
    background-color: white;
    transition: visibility;
}

.action {
    padding: 8px 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action.active {
    color: rgb(35, 131, 226);
}

.action:hover {
    background-color: #d9d9d9;
    cursor: pointer;
}
</style>
