<template>
    <span :class="classNames" class="segment">{{ !last ? text : text.endsWith('\n') ? text + '\n' : text }}</span>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import {BaseTextAttributes} from "../utils/base-attributes";

const props = defineProps<{
    attributes: BaseTextAttributes;
    text: string;
    last:boolean;
}>();
const classNames = computed<string[]>(() => {
    return Object.entries(props.attributes).filter(([_, v]) => v === true).map(([key, _]) => key)
});

</script>

<style scoped>
.bold {
    font-weight: bold;
}

.italic {
    font-style: italic;
}

.underline {
    text-decoration: underline;
}

.strike {
    text-decoration: line-through;
}

.code {
    border-radius: 4px;
    background-color: #bbbbbb;
    padding: 0 4px;
}

.segment {

}
</style>
