<script setup lang="ts">
import {Disposable as IDisposable, Page, StackItem} from "@blocksuite/store";
import {computed, inject, onUnmounted, shallowRef} from "vue";
import {BlockService} from "./utils/children";
import {
    handleDelete,
    handleForwardDelete,
    handleInsertParagraph,
    handleInsertText,
    handleLineDelete,
    handleWordDelete
} from "./utils/beforeInputHandel";
import {cleanDom, nativeRange} from "./utils/range";
import {useEventListener} from "@vueuse/core";

const props = defineProps<{
    page: Page
}>()
const root = shallowRef(props.page.root);
const disposeArr: IDisposable[] = [
    props.page.slots.rootAdded.on(() => {
        root.value = props.page.root
    }),
    props.page.slots.rootDeleted.on(() => {
        root.value = undefined
    }),
]
const historyPopped = (event: { stackItem: StackItem }) => {
    const userRange = event.stackItem.meta.get('cursor-location');
    if (!userRange) {
        return;
    }
    blockService.getVSelection().syncFromStack(userRange)
}
props.page.history.on('stack-item-popped', historyPopped);
onUnmounted(() => {
    disposeArr.forEach(f => f.dispose())
    props.page.history.off('stack-item-popped', historyPopped)
})
const blockService = inject(BlockService)
const Render = computed(() => root.value && blockService?.component(root.value))

useEventListener('keydown', (ev) => {
    if (!blockService?.getVSelection().vRange) {
        return
    }
    if (ev.metaKey && ev.key === 'z') {
        props.page.undo()
        ev.preventDefault();
    }
    if (ev.metaKey && ev.shiftKey && ev.key === 'z') {
        props.page.redo()
        ev.preventDefault();
    }
})
const beforeinput = (evt: Event) => {
    evt.preventDefault();
    if (!(evt instanceof InputEvent)) {
        return
    }
    const selection = blockService!.getVSelection();
    const vRange = selection.getRange();
    if (!vRange) {
        return;
    }
    console.log(evt.inputType, vRange.startOffset, nativeRange()?.startOffset);
    // You can find explanation of inputType here:
    // [Input Events Level 2](https://w3c.github.io/input-events/#interface-InputEvent-Attributes)
    switch (evt.inputType) {
        case 'insertLineBreak': {
            handleInsertText(props.page, vRange, selection, '\n');
            break;
        }
        case 'insertText': {
            handleInsertText(props.page, vRange, selection, evt.data ?? '');
            break;
        }

        case 'insertParagraph': {
            handleInsertParagraph(props.page, vRange, selection)
            break;
        }

        // Chrome and Safari on Mac: Backspace or Ctrl + H
        case 'deleteContentBackward':
        case 'deleteByCut': {
            handleDelete(props.page, vRange, selection);
            break;
        }

        // On Mac: Option + Backspace
        // On iOS: Hold the backspace for a while and the whole words will start to disappear
        case 'deleteWordBackward': {
            handleWordDelete(props.page, vRange, selection);
            break;
        }

        // deleteHardLineBackward: Safari on Mac: Cmd + Backspace
        // deleteSoftLineBackward: Chrome on Mac: Cmd + Backspace
        case 'deleteHardLineBackward':
        case 'deleteSoftLineBackward': {
            handleLineDelete(props.page, vRange, selection);
            break;
        }

        // Chrome on Mac: Fn + Backspace or Ctrl + D
        // Safari on Mac: Ctrl + K or Ctrl + D
        case 'deleteContentForward': {
            handleForwardDelete(props.page, vRange, selection);
            break;
        }
    }
}
const compositionstart = (evt: CompositionEvent) => {
    const selection = blockService!.getVSelection();
    selection.lockSync()
}
const compositionend = (evt: CompositionEvent) => {
    const selection = blockService!.getVSelection();
    selection.lockSync(false)
    const vRange = selection.getRange();
    if (!vRange) {
        return
    }

    handleInsertText(props.page, vRange, selection, evt.data)
    cleanDom(vRange.startModel)
}
</script>

<template>
    <div
            v-if="root"
            class="editor"
            contenteditable="true" @beforeinput="beforeinput" @compositionstart="compositionstart"
            @compositionend="compositionend">
        <component :is="Render" :model="root"></component>
    </div>
</template>

<style scoped>
.editor {
    line-height: 1.5;
    font-size: 16px;
    border: 2px solid black;
    outline: none;
    border-radius: 4px;
}
</style>
