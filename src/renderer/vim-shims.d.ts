import PepperLibrary from "@/pepper/PepperLibrary";
import { Database } from "@/pepper/db";

interface PepperDrag {
    dst: any;
    src: any;
}

// src/vue-shims.d.ts
declare module "vue/types/vue" {
    interface Vue {
      $pepper: PepperLibrary;
      $drag: PepperDrag;
      $db: {[key: string]: Database};
    }
}

declare module "*.vue" {
    import Vue from "vue";

    export default Vue;
}
