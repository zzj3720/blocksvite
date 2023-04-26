<template>
    <span ref="eleRef">{{ preIsSingle ? '' : ''}}<span contenteditable="false"><span></span><span class="link">{{
            attributes.ref
        }}</span><span></span></span>{{ last ? '\n' : '' }}
    </span>
</template>

<script lang="ts" setup>
import {BaseTextAttributes} from "../utils/base-attributes";
import {useElementHover} from "@vueuse/core";
import {ref, watch} from "vue";
import {ZERO_WIDTH_SPACE} from "../utils/consts";

const props = defineProps<{
    attributes: BaseTextAttributes;
    text: string;
    last: boolean;
    preIsSingle: boolean;
}>();
const eleRef = ref<HTMLSpanElement>()
const hover = useElementHover(eleRef)
</script>

<style scoped>
.link {
    cursor: pointer;
    color: #bbbbbb;
}

.link::before:hover {

}
</style>
