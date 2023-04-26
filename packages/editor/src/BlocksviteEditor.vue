<script setup lang="ts">
import {Disposable as IDisposable, Page, StackItem} from "@blocksuite/store";
import {computed, inject, onUnmounted, ref, shallowRef} from "vue";
import {BlockService} from "./utils/children";
import {
    handleDelete,
    handleForwardDelete, handleIndent,
    handleInsertParagraph,
    handleInsertText,
    handleLineDelete,
    handleWordDelete
} from "./utils/beforeInputHandel";
import {cleanDom, nativeRange} from "./utils/range";
import {useEventListener} from "@vueuse/core";
import BlockToolBar, {BlockToolBarProps} from "./ui/BlockToolBar.vue";
import {isHotkey} from 'is-hotkey'
import {Redo, Tab, Undo} from "./utils/hotkey";

const props = defineProps<{
    page: Page
}>()
const root = shallowRef(props.page.root);
const disposeArr: IDisposable[] = [
    props.page.slots.rootAdded.on(() => {
        root.value = props.page.root
    }),
    props.page.slots.rootDeleted.on(() => {
        root.value = null
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
const blockService = inject(BlockService)!
const Render = computed(() => root.value && blockService?.component(root.value))

useEventListener('keydown', (ev) => {
    const vRange = blockService?.getVSelection().vRange;
    if (!vRange) {
        return
    }
    if (Undo(ev)) {
        props.page.undo()
        ev.preventDefault();
    }
    if (Redo(ev)) {
        props.page.redo()
        ev.preventDefault();
    }
    if (Tab(ev)) {
        handleIndent(vRange)
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
            handleInsertText(vRange, selection, '\n');
            break;
        }
        case 'insertText': {
            handleInsertText(vRange, selection, evt.data ?? '');
            break;
        }

        case 'insertParagraph': {
            handleInsertParagraph(vRange, selection)
            break;
        }

        // Chrome and Safari on Mac: Backspace or Ctrl + H
        case 'deleteContentBackward':
        case 'deleteByCut': {
            handleDelete(vRange, selection);
            break;
        }

        // On Mac: Option + Backspace
        // On iOS: Hold the backspace for a while and the whole words will start to disappear
        case 'deleteWordBackward': {
            handleWordDelete(vRange, selection);
            break;
        }

        // deleteHardLineBackward: Safari on Mac: Cmd + Backspace
        // deleteSoftLineBackward: Chrome on Mac: Cmd + Backspace
        case 'deleteHardLineBackward':
        case 'deleteSoftLineBackward': {
            handleLineDelete(vRange, selection);
            break;
        }

        // Chrome on Mac: Fn + Backspace or Ctrl + D
        // Safari on Mac: Ctrl + K or Ctrl + D
        case 'deleteContentForward': {
            handleForwardDelete(vRange, selection);
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

    handleInsertText(vRange, selection, evt.data)
    cleanDom(vRange.startModel)
}
const mouseup = (evt: MouseEvent) => {
    const selection = blockService.getVSelection();
    selection.applyToDomAndStore()
    if (selection.vRange && !selection.vRange.isCollapsed) {
        const containerRect = containerRef.value?.getBoundingClientRect();
        if (!containerRect) {
            throw new Error('this is a bug')
        }
        showBlockToolBar.value = {
            rootRect: containerRect,
            vRange: selection.vRange,
            mousePoint: {
                x: evt.x,
                y: evt.y,
            }
        }
    } else {
        showBlockToolBar.value = undefined;
    }
}
const containerRef = ref<HTMLDivElement>()
const showBlockToolBar = shallowRef<BlockToolBarProps>()
</script>

<template>
    <div class="editor">
        <div ref="containerRef" class="scroll-container" data-blocksvite-container="true" style="position: relative">
            <BlockToolBar v-model:data="showBlockToolBar"></BlockToolBar>
            <div
                    :data-blocksvite-editor="props.page.id"
                    v-if="root"
                    class="editor-editable"
                    contenteditable="true"
                    @mouseup="mouseup"
                    @beforeinput="beforeinput"
                    @compositionstart="compositionstart"
                    @compositionend="compositionend">
                <component :is="Render" :model="root"></component>
            </div>
        </div>
    </div>
</template>

<style scoped>
.editor {
    line-height: 1.5;
    font-size: 16px;
    border: 2px solid black;
    border-radius: 4px;
    overflow-y: auto;
    height: 500px;
}

.editor-editable {
    padding: 48px 12px;
    outline: none;
    flex: 1;
}

.scroll-container {
    min-height: 100%;
    display: flex;
    flex-direction: column;
}
</style>
