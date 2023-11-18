<template>
  <div class="map-pin"></div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
@Component
export default class MapPin extends Vue {}
</script>
<style lang="scss">
.map-pin {
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 12px 12px 0px 12px;
  background-color: rgb(0, 115, 255);
  transform: rotate(45deg);

  &::before {
    position: absolute;
    content: "";
    width: 12px;
    height: 12px;
    border-radius: 12px;
    background-color: rgb(255, 255, 255);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &.act {
    width: 32px;
    height: 32px;
    border-radius: 16px 16px 0px 16px;
    top: -10px;
    left: -5px;
    &::before {
      width: 20px;
      height: 20px;
      border-radius: 20px;
    }
  }
}
</style>
