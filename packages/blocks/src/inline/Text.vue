<template>
    <div
            :data-blocksvite-text="props.model.id"
            @beforeinput="beforeInput"
            @compositionstart="compositionStart"
            @compositionupdate="compositionUpdate"
            @compositionend="compositionEnd"
            :contenteditable="contentEditable"
    >
        <Normal v-for="(segment, i) in textLine" :key="i" :attributes="segment.attributes"
                :text="segment.text"></Normal>
    </div>
</template>

<script lang="ts" setup>
import {BaseBlockModel} from "@blocksuite/store";
import {computed, inject, onMounted, onUnmounted, ref} from "vue";
import {InsertDelta, Line} from "../utils/types";
import Normal from "./Normal.vue";
import {BlockService} from "../main";

const contentEditable = ref(true);
const props = defineProps<{
    model: BaseBlockModel
}>()
const yText = computed(() => props.model.text?.yText);

const textLine = ref<Line>([]);
const onUpdate = () => {
    const delta = yText.value?.toDelta();
    if (delta) {
        textLine.value = getLine()
    }
}
const getLine = (): Line => {
    const delta = yText.value?.toDelta() as InsertDelta[];
    return delta?.map(v => ({text: v.insert, attributes: v.attributes ?? {}})) ?? []
}
onMounted(() => {
    yText.value?.observe(onUpdate);
    yText.value?.insert(0, "Hello Wor\nld", {italic: true});
    yText.value?.delete(2, 2);
    yText.value?.insert(2, "i", {italic: true, bold: true});
})
onUnmounted(() => {
    yText.value?.unobserve(onUpdate)
})
const service = inject(BlockService)
const beforeInput = (e: Event) => {
    if (isComposing) {
        return
    }
    e.preventDefault();
}
let isComposing = false;
const compositionStart = (evt: CompositionEvent) => {
    service.compositionStart();
    isComposing = true;
}
const compositionUpdate = (evt: CompositionEvent) => {
    console.log("compositionUpdate", isComposing, evt)
}
const compositionEnd = (evt: CompositionEvent) => {
    isComposing = false;
    console.log("compositionEnd", evt)
}
defineExpose({
    contentEditable(set: boolean) {
        contentEditable.value = set;
    }
})
</script>

<style scoped></style>
