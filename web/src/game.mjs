const GameMode = {
    Lowercase: "Lowercase",
    MixedCase: "MixedCase",
    FingerFocus: "FingerFocus",
};

const Keyset = {
    Letters: "Letters",
    Numbers: "Numbers",
    Symbols: "Symbols",
    SpecialKeys: "SpecialKeys", // tab, shift, enter, ...
    Alphanumeric: "Alphanumeric", // letters, numbers
    Printable: "Printable", // letters, numbers, symbols
}

const GameState = {
    Pending: "Pending",
    Play: "Play",
    Stop: "Stop",
};

/**
 * @type {KeyFinger[]}
 */
const KeyFingers = [
    "left-thumb",
    "left-index",
    "left-middle",
    "left-ring",
    "left-pinky",
    "right-thumb",
    "right-index",
    "right-middle",
    "right-ring",
    "right-pinky",
];

/**
 * @type {Record<string, KeyFinger>}
 */
const KeyFingerMap = {
    /* Left pinky */
    "=": "left-pinky",
    "+": "left-pinky",
    "tab": "left-pinky",
    "`": "left-pinky",
    "~": "left-pinky",
    "1": "left-pinky",
    "q": "left-pinky",
    "a": "left-pinky",
    "z": "left-pinky",
    /* Left pinky */

    /* Left ring */
    "2": "left-ring",
    "w": "left-ring",
    "s": "left-ring",
    "x": "left-ring",
    /* Left ring */

    /* Left middle */
    "3": "left-middle",
    "e": "left-middle",
    "d": "left-middle",
    "c": "left-middle",
    /* Left middle */

    /* Left index */
    "4": "left-index",
    "r": "left-index",
    "f": "left-index",
    "v": "left-index",
    "5": "left-index",
    "t": "left-index",
    "g": "left-index",
    "b": "left-index",
    /* Left index */

    /* Right index */
    "6": "right-index",
    "y": "right-index",
    "h": "right-index",
    "n": "right-index",
    "7": "right-index",
    "u": "right-index",
    "j": "right-index",
    "m": "right-index",
    /* Right index */

    /* Right middle */
    "8": "right-middle",
    "i": "right-middle",
    "k": "right-middle",
    ",": "right-middle",
    "<": "right-middle",
    /* Right middle */

    /* Right ring */
    "9": "right-ring",
    "o": "right-ring",
    "l": "right-ring",
    ".": "right-ring",
    ">": "right-ring",
    "[": "right-ring",
    "{": "right-ring",
    /* Right ring */

    /* Right pinky */
    "0": "right-pinky",
    "p": "right-pinky",
    ";": "right-pinky",
    ":": "right-pinky",
    "/": "right-pinky",
    "?": "right-pinky",
    "]": "right-pinky",
    "}": "right-pinky",
    "-": "right-pinky",
    "_": "right-pinky",
    "\\": "right-pinky",
    "|": "right-pinky",
    "'": "right-pinky",
    "\"": "right-pinky",
    /* Right pinky */
};

/**
 *
 * @type {Record<keyof typeof Keyset, Array<string>>}
 */
const Keys = {
    [Keyset.Letters]: [
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
        "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
        "u", "v", "w", "x", "y", "z",
    ],
    [Keyset.Numbers]: [
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    ],
    [Keyset.Symbols]: [
        "`", "~", "-", "_", "+",
        "[", "]",
        "{", "}",
        ";", ":",
        "'", "\"",
        ",", ".",
        "<", ">",
        "/", "?",
    ],
    [Keyset.SpecialKeys]: [

    ],
    [Keyset.Alphanumeric]: [
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
        "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
        "u", "v", "w", "x", "y", "z",
    ],
    [Keyset.Printable]: [
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
        "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
        "u", "v", "w", "x", "y", "z",
        "`", "~", "-", "_", "+",
        "[", "]",
        "{", "}",
        ";", ":",
        "'", "\"",
        ",", ".",
        "<", ">",
        "/", "?",
    ],
}

const Milliseconds = {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
}

const TerminatingKey = "Escape";

/**
 *	@param {number} min
 *	@param {number} max
 *	@returns {number}
 */
function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {Clock} clock
 * @returns {Game}
 */
function create(clock) {
    /** @type {Game} */
    let game = {
        mode: GameMode.Lowercase,
        keyset: Keyset.Letters,
        state: GameState.Pending,
        elapsedMillis: 0,
        startTimeMillis: clock.getCurrentMillis(),
        keysShown: 0,
        keysCorrect: 0,
        clock,
        selectedKey: "",
        modifiers: 0
    };
    game.selectedKey = getRandomKey(game.keyset);
    game.keysShown += 1;

    return game;
}

/**
 * @param {Game} game
 */
function tick(game) {
    if (game.state === GameState.Play) {
        game.elapsedMillis = game.clock.getCurrentMillis() - game.startTimeMillis;
    }
}

/**
 * @param {Game} game
 * @param {string} mode
 * @param {string} keyset
 */
function start(game, mode, keyset) {
    game.mode = mode;
    game.keyset = keyset;
    game.state = GameState.Play;
    game.elapsedMillis = 0;
}

/**
 * @param {Game} game
 */
function stop(game) {
    game.state = GameState.Stop;
}

/**
 * @param {Game} game
 * @param {string} mode
 * @param {string} keyset
 */
function restart(game, mode, keyset) {
    game.mode = mode;
    game.keyset = keyset;
    game.elapsedMillis = 0;
    game.startTimeMillis = game.clock.getCurrentMillis();
    game.keysShown = 0;
    game.keysCorrect = 0;
    game.modifiers = 0;

    game.selectedKey = getRandomKey(game.keyset);
    game.keysShown += 1;
}

/**
 * @param {Game} game
 */
function selectKey(game) {
    const MAX_ITERATIONS = 30;
    let iter = 0;
    let newKey;
    do {
        if (iter >= MAX_ITERATIONS) {
            throw new Error(`game.selectKey.iterations_exceeded iter=${iter};key=${game.selectedKey};keyset=${game.keyset};`);
        }
        newKey = getRandomKey(game.keyset);
        iter += 1;
    } while(game.selectedKey === newKey);
    game.selectedKey = newKey;
    game.keysShown += 1;
}

/**
 * @param {Game} game
 * @param {string} key
 * @returns {boolean}
 */
function verifyKey(game, key) {
    return game.selectedKey === key
}

/**
 * @param {Game} game
 */
function registerSuccessfulKeypress(game) {
    game.keysCorrect += 1;
}

/**
 * @param {Game} game
 * @returns {string}
 */
function displayKey(game) {
    return game.selectedKey; // todo: apply modifiers
}

/**
 * @param {Game} game
 * @returns {KeyFinger}
 */
function getKeyFinger(game) {
   let finger = KeyFingerMap[game.selectedKey];
   if (finger == null) {
       throw new Error(`game.getKeyFinger.finger_missing key=${game.selectedKey};`);
   }
   return finger;
}

/**
 *
 * @param {string} keyset
 * @returns {string}
 */
function getRandomKey(keyset) {
    let set = Keys[keyset];

    if (set.length === 0) {
        throw new Error(`game.getRandomKey.keyset_empty keyset=${keyset};`);
    }

    let idx = getRandomInteger(0, set.length - 1);
    return set[idx];
}

export const Game = {
    GameMode,
    Keyset,
    GameState,
    KeyFingers,
    KeyFingerMap,
    Keys,
    Milliseconds,
    TerminatingKey,
    create,
    tick,
    start,
    stop,
    restart,
    selectKey,
    verifyKey,
    registerSuccessfulKeypress,
    displayKey,
    getKeyFinger
}


