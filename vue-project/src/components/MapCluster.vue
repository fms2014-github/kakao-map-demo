<template>
  <div ref="cluster" class="cluster" @click.stop="onClusterClick()">
    <div class="map-cluster">
      <span class="count">{{ count }}</span>
    </div>
    <div ref="mcListBox" v-if="openMcList" class="mc-list">
      <div
        ref="listItem"
        class="mc-item"
        :class="selectedMarker(data)"
        v-for="data in dataSet"
        :key="data.mc.id"
        @click.stop="onClusterInMcItemClick(data.mc.id)"
      >
        {{ data.mc.place_name }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Ref, Watch, Emit } from "vue-property-decorator";
@Component
export default class MapCluster extends Vue {
  @Prop() readonly markers!: any[];
  @Prop() readonly mcList!: any[];
  @Prop() readonly openMcList!: boolean;
  @Ref("listItem") readonly listItem!: HTMLElement[];
  @Ref("mcListBox") readonly mcListBox!: HTMLElement;
  @Ref("cluster") readonly cluster!: HTMLElement;

  count = 0;

  dataSet: any[] = [];
  @Watch("openMcList")
  async onOpenMcList(newVal: any, oldVal: any) {
    await this.$nextTick(() => {
      this.changeEvent(newVal);
    });
  }

  async mounted() {
    console.log(this.mcList);

    this.count = this.markers.length;
    this.markers.forEach((marker, index) => {
      this.dataSet.push({ mc: this.mcList[index], marker });
    });
  }

  @Emit("onClusterClick")
  onClusterClick() {
    return this.openMcList;
  }

  @Emit("onClusterInMcItemClick")
  onClusterInMcItemClick(id: string) {
    return id;
  }

  selectedMarker(data: any) {
    const element = data.marker.getContent() as HTMLElement;
    const isAct = element.classList.contains("act");
    return {
      selected: isAct,
    };
  }

  selectedTracking() {
    const fIdx = this.markers.findIndex((marker) => {
      const content = marker.getContent() as HTMLElement;
      return content.classList.contains("act");
    });

    if (fIdx !== -1) {
      this.mcListBox.scrollTo(0, this.listItem[fIdx].offsetTop);
    }
  }

  changeEvent(status: boolean) {
    const clusterPin = this.cluster.parentElement as HTMLElement;
    if (status) {
      this.selectedTracking();
      clusterPin.style.zIndex = "10";
    } else {
      clusterPin.style.zIndex = "";
    }
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
    z-index: 1000;
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
