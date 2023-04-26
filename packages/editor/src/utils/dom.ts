export const getOffsetLeftAndTop = (container: HTMLElement, target: HTMLElement) => {
    let offsetLeft = 0;
    let offsetTop = 0;
    let current: HTMLElement | null = target;
    while (current) {
        if (current === container) {
            return {offsetLeft, offsetTop}
        }
        offsetLeft += current.offsetLeft;
        offsetTop += current.offsetTop;
        current = current.offsetParent instanceof HTMLElement ? current.offsetParent : null;
    }
    throw new Error('this is a bug')
}
