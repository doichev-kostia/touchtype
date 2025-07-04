/**
 *
 * @param {boolean} v
 * @param {string} msg
 */
export function assert(v, msg) {
    if (!v) {
        throw new Error(msg)
    }
}
