import {BaseTextAttributes} from "../utils/base-attributes";
import Link from "./Link.vue";
import Normal from "./Normal.vue";

export const render = (text: string, attributes: BaseTextAttributes) => {
    if (attributes.link) {
        return Link
    }
    return Normal
}
