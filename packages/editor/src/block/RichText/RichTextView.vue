<template>
    <Text :model="model" ref="virgoContainer" style="outline: none;padding: 3px 2px;"></Text>
</template>

<script lang="ts" setup>
import {BaseBlockModel} from "@blocksuite/store";
import {ref} from "vue";
import Text from "../../inline/Text.vue";

const virgoContainer = ref<Text>()
const props = defineProps<{
    model: BaseBlockModel
}>()
</script>

<style scoped>

</style>
