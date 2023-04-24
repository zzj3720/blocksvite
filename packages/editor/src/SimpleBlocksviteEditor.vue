<template>
    <BlocksviteEditor :page="page"></BlocksviteEditor>
</template>

<script setup lang="ts">
import {PageBlock, ParagraphBlock, provideBlocks} from "@blocksvite/blocks";
import {Workspace} from "@blocksuite/store";
import BlocksviteEditor from "./BlocksviteEditor.vue";

const workspace = new Workspace({id: 'test'}).register([ParagraphBlock.schema, PageBlock.schema])
const page = workspace.createPage('page0');
provideBlocks([ParagraphBlock, PageBlock], page)
const pageBlockId = page.addBlock('affine:page');
page.addBlock('affine:paragraph', {}, pageBlockId);
page.addBlock('affine:paragraph', {}, pageBlockId);
(window as any).workspace = workspace;
</script>

<style scoped>

</style>
