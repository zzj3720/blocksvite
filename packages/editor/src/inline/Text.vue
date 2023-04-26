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
                :preIsSingle="!!(textLine[i-1]?.attributes?.single)"
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
import {getFixedDelta} from "../utils/range";

const props = defineProps<{
    model: BaseBlockModel
}>()
const yText = computed(() => props.model.text);

const getLine = (): Line => {
    return getFixedDelta(yText.value)
}

const textLine = ref<Line>(getLine());
const onUpdate = () => {
    textLine.value = getLine()
}
onMounted(() => {
    yText.value?.yText?.observe(onUpdate);
})
onUnmounted(() => {
    yText.value?.yText?.unobserve(onUpdate)
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
