<template>
    <div>
        <RenderChildren :model="model"/>
    </div>
</template>

<script lang="ts" setup>
import { BaseBlockModel } from "@blocksuite/store";
import RenderChildren from "../help/RenderChildren.vue";

 defineProps<{
    model: BaseBlockModel
}>()
</script>

<style scoped>

</style>
