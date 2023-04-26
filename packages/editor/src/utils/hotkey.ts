import {isHotkey} from "is-hotkey";

export const IS_MAC = /Mac/i.test(globalThis.navigator.userAgent);

export const Undo = isHotkey('cmd+z')
export const Redo = isHotkey('cmd+shift+z')
export const Tab = isHotkey('tab')
