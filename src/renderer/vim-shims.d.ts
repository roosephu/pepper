import PepperLibrary from "@/pepper/PepperLibrary";
import { Database } from "@/pepper/db";

interface PepperDrag {
    dst: any;
    src: any;
}

// src/vue-shims.d.ts
declare module "vue/types/vue" {
    interface Vue {
    //   $pepper: PepperLibrary;
      $db: {[key: string]: Database<any>};
    }
}

declare module "*.vue" {
    import Vue from "vue";

    export default Vue;
}
