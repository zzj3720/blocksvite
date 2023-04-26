<template>
    <div
            :data-blocksvite-text="props.model.id"
            contenteditable="true"
            :placeholder="'asd'"
            class="text"
    >
        <AttributeRender
                v-for="(segment, i) in textLine"
                :key="i"
                :last="i===textLine.length-1"
                :data-blocksvite-segment-index="i"
                :attributes="segment.attributes"
                :text="segment.text"
        ></AttributeRender>
    </div>
</template>

<script lang="ts" setup>
import {BaseBlockModel} from "@blocksuite/store";
import {computed, onMounted, onUnmounted, ref} from "vue";
import {InsertDelta, Line} from "../utils/types";
import {AttributeRender} from "./attributeRender";

const props = defineProps<{
    model: BaseBlockModel
}>()
const yText = computed(() => props.model.text?.yText);

const getLine = (): Line => {
    const delta = yText.value?.toDelta() as InsertDelta[];
    return delta?.map(v => ({text: v.insert, attributes: v.attributes ?? {}})) ?? []
}

const textLine = ref<Line>(getLine());
const onUpdate = () => {
    const delta = yText.value?.toDelta();
    if (delta) {
        textLine.value = getLine()
    }
}
onMounted(() => {
    yText.value?.observe(onUpdate);

})
onUnmounted(() => {
    yText.value?.unobserve(onUpdate)
})
</script>

<style scoped>
[contenteditable]:empty:after {
    content: attr(placeholder);
    color: #bbbbbb;
}

.text {
    min-height: 1.5em;
    width: 100%;
    max-width: 100%;
    white-space: pre-wrap;
    word-break: break-word;
}
</style>
