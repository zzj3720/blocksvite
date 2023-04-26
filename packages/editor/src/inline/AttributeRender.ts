import {BaseTextAttributes} from "../utils/base-attributes";
import Link from "./Link.vue";
import Normal from "./Normal.vue";
import {defineComponent, h, mergeProps, PropType, useAttrs} from "vue";

export const AttributeRender = defineComponent({
    props: {
        text: {
            type: String,
            required: true,
        },
        attributes: {
            type: Object as PropType<BaseTextAttributes>,
            required: true,
        }
    },
    setup: (props) => {
        const attrs = useAttrs()
        return () => {
            if (props.attributes.link) {
                return h(Link, mergeProps(attrs, props) as any)
            }
            return h(Normal, mergeProps(attrs, props) as any)
        }
    }
})
