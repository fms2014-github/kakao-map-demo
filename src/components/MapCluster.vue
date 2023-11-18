<template>
  <div class="cluster">
    <div class="map-cluster" @click="clusterClick()">
      <span class="count">{{ count }}</span>
    </div>
    <div ref="mcListBox" v-if="this.openMcList" class="mc-list">
      <div
        ref="listItem"
        class="mc-item"
        :class="selectedMarker(data)"
        v-for="data in dataSet"
        :key="data.mc.id"
      >
        {{ data.mc.place_name }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Ref, Watch } from "vue-property-decorator";
@Component
export default class MapCluster extends Vue {
  @Prop() readonly markers!: any[];
  @Prop() readonly mcList!: any[];
  @Ref("listItem") readonly listItem!: HTMLElement[];
  @Ref("mcListBox") readonly mcListBox!: HTMLElement;

  count = 0;
  openMcList = false;
  dataSet: any[] = [];
  @Watch("openMcList", { immediate: true, deep: true })
  async onOpenMcList(newVal: any, oldVal: any) {
    await this.$nextTick(() => {
      if (newVal) {
        const fIdx = this.markers.findIndex((marker) => {
          const content = marker.getContent() as HTMLElement;
          return content.classList.contains("act");
        });

        if (fIdx !== -1) {
          this.mcListBox.scrollTo(0, this.listItem[fIdx].offsetTop);
        }
      }
    });
  }

  async mounted() {
    console.log(this.mcList);

    this.count = this.markers.length;
    this.markers.forEach((marker, index) => {
      this.dataSet.push({ mc: this.mcList[index], marker });
    });
  }

  clusterClick() {
    this.openMcList = !this.openMcList;
  }

  selectedMarker(data: any) {
    const element = data.marker.getContent() as HTMLElement;
    const isAct = element.classList.contains("act");
    return {
      selected: isAct,
    };
  }
}
</script>
<style lang="scss">
.cluster {
  position: relative;
  width: 0px;
  height: 0px;
  .map-cluster {
    position: absolute;
    width: 32px;
    height: 32px;
    border-radius: 16px 16px 0px 16px;
    background-color: rgb(0, 115, 255);
    transform: rotate(45deg);

    .count {
      content: "";
      position: absolute;
      display: inline-block;
      width: 24px;
      height: 24px;
      border-radius: 24px;
      background-color: rgb(255, 255, 255);
      line-height: 24px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
    }
  }

  .mc-list {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    top: 40px;
    width: 140px;
    max-height: 104px;
    border-radius: 6px;
    overflow-x: hidden;
    overflow-y: scroll;
    transform: translateX(calc(-50% + 16px));
    .mc-item {
      display: inline-block;
      width: calc(100% - 2px);
      height: 24px;
      line-height: 24px;
      border-radius: 6px;
      background-color: white;
      font-size: 12px;
      border: {
        width: 1px;
        style: solid;
        color: rgb(240, 240, 240);
      }

      &.selected {
        border-color: rgb(0, 115, 255);
      }
    }
  }
}
</style>
