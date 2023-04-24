<script setup lang="ts">
import {Disposable as IDisposable, Page} from "@blocksuite/store";
import {BlockService} from '@blocksvite/blocks'
import {computed, inject, onUnmounted, shallowRef} from "vue";

const props = defineProps<{
    page: Page
}>()
const root = shallowRef(props.page.root);
const disposeArr: IDisposable[] = [
    props.page.slots.rootAdded.on(() => {
        root.value = props.page.root
    }),
]
onUnmounted(() => {
    disposeArr.forEach(f => f.dispose())
})
const blockService = inject(BlockService)
const Render = computed(() => root.value && blockService?.component(root.value))
// useEventListener('keydown', (evt) => {
//     if (!evt.altKey && !evt.metaKey && !evt.ctrlKey&&root.value) {
//         props.page.captureSync()
//     }
// }, {capture: true})
</script>

<template>
    <component :is="Render" :model="root"></component>
</template>

<style scoped>
</style>
