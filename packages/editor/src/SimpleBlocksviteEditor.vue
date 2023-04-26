<template>
    <div style="padding: 0 12px">
        <div style="display:flex;align-items:center; justify-content: space-between">
            <h2>Blocks<span style="color: #42b883">V</span>ite Playground</h2>
            <div style="padding-right: 20px;"><a href="https://github.com/zuozijian3720/blocksvite" target="_blank"><img
                    style="width: 24px;height: 24px;" :src="githubIcon" alt=""></a></div>
        </div>
        <BlocksviteEditor :page="page"></BlocksviteEditor>
        <div style="margin-top: 12px;">
            A simple Vue version <a href="https://blocksuite.affine.pro/" target="_blank">BlockSuite</a> based on <a
                href="https://github.com/toeverything/blocksuite" target="_blank">@blocksuite/store</a>
        </div>
        <h3 style="margin-top: 24px;">
            Todo
        </h3>
        <div style="padding-left: 12px">
            <div style="margin-bottom: 8px;" v-for="(todo,i) in todos" :key="i"><input style="margin-right: 12px;"
                                                                                       type="checkbox" disabled>{{
                todo
                }}
            </div>
        </div>
        <h3 style="margin-top: 24px;">
            Completed
        </h3>
        <div style="padding-left: 12px">
            <div style="margin-bottom: 8px;" v-for="(feature,i) in featureList" :key="i"><input style="margin-right: 12px;"
                                                                                       type="checkbox" checked disabled>{{
                feature
                }}
            </div>
            <div>
                etc.
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import BlocksviteEditor from "./BlocksviteEditor.vue";
import {ListBlock, PageBlock, ParagraphBlock} from "./block";
import {useEditor} from "./utils/hooks";
import githubIcon from './github-mark.svg'

const page = useEditor([ParagraphBlock, PageBlock, ListBlock])
const pageBlockId = page.addBlock('affine:page');
const p = page.addBlock('blocksvite:paragraph', {}, pageBlockId);
const pModel = page.getBlockById(p)
pModel?.text?.insert('asdasd', 0, {})
pModel?.text?.insert(' ', 0, {})
pModel?.text?.insert(' ', 0, {ref: '@zzj3720', single: true})
pModel?.text?.insert(' ', 0, {})
pModel?.text?.insert(' ', 0, {link: 'http://baidu.com', single: true})
pModel?.text?.insert(' ', 0, {})
pModel?.text?.insert(' ', 0, {link: 'http://baidu.com', single: true})
pModel?.text?.insert('asdasd', 0, {})
const insideP = page.addBlock('blocksvite:paragraph', {}, p);
const insidePModel = page.getBlockById(insideP)
insidePModel?.text?.insert('bold', 0, {bold: true})
insidePModel?.text?.insert('underline', 0, {underline: true})
insidePModel?.text?.insert('strike', 0, {strike: true})
insidePModel?.text?.insert('code', 0, {code: true})
const list = page.addBlock('blocksvite:list', {}, pageBlockId);
const listModel = page.getBlockById(list);
listModel?.text?.insert('italic', 0, {italic: true});
page.resetHistory();
const featureList = [
    'Basic inline edit',
    'Basic block edit',
    'Mention style',
    'Undo and Redo',
    'Inline Formatting Toolbar',
    'Indent',
]
const todos = [
    'A successful project needs a beautiful icon',
    'Slash command',
    'Copy and Paste and Export',
    'Full link support',
    'More blocks(Code, Quote, Image etc.)',
    'Cursor UX improve',
    'Drag and Drop',
    'More extensible',
    'Database'
];
(window as any).page = page;
</script>

<style>
body {
    font-family: Helvetica Neue, Helvetica, Arial, Microsoft Yahei,
    Hiragino Sans GB, Heiti SC, WenQuanYi Micro Hei, sans-serif;
}
</style>
