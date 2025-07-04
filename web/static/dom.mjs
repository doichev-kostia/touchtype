/**
 * @template T
 * @param {Element | null} element
 * @param {new (...args: any[]) => T} target
 * @returns {element is T}
 */
export function isDomElementAvailable(element, target) {
    return element instanceof target;
}
