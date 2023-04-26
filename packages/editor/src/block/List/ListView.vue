<template>
    <div class="list">
        <div contenteditable="false" class="prefix">
            •
        </div>
        <div>
            <RichTextView :model="model"></RichTextView>
            <RenderChildren :model="model"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {BaseBlockModel} from "@blocksuite/store";
import RenderChildren from "../RenderChildren.vue";
import RichTextView from "../RichText/RichTextView.vue";

defineProps<{
    model: BaseBlockModel
}>()
</script>

<style scoped>
.list {
    display: flex;
}

.prefix {
    padding: 0 4px;
    display: flex;
    align-items: center;
    user-select: none;
    justify-content: center;
    font-weight: bold;
    height: calc(1.5em + 6px);
}
</style>
