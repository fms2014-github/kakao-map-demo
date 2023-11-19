<template>
  <div class="kakao-map-wrap">
    <div class="api-key-form">
      <input type="text" v-model="apiKey" />
      <button @click="run()">api 키 적용</button>
    </div>
    <div ref="kakaoMapElement" id="map"></div>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue, Watch } from "vue-property-decorator";
import MapCluster from "./MapCluster.vue";
import MapPin from "./MapPin.vue";

@Component
export default class KakaoMap extends Vue {
  @Ref("kakaoMapElement") kakaoMapElement!: HTMLDivElement;
  mapContainer: any = null;
  kakaoMapSearchService: any = null;
  searchList: any[] = [];
  searchEnd = false;
  customOverlayList: any[] = [];
  mapBounds: any = null;
  kakaoMapClusterer: any = null;
  clursterList: any[] = [];
  clursterComponentList: any[] = [];
  prevSelectedIdx = -1;
  selectedIdx = -1;
  apiKey = "07c20e31d1891825ce375b67602ddf31";
  excludeClusterIdx = -1;
  /*07c20e31d1891825ce375b67602ddf31*/

  run() {
    this.kakaoMapInit();
  }

  @Watch("searchEnd", { immediate: true })
  onSearchEnd(newVal: boolean) {
    if (newVal) {
      this.makeCustomOverlayList();
      this.customOverlayList.forEach((overlay) => {
        this.mapBounds.extend(overlay.getPosition());
      });

      this.mapContainer.setBounds(this.mapBounds);
      this.searchEnd = false;
      this.kakaoMapSetClusterer();
      this.kakaoMapClusterer.redraw();
    }
  }

  kakaoMapInit() {
    let script: HTMLScriptElement = document.querySelector(
      `script[src='https://dapi.kakao.com/v2/maps/sdk.js?appkey=${this.apiKey}&autoload=false&libraries=services,clusterer,drawing']`
    ) as HTMLScriptElement;

    if (script === null) {
      script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${this.apiKey}&autoload=false&libraries=services,clusterer,drawing`;
      script.type = "text/javascript";
      script.onload = () => {
        window.kakao.maps.load(() => {
          this.kakaoMapLoad();
        });
      };
      script.onerror = () => {
        script.remove();
      };
      const head: HTMLHeadElement = document.head;

      head.appendChild(script);
    } else {
      this.kakaoMapLoad();
    }
  }

  kakaoMapLoad() {
    this.createKakaoMapContainer();
    this.createkakaoMapSearchService();
    this.categorySearch();
  }

  createKakaoMapContainer() {
    this.mapContainer = new window.kakao.maps.Map(this.kakaoMapElement, {
      //지도를 생성할 때 필요한 기본 옵션
      center: new window.kakao.maps.LatLng(33.450701, 126.570667), //지도의 중심좌표.
      level: 5, //지도의 레벨(확대, 축소 정도)
    });

    this.mapBounds = this.mapContainer.getBounds();
  }

  createkakaoMapSearchService() {
    if (this.mapContainer) {
      this.kakaoMapSearchService = new window.kakao.maps.services.Places(
        this.mapContainer
      );
    }
  }

  categorySearch() {
    if (this.kakaoMapSearchService) {
      this.kakaoMapSearchService.categorySearch(
        "FD6",
        (result: any, status: any, pagination: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            this.searchList.push(result);
            if (!pagination.hasNextPage) {
              this.searchList = this.searchList.flat();
              this.searchEnd = true;
            }
            pagination.nextPage();
          }
        }
      );
    }
  }

  makeCustomOverlayList() {
    this.searchList.forEach((element, index) => {
      const pinComponent = new MapPin();
      pinComponent.$mount();

      pinComponent.$el.addEventListener("click", ($event: Event) => {
        const mcIndex = index;
        const target = $event.target as HTMLElement;
        if (this.selectedIdx !== -1 && this.selectedIdx === mcIndex) {
          target.classList.remove("act");
          this.selectedIdx = -1;
          this.prevSelectedIdx = -1;
        } else if (this.selectedIdx !== -1) {
          this.prevSelectedIdx = this.selectedIdx;
          const prevTarget = this.customOverlayList[
            this.prevSelectedIdx
          ].getContent() as HTMLElement;
          prevTarget.classList.remove("act");
          target.classList.add("act");
          this.selectedIdx = mcIndex;
          this.clursterComponentList.forEach((item, index) => {
            if (this.excludeClusterIdx !== index) {
              item.$props["openMcList"] = false;
            }
          });
        } else {
          target.classList.add("act");
          this.selectedIdx = mcIndex;
        }
        this.excludeClusterIdx = -1;
        this.clursterComponentList.forEach((item) => {
          item.$forceUpdate();
        });
      });

      const customOverlay = new window.kakao.maps.CustomOverlay({
        map: this.mapContainer,
        clickable: true,
        content: pinComponent.$el,
        position: new window.kakao.maps.LatLng(element.y, element.x),
      });

      this.customOverlayList.push(customOverlay);
    });
  }

  kakaoMapSetClusterer() {
    this.kakaoMapClusterer = new window.kakao.maps.MarkerClusterer({
      map: this.mapContainer,
      markers: this.customOverlayList,
      gridSize: 32,
      averageCenter: true,
      disableClickZoom: true,
    });

    window.kakao.maps.event.addListener(
      this.kakaoMapClusterer,
      "clustered",
      this.onClusterer
    );
  }

  onClusterer(clusters: any[]) {
    this.clursterComponentList = [];
    clusters?.forEach((cluster: any, index) => {
      const clusterInMarksers = cluster.getMarkers() as any[];
      const mcList: any[] = [];
      const markerCluster = cluster.getClusterMarker();

      clusterInMarksers.forEach((clusterInMarker) => {
        const fIdx = this.customOverlayList.findIndex((marker) => {
          const clusterInMarkerPos = clusterInMarker.getPosition();
          const markerPos = marker.getPosition();
          return clusterInMarkerPos.equals(markerPos);
        });
        if (fIdx !== -1) {
          mcList.push(this.searchList[fIdx]);
        }
      });

      const mapCluster = new MapCluster();
      mapCluster.$props["markers"] = clusterInMarksers;
      mapCluster.$props["mcList"] = mcList;
      mapCluster.$props["openMcList"] = false;
      mapCluster.$on("onClusterClick", (data: boolean) => {
        if (!data) {
          this.clursterComponentList.forEach((component) => {
            component.$props["openMcList"] = false;
          });
        }
        mapCluster.$props["openMcList"] = !data;
      });
      mapCluster.$on("onClusterInMcItemClick", (data: string) => {
        const fIdx = this.searchList.findIndex((item) => {
          return item.id === data;
        });

        if (fIdx !== -1) {
          this.excludeClusterIdx = index;
          this.prevSelectedIdx = this.selectedIdx;
          const target = this.customOverlayList[
            fIdx
          ].getContent() as HTMLElement;
          const forceEvnet = new Event("click");
          target.dispatchEvent(forceEvnet);
          mapCluster.$forceUpdate();
        }
      });
      mapCluster.$mount();
      this.clursterComponentList.push(mapCluster);
      markerCluster.setContent(mapCluster.$el);
    });
  }
}
</script>

<style lang="scss" scoped>
.api-key-form {
  margin: 20px;
  input[type="text"] {
    width: 300px;
  }
}
#map {
  width: calc(100vw - 16px);
  height: calc(100vh - 72px);
}
</style>
