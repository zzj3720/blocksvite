<template>
    <div style="width: 100%;">
        <RenderChildren :model="model"/>
    </div>
</template>

<script lang="ts" setup>
import {BaseBlockModel} from "@blocksuite/store";
import RenderChildren from "../RenderChildren.vue";
defineProps<{
    model: BaseBlockModel
}>()
</script>

<style scoped>

</style>
