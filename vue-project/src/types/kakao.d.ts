// 1. Make sure to import 'vue' before declaring augmented types
import Vue from "vue";

declare module "vue/types/vue" {
  // Global properties can be declared
  // on the `VueConstructor` interface
  interface Vue {
    $myGlobal: string;
  }
}
