<template>
  <div>
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

  async mounted() {
    await this.$nextTick(() => {
      this.kakaoMapInit();
    });
  }

  @Watch("searchEnd", { immediate: true })
  onSearchEnd(newVal: boolean) {
    if (newVal) {
      console.log("awefawefaoijfasoi;djfoais");
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
      "script[src='//dapi.kakao.com/v2/maps/sdk.js?appkey=07c20e31d1891825ce375b67602ddf31&autoload=false&libraries=services,clusterer,drawing']"
    ) as HTMLScriptElement;

    if (script === null) {
      script = document.createElement("script");
      script.src =
        "http://dapi.kakao.com/v2/maps/sdk.js?appkey=07c20e31d1891825ce375b67602ddf31&autoload=false&libraries=services,clusterer,drawing";
      script.type = "text/javascript";
      script.onload = () => {
        window.kakao.maps.load(() => {
          this.kakaoMapLoad();
        });
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
              console.log(this.searchList);
              this.searchEnd = true;
            }
            pagination.nextPage();
          }
        }
      );
    }
  }

  makeCustomOverlayList() {
    this.searchList.forEach((element) => {
      const pinComponent = new MapPin();
      pinComponent.$mount();

      pinComponent.$el.addEventListener("click", ($event: Event) => {
        const target = $event.target as HTMLElement;
        if (!target.classList.contains("act")) {
          this.customOverlayList.forEach((element) => {
            const content = element.getContent() as HTMLElement;
            content.classList.remove("act");
          });
        }
        target.classList.toggle("act");
      });

      const customOverlay = new window.kakao.maps.CustomOverlay({
        map: this.mapContainer,
        clickable: true,
        content: pinComponent.$el,
        position: new window.kakao.maps.LatLng(element.y, element.x),
        zIndex: 3,
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
    clusters?.forEach((cluster: any) => {
      const marksers = cluster.getMarkers() as any[];
      const mcList: any[] = [];
      const markerCluster = cluster.getClusterMarker();

      marksers.forEach((clusterInMarker) => {
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
      mapCluster.$props["markers"] = marksers;
      mapCluster.$props["mcList"] = mcList;
      mapCluster.$mount();
      markerCluster.setContent(mapCluster.$el);
      markerCluster.setZIndex(20);
    });
  }
}
</script>

<style lang="scss" scoped>
#map {
  width: 100vw;
  height: 100vh;
}
</style>
