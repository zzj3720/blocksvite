<template>
    <Text :model="model" ref="virgoContainer" style="outline: none;padding: 3px 2px;"></Text>
</template>

<script lang="ts" setup>
import {assertExists, BaseBlockModel, Disposable} from "@blocksuite/store";
import {inject, onMounted, onUnmounted, ref} from "vue";
import {BlockService} from "../../utils/children";
import Text from "../../inline/Text.vue";

const virgoContainer = ref<Text>()
const props = defineProps<{
    model: BaseBlockModel
}>()
assertExists(props.model.text)
const blockService = inject(BlockService)
const disposeArr: Disposable[] = []
onMounted(() => {
    if (virgoContainer.value) {
        if (blockService) {
            disposeArr.push(blockService?.onDrag({
                    start: () => {
                        if (virgoContainer.value) {
                            virgoContainer.value.contentEditable(false)
                        }
                    },
                    end: () => {
                        if (virgoContainer.value) {
                            virgoContainer.value.contentEditable(true)
                        }
                    }
                })
            )
        }
    }
})
onUnmounted(() => {
    disposeArr.forEach(f => f.dispose())
})
</script>

<style scoped>

</style>
