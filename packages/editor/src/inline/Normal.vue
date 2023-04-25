<template>
    <span :class="classNames" class="segment">{{ text.endsWith('\n') ? text + '\n' : text }}</span>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import {BaseTextAttributes} from "../utils/base-attributes";

const props = defineProps<{
    attributes: BaseTextAttributes;
    text: string;
}>();
const classNames = computed(() => {
    return Object.entries(props.attributes).filter(([_, v]) => v === true).map(([key]) => key)
});

</script>

<style scoped>
.bold {
    font-weight: bold;
}

.italic {
    font-style: italic;
}

.segment {

}
</style>
