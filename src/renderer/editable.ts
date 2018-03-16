import { default as _Vue, VueConstructor } from "vue";
import { VNode, VNodeDirective } from "vue/types/vnode";

function install(Vue: VueConstructor<_Vue>) {
    // the expression must be accessible from top level context
    Vue.directive("editable", {
        bind(el: HTMLElement, { expression, value, arg, modifiers }: VNodeDirective, vnode: VNode) {
            el.contentEditable = "true";
            const keyPath = expression.split(".");

            const setValue = (obj: any, path: string[], newValue: any) => {
                for (const key of path.slice(0, path.length - 1)) {
                    obj = obj[key];
                }
                const lastKey = path[path.length - 1];
                obj[lastKey] = newValue;
            };

            const $this = this;
            el.onblur = (event: Event) => {

                if (el.innerText !== value) {
                    if (el.dataset.isModified === "true") {
                        // should set value here
                        setValue(vnode.context, keyPath, el.innerText);
                    } else if (el.innerText !== value) {
                        el.innerText = value;
                    }
                }
                value = el.innerText;
                el.dataset.isModified = "false";
            };

            el.onkeydown = (event: KeyboardEvent) => {
                const { keyCode } = event;
                if (keyCode === 13 || keyCode === 38 || keyCode === 48) { // Enter
                    event.stopPropagation();
                    event.preventDefault();
                    el.blur();
                } else if (keyCode === 27) {
                    el.dataset.isModified = "false";
                    el.blur();
                } else {
                    el.dataset.isModified = "true";
                }
            };
            el.innerText = value;
        },
        update() {
            //
        },
        componentUpdated(el: HTMLElement, { expression, value }: VNodeDirective, vnode: VNode) {
            el.contentEditable = "true";

            if (el.innerText !== value) {
                el.innerText = value;
            }
        },
    });
}

export default install;