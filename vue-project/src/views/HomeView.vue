<template>
  <div class="home">
    <div style="display: flex">
      <div style="margin: 10px">
        startMouseClientX: {{ startMouseClientX }}<br />moveMouseClientX:
        {{ moveMouseClientX }}<br />itemOffsetLeft: {{ itemOffsetLeft
        }}<br />itemClientLeft: {{ itemClientLeft }}<br />itemRectLeft:
        {{ itemRectLeft }}<br />wrapRectLeft:
        {{ wrapRectLeft }}
      </div>
      <div style="margin: 10px">
        startMouseClientY:
        {{ startMouseClientY }}<br />moveMouseClientY: {{ moveMouseClientY
        }}<br />itemOffsetTop: {{ itemOffsetTop }}<br />itemClientTop:
        {{ itemClientTop }}<br />itemRectTop: {{ itemRectTop
        }}<br />wrapRectTop:
        {{ wrapRectTop }}
      </div>
    </div>
    <div ref="listBox1" class="list-box1">
      <div
        class="list-item1"
        :data-ord="index"
        v-for="(item, index) in list"
        :key="item"
      >
        {{ item }}
        <div class="handle"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref } from "vue-property-decorator";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

@Component({
  components: {
    HelloWorld,
  },
})
export default class HomeView extends Vue {
  @Ref("listBox1") readonly listBox1!: HTMLElement;
  list = ["111111", "222222", "333333"];
  startMouseClientX = 0;
  startMouseClientY = 0;
  moveMouseClientX = 0;
  moveMouseClientY = 0;
  itemOffsetLeft = 0;
  itemClientLeft = 0;
  itemRectLeft = 0;
  wrapRectLeft = 0;
  itemOffsetTop = 0;
  itemClientTop = 0;
  itemRectTop = 0;
  wrapRectTop = 0;

  mounted() {
    let 시작x좌표 = 0;
    let 시작y좌표 = 0;
    let 아이템높이 = 0;
    this.listBox1.addEventListener("touchstart", ($event: TouchEvent) => {
      const target = $event.target as HTMLElement;
      const touch = $event.touches[0] as Touch;
      const classList = target.classList as DOMTokenList;
      if (classList.contains("list-item1")) {
        시작x좌표 = touch.clientX - target.getBoundingClientRect().left;

        this.startMouseClientX = touch.clientX;
        this.observerX(target);
      } else if (classList.contains("handle")) {
        const listItem = target.parentElement as HTMLElement;
        시작y좌표 = touch.clientY - listItem.getBoundingClientRect().top;
        아이템높이 = listItem.offsetHeight;
        this.startMouseClientY = touch.clientY;
        this.observerY(target, listItem);
      }
    });
    this.listBox1.addEventListener("touchmove", ($event: TouchEvent) => {
      if ($event.cancelable) $event.preventDefault();
      const target = $event.target as HTMLElement;
      const touch = $event.touches[0] as Touch;
      const classList = target.classList as DOMTokenList;
      if (classList.contains("list-item1")) {
        const 이동한거리 =
          touch.clientX -
          시작x좌표 -
          this.listBox1.getBoundingClientRect().left;

        this.moveMouseClientX = touch.clientX;
        this.observerX(target);
        if (이동한거리 < -100) {
          target.style.left = "-100px";
        } else if (이동한거리 > 0) {
          target.style.left = "0px";
        } else {
          target.style.left = `${이동한거리}px`;
        }
      } else if (classList.contains("handle")) {
        const listItem = target.parentElement as HTMLElement;
        const ord = Number(listItem.dataset["ord"]) ?? 0;
        const listBoxRectTop = this.listBox1.getBoundingClientRect().top;

        const 이동한거리 =
          touch.clientY - 시작y좌표 - listBoxRectTop - 아이템높이 * ord;
        if (이동한거리 <= -1 * 아이템높이 * ord) {
          listItem.style.top = `${-1 * 아이템높이 * ord}px`;
        } else if (이동한거리 >= 아이템높이 * (2 - ord)) {
          listItem.style.top = `${아이템높이 * (2 - ord)}px`;
        } else {
          listItem.style.top = `${이동한거리}px`;

          const changeTholder = Math.ceil(아이템높이 / 2);
          const changeTrigger = Math.floor(
            Math.abs(이동한거리 / changeTholder)
          );
          console.log(
            `이동한거리: ${이동한거리}, changeTholder: ${changeTholder}, changeTrigger: ${changeTrigger}`
          );

          if (changeTrigger % 2 === 1) {
            console.log(this.listBox1.children[0]);
          }
        }
        this.moveMouseClientY = touch.clientY;
        this.observerY(target, listItem);
      }
    });
  }

  observerX(target: HTMLElement) {
    this.itemOffsetLeft = target.clientLeft;
    this.itemClientLeft = target.offsetLeft;
    this.itemRectLeft = target.getBoundingClientRect().left;
    this.wrapRectLeft = this.listBox1.getBoundingClientRect().left;
  }

  observerY(target: HTMLElement, listItem: HTMLElement) {
    this.itemOffsetTop = target.clientTop;
    this.itemClientTop = target.offsetTop;
    this.itemRectTop = listItem.getBoundingClientRect().top;
    this.wrapRectTop = this.listBox1.getBoundingClientRect().top;
  }
}
</script>

<style lang="scss">
.list-box1 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100% - 1px);
  position: relative;
  .list-item1 {
    display: flex;
    justify-content: center;
    align-items: center;
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
    border: {
      width: 1px;
      style: solid;
      color: black;
    }
    width: 100%;
    height: 28px;
    position: relative;

    .handle {
      width: 18px;
      height: 18px;
      border: {
        width: 1px;
        style: solid;
        coloe: black;
      }
    }
  }
}
</style>
