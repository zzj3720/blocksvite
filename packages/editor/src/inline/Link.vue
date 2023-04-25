<template>
<!--    <span class="link" ref="eleRef" :data-title="attributes.link">{{ ZERO_WIDTH_SPACE }}</span>-->
    <span ref="eleRef" contenteditable="false"><span></span>{{ attributes.link }}<span></span></span>
</template>

<script lang="ts" setup>
import {BaseTextAttributes} from "../utils/base-attributes";
import {ZERO_WIDTH_SPACE} from "../utils/consts";
import {useElementHover} from "@vueuse/core";
import {ref, watch} from "vue";

const props = defineProps<{
    attributes: BaseTextAttributes;
    text: string;
}>();
const eleRef = ref<HTMLSpanElement>()
const hover = useElementHover(eleRef)
watch(hover, hover => {
    console.log(hover)
})
</script>

<style scoped>
.link::before {
    content: attr(data-title);
    display: inline;
}

.link::before:hover {

}
</style>
