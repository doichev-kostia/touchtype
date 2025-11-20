import { assert } from "./assert.mjs";

export const GameMode = {
    Lowercase: "Lowercase",
    MixedCase: "MixedCase",
    FingerFocus: "FingerFocus",
};

export const Keyset = {
    Letters: "Letters",
    Numbers: "Numbers",
    Symbols: "Symbols",
    SpecialKeys: "SpecialKeys", // tab, shift, enter, ...
    Alphanumeric: "Alphanumeric", // letters, numbers
    Printable: "Printable", // letters, numbers, symbols
};

export const GameState = {
    Pending: "Pending",
    Play: "Play",
    Stop: "Stop",
};

/**
 * Note: the order matters
 * @type {KeyFinger[]}
 */
export const KeyFingers = [
    "left-pinky",
    "left-ring",
    "left-middle",
    "left-index",
    "left-thumb",
    "right-thumb",
    "right-index",
    "right-middle",
    "right-ring",
    "right-pinky",
];

/**
 * Map of different keysets grouped by the finger
 * @type {Record<string, Array<Array<string>>>}
 */
export const Keys = {
    [Keyset.Letters]: [
        // left-pinky
        ["q", "a", "z"],
        // left-ring
        ["w", "s", "x"],
        // left-middle
        ["e", "d", "c"],
        // left-index
        ["r", "f", "v", "t", "g", "b"],
        // left-thumb
        [],
        // right-thumb
        [],
        // right-index
        ["y", "h", "n", "u", "j", "m"],
        // right-middle
        ["i", "k"],
        // right-ring
        ["o", "l"],
        // right-pinky
        ["p"]
    ],
    [Keyset.Numbers]: [
        // left-pinky
        ["1"],
        // left-ring
        ["2"],
        // left-middle
        ["3"],
        // left-index
        ["4", "5"],
        // left-thumb
        [],
        // right-thumb
        [],
        // right-index
        ["6", "7"],
        // right-middle
        ["8"],
        // right-ring
        ["9"],
        // right-pinky
        ["0"]
    ],
    [Keyset.Symbols]: [
        // left-pinky
        ["=", "+", "`", "~", "!"],
        // left-ring
        ["@"],
        // left-middle
        ["#"],
        // left-index
        ["$", "%"],
        // left-thumb
        [],
        // right-thumb
        [],
        // right-index
        ["^", "&"],
        // right-middle
        ["*", "<", ","],
        // right-ring
        ["(", ".", ">", "[", "{"],
        // right-pinky
        [")", ";", ":", "/", "?", "]", "}", "-", "_", "\\", "|", "'", "\""]
    ],
    [Keyset.SpecialKeys]: [
        // left-pinky
        ["Tab" /* "F1" */ /* "Escape" */ /* "F2" */],
        // left-ring
        [/* "F3" */],
        // left-middle
        ["ArrowLeft" /* "F4" */ /* "F11" // 2nd layer */],
        // left-index
        ["ArrowRight" /* "F5" */ /* "F12" // 2nd layer */],
        // left-thumb
        ["Shift", "Backspace", "Meta", "Delete", "Alt"],
        // right-thumb
        ["Control", "Alt", "Meta", "Enter", "Shift", "Space"],
        // right-index
        ["ArrowDown" /* "F6" */],
        // right-middle
        ["ArrowUp" /* "F7" */],
        // right-ring
        [/* "F8" */],
        // right-pinky
        [/* "F9" */ /* "F10" */ /* "PageUp" */ /* "PageDown" */]
    ],
    [Keyset.Alphanumeric]: [
        // left-pinky
        ["1", "q", "a", "z"],
        // left-ring
        ["2", "w", "s", "x"],
        // left-middle
        ["3", "e", "d", "c"],
        // left-index
        ["4", "r", "f", "v", "5", "t", "g", "b"],
        // left-thumb
        [],
        // right-thumb
        [],
        // right-index
        ["6", "y", "h", "n", "7", "u", "j", "m"],
        // right-middle
        ["8", "i", "k"],
        // right-ring
        ["9", "o", "l"],
        // right-pinky
        ["0", "p"]
    ],
    [Keyset.Printable]: [
        // left-pinky
        ["=", "+", "`", "~", "1", "!", "q", "a", "z"],
        // left-ring
        ["2", "@", "w", "s", "x"],
        // left-middle
        ["3", "#", "e", "d", "c"],
        // left-index
        ["4", "$", "r", "f", "v", "5", "%", "t", "g", "b"],
        // left-thumb
        [],
        // right-thumb
        [],
        // right-index
        ["6", "^",  "y", "h", "n", "7", "&", "u", "j", "m"],
        // right-middle
        ["8", "*", "i", "k", ",", "<"],
        // right-ring
        ["9", "(", "o", "l", ".", ">", "[", "{"],
        // right-pinky
        ["0", ")", "p", ";", ":", "/", "?", "]", "}", "-", "_", "\\", "|", "'", "\""]
    ],
};

export const TerminatingKey = "Escape";

/**
 *    @param {number} min
 *    @param {number} max
 *    @returns {number}
 */
export function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {Clock} clock
 * @returns {Game}
 */
export function create(clock) {
    /** @type {Game} */
    let game = {
        mode: GameMode.Lowercase,
        keyset: Keyset.Letters,
        state: GameState.Pending,
        elapsedMillis: 0,
        startTimeMillis: clock.getCurrentMillis(),
        keysShown: 0,
        keysCorrect: 0,
        keysPressed: 0,
        clock,
        selectedKey: { key: "", finger: 0 },
        modifiers: []
    };
    let [k, err] = getRandomKey(game.keyset, []);
    // the game creation is the place where the user has no control over,
    // therefore, it's a programmer error
    assert(err == null, `game.create.key_select_err keyset=${game.keyset};err=${err}`)
    game.selectedKey = k
    game.keysShown += 1;

    return game;
}

/**
 *
 * @param {Game} game
 * @param {Modifier} modifier
 */
export function upsertModifier(game, modifier) {
    if (game.modifiers.length === 0) {
        game.modifiers.push(modifier)
    }

    let existingModifierIdx = -1;
    for (let i = 0; i < game.modifiers.length; i += 1) {
        if (game.modifiers[i].type === modifier.type) {
            existingModifierIdx = i;
            break
        }
    }
    if (existingModifierIdx === -1) {
        game.modifiers.push(modifier);
    } else {
        game.modifiers[existingModifierIdx] = modifier
    }
}

/**
 *
 * @param {Game} game
 * @param {string} type
 */
export function removeModifier(game, type) {
    for (let i = 0; i < game.modifiers.length; i += 1) {
        if (game.modifiers[i].type !== type) continue

        if (game.modifiers.length === 1) {
            game.modifiers.length = 0;
        } else {
            let len = game.modifiers.length
            game.modifiers[i] = game.modifiers[len - 1]
            game.modifiers.length -= 1;
        }
        return
    }
}

const VERSION = 1;

/**
 * @param {Game} game
 * @param {Storage} storage
 *
 */
export function save(game, storage) {
    let serializable = {
            mode: game.mode,
            keyset: game.keyset,
            modifiers: game.modifiers,
    }
    let jsn = JSON.stringify(serializable)
    storage.setItem(`game:${VERSION}`, jsn)
}

/**
 * @param {Game} game
 * @param {Storage} storage
 * @returns {Error | null}
 */
export function load(game, storage) {
    let data = storage.getItem(`game:${VERSION}`);
    if (data == null) {
        return new Error(`game.load.no_data version=${VERSION}`);
    }

    let serializable;
    try {
        serializable = JSON.parse(data);
    } catch (e) {
        return new Error(`game.load.parse_error version=${VERSION};data=${data};err=${e}`);
    }

    if (typeof game.mode === "string") {
        game.mode = serializable.mode;
    }
    if (typeof game.keyset === "string") {
        game.keyset = serializable.keyset;
    }
    if (Array.isArray(game.modifiers)) {
        game.modifiers = serializable.modifiers;
    }
    return null
}

/**
 * @param {Game} game
 * @param {number} elapsedMillis
 */
export function tick(game, elapsedMillis) {
    if (game.state === GameState.Play) {
        game.elapsedMillis += elapsedMillis;
    }
}

/**
 * @param {Game} game
 */
export function play(game) {
    game.state = GameState.Play;
}

/**
 * @param {Game} game
 */
export function stop(game) {
    game.state = GameState.Stop;
}

/**
 * @param {Game} game
 * @param {string} mode
 * @param {string} keyset
 * @param {Array<Modifier>} modifiers
 * @returns {Error | null}
 */
export function restart(game, mode, keyset, modifiers) {
    game.mode = mode;
    game.keyset = keyset;
    game.elapsedMillis = 0;
    game.startTimeMillis = game.clock.getCurrentMillis();
    game.keysShown = 0;
    game.keysCorrect = 0;
    game.keysPressed = 0;
    game.modifiers = modifiers;

    let [k, err] = getRandomKey(game.keyset, game.modifiers);
    if (err != null) {
        return err
    }
    game.selectedKey = k;
    game.keysShown += 1;
}

/**
 * @param {Game} game
 * @returns {Error | null}
 */
export function selectKey(game) {
    const MAX_ITERATIONS = 30;
    let iter = 0;
    /** @type {SelectedKey} */
    let newKey = {
        key: "",
        finger: 0
    };
    let hasFingerFocus = false;
    for (const m of game.modifiers) {
        if (m.type === "FingerFocus") {
            hasFingerFocus = true;
            break;
        }
    }

    // Find out how many keys are available for the selected finger
    // If there is only 1 key, we will not shuffle the set of keys shown
    let totalKeys = Keys[game.keyset].length;
    for (const m of game.modifiers) {
        if (m.type === "FingerFocus") {
            // no fingers specified -> no purpose to filter
            if (m.fingers.length === 0) break;

            totalKeys = 0;
            for (const f of m.fingers) {
                let fingerKeys = Keys[game.keyset][f];
                assert(Array.isArray(fingerKeys), "game.select_key.no_finger_keys")
                totalKeys += fingerKeys.length
            }
        }
    }


    do {
        if (iter >= MAX_ITERATIONS) {
            return new Error(`game.selectKey.iterations_exceeded iter=${iter};key=${game.selectedKey};keyset=${game.keyset};`);
        }
        let [k, err] = getRandomKey(game.keyset, game.modifiers);
        if (err != null) return err
        newKey = k
        iter += 1;
    } while (game.selectedKey.key === newKey.key && totalKeys > 1);
    game.selectedKey = newKey;
    game.keysShown += 1;
}

/**
 * @param {Game} game
 * @param {string} key
 * @returns {boolean}
 */
export function verifyKey(game, key) {
    if (key === " ") {
        key = "Space";
    }
    return game.selectedKey.key === key;
}

/**
 * @param {Game} game
 */
export function registerSuccessfulKeypress(game) {
    game.keysCorrect += 1;
}

/**
 * @param {Game} game
 */
export function registerKeypress(game) {
    game.keysPressed += 1;
}


/**
 * @param {Game} game
 * @returns {string}
 */
export function displayKey(game) {
    if (game.selectedKey.key === "ArrowUp") {
        return "↑";
    } else if (game.selectedKey.key === "ArrowDown") {
        return "↓";
    } else if (game.selectedKey.key === "ArrowLeft") {
        return "←";
    } else if (game.selectedKey.key === "ArrowRight") {
        return "→";
    } else if (game.selectedKey.key === "Backspace") {
        return "⌫";
    } else if (game.selectedKey.key === "Enter") {
        return "↵";
    } else if (game.selectedKey.key === "Space") {
        return "␣";
    } else if (game.selectedKey.key === "Shift") {
        return "⇧";
    } else if (game.selectedKey.key === "Control") {
        return "Ctrl";
    } else if (game.selectedKey.key === "Delete") {
        return "Del";
    } else if (game.selectedKey.key === "Meta") {
        return "⌘";
    } else {
        return game.selectedKey.key;
    }
}

/**
 * @param {Game} game
 * @returns {KeyFinger}
 */
export function getKeyFinger(game) {
    return KeyFingers[game.selectedKey.finger]
}

export class ErrKeysetEmpty extends Error {}
ErrKeysetEmpty.prototype.name = "ErrKeysetEmpty";

export class ErrNoKeysMatchingFilter extends Error {}
ErrNoKeysMatchingFilter.prototype.name = "ErrNoKeysMatchingFilter";

/**
 *
 * @param {string} keyset
 * @param {Array<Modifier>} modifiers
 * @returns {[SelectedKey, Error | null]}
 */
export function getRandomKey(keyset, modifiers) {
    let set = Keys[keyset];
    /** @type {SelectedKey} */
    let result = {
        key: "",
        finger: 0
    }

    if (set.length === 0) {
        return [result, new ErrKeysetEmpty()];
    }

    // Some keysets do not have keys for all the fingers.
    // For instance, there are no numbers or letters for thumbs
    // Therefore, we need to filter those out
    /** @type {Array<number>} */
    let fingersWithKeys = []
    for (let i = 0; i < set.length; i += 1) {
        if (set[i].length > 0) {
            fingersWithKeys.push(i)
        }
    }

    let finger = -1
    let isUppercase = false;
    for (const m of modifiers) {
        if (m.type === "FingerFocus") {
            if (m.fingers.length === 0) continue
            // The user's filter can be too strict, and the keyset they chose
            // may not have the keys for their "focused" fingers
            /** @type {Array<number>} */
            let fingersIntersection = []
            for (const f of m.fingers) {
                for (const ff of fingersWithKeys) {
                    if (ff === f) {
                        fingersIntersection.push(f)
                        break
                    }
                }
            }
            if (fingersIntersection.length === 0) {
                return [result, new ErrNoKeysMatchingFilter()];
            }

            let idx = getRandomInteger(0, fingersIntersection.length - 1)
            finger = fingersIntersection[idx]
        } else if (m.type === "MixedCase") {
            isUppercase = Math.random() > 0.5;
        }
    }

    if (finger === -1) {
        let idx = getRandomInteger(0, fingersWithKeys.length - 1);
        finger = fingersWithKeys[idx];
    }
    result.finger = finger

    let keys = set[finger];
    assert(Array.isArray(keys), `game.get_random_key.finger_not_defined_in_keyset keyset=${keyset};finger=${finger}`)
    // the filtering work above should've found a definite match or already
    // returned with an error
    assert(keys.length > 0, `game.get_random_key.no_keys_for_finger keyset=${keyset};finger=${finger}`)

    let idx = getRandomInteger(0, keys.length - 1);
    result.key = keys[idx];
    assert(typeof result.key === "string", `game.get_random_key.invalid_key keyset=${keyset};finger=${finger};idx=${idx};key=${result.key}`)

    if (isUppercase && isLetter(result.key)) {
        result.key = result.key.toUpperCase()
    }

    return [result, null]
}

/**
 *
 * @param {string} key
 * @returns {boolean}
 */
function isLetter(key)  {
    return ('a' <= key && key <= 'z') || ('A' <= key && key <= 'Z');
}


