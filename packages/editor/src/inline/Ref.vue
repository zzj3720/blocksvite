<template>
    <span class="segment"><span></span>{{ ZERO_WIDTH_NON_JOINER }}</span>
</template>

<script lang="ts" setup>
import {BaseTextAttributes} from "../utils/base-attributes";
import {ZERO_WIDTH_NON_JOINER} from "../utils/consts";

const props = defineProps<{
    attributes: BaseTextAttributes;
    text: string;
}>();

</script>

<style scoped>

.segment {

}
</style>
