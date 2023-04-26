<template>
    <div>
        <BlocksviteEditor :page="page"></BlocksviteEditor>
    </div>
</template>

<script setup lang="ts">
import BlocksviteEditor from "./BlocksviteEditor.vue";
import {ListBlock, PageBlock, ParagraphBlock} from "./block";
import {useEditor} from "./utils/hooks";

const page = useEditor([ParagraphBlock, PageBlock, ListBlock])
const pageBlockId = page.addBlock('affine:page');
const p = page.addBlock('blocksvite:paragraph', {}, pageBlockId);
const pModel = page.getBlockById(p)
pModel?.text?.insert('asdasd', 0, {})
pModel?.text?.insert(' ', 0, {})
pModel?.text?.insert(' ', 0, {link: 'http://baidu.com', single: true})
pModel?.text?.insert(' ', 0, {})
pModel?.text?.insert(' ', 0, {link: 'http://baidu.com', single: true})
pModel?.text?.insert(' ', 0, {})
pModel?.text?.insert(' ', 0, {link: 'http://baidu.com', single: true})
pModel?.text?.insert('asdasd', 0, {})
const insideP = page.addBlock('blocksvite:paragraph', {}, p);
const list = page.addBlock('blocksvite:list', {}, pageBlockId);
(window as any).page = page;
</script>

<style>
body {
    font-family: Helvetica Neue, Helvetica, Arial, Microsoft Yahei,
    Hiragino Sans GB, Heiti SC, WenQuanYi Micro Hei, sans-serif;
}
</style>
