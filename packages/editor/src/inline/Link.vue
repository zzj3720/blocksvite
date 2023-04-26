<template>
  <!--    <span class="link" ref="eleRef" :data-title="attributes.link">{{ ZERO_WIDTH_SPACE }}</span>-->
    <span ref="eleRef">
        <span contenteditable="false"><span></span><span class="link">{{
            attributes.link
            }}</span><span></span></span>{{ last ? '\n' : '' }}
    </span>
</template>

<script lang="ts" setup>
import {BaseTextAttributes} from "../utils/base-attributes";
import {useElementHover} from "@vueuse/core";
import {ref, watch} from "vue";

const props = defineProps<{
    attributes: BaseTextAttributes;
    text: string;
    last: boolean;
}>();
const eleRef = ref<HTMLSpanElement>()
const hover = useElementHover(eleRef)
</script>

<style scoped>
.link {
    text-decoration: underline;
    cursor: pointer;
    color: blue;
}

.link::before:hover {

}
</style>
