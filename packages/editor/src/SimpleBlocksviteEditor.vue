<template>
    <BlocksviteEditor :page="page"></BlocksviteEditor>
</template>

<script setup lang="ts">
import BlocksviteEditor from "./BlocksviteEditor.vue";
import {PageBlock, ParagraphBlock} from "./block";
import {provideBlocks, useEditor} from "./utils/hooks";

const page = useEditor([ParagraphBlock, PageBlock])
provideBlocks([ParagraphBlock, PageBlock], page)
const pageBlockId = page.addBlock('affine:page');
page.addBlock('affine:paragraph', {}, pageBlockId);
(window as any).page = page;
</script>

<style>
body {
    font-family: Helvetica Neue, Helvetica, Arial, Microsoft Yahei,
    Hiragino Sans GB, Heiti SC, WenQuanYi Micro Hei, sans-serif;
}
</style>
