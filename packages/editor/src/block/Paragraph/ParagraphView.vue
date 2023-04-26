<template>
    <RichTextView :model="model"></RichTextView>
    <div style="padding-left: 24px;">
        <RenderChildren :model="model"/>
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

</style>
