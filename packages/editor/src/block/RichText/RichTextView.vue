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
// props.model.text?.insert('asd', 0, {strike: true, underline: true})
// props.model.text?.insert(ZERO_WIDTH_NON_JOINER, 0, {single:true,link: 'http://baidu.com'})
// props.model.text?.insert('asd', 0, {strike: true, underline: true})
</script>

<style scoped>

</style>
