<template>
    <span :class="classNames">
        {{ text }}
    </span>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import {BaseTextAttributes} from "./base-attributes";

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
.italic{
    font-style: italic;
}

</style>
