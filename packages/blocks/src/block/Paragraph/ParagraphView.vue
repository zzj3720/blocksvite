<template>
    <div style="border: 1px solid gray">
        <RichTextView :model="model"></RichTextView>
        <RenderChildren :model="model"/>
    </div>
</template>

<script lang="ts" setup>
import {BaseBlockModel} from "@blocksuite/store";
import RenderChildren from "../help/RenderChildren.vue";
import RichTextView from "../RichText/RichTextView.vue";

 defineProps<{
    model: BaseBlockModel
}>()
</script>

<style scoped>

</style>
