<template>
  <div>
    <KakaoMap />
  </div>
</template>

<script lang="ts">
import KakaoMap from "@/components/HelloWorld.vue";
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component({
  components: {
    KakaoMap,
  },
})
export default class KakaoMapTest extends Vue {}
</script>
