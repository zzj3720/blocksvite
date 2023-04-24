<template>
    <template v-for="(childModel) in children" :key="childModel.id">
        <component :is="blockService?.component(childModel)" :model="childModel"></component>
    </template>
</template>

<script lang="ts" setup>
import { BaseBlockModel, Disposable } from "@blocksuite/store";
import { inject, onUnmounted, shallowRef } from "vue";
import { BlockService } from "../../utils/children";

const blockService = inject(BlockService)
const props = defineProps<{
    model: BaseBlockModel
}>()
const children = shallowRef(props.model.children);
const disposeList: Disposable[] = []
disposeList.push(props.model.childrenUpdated.on(() => {
    children.value = props.model.children;
}))
onUnmounted(() => {
    disposeList.forEach(f => f.dispose())
})
</script>

<style scoped>

</style>
