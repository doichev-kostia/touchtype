export const Milliseconds = {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
};

/**
 * @returns {Clock}
 */
export function createRealtimeClock() {
    return {
        getCurrentMillis() {
            return Date.now();
        }
    };
}
