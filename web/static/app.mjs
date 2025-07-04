import * as Game from "./game.mjs";
import { createRealtimeClock, Milliseconds } from "./time.mjs";
import { isDomElementAvailable } from "./dom.mjs";


function main() {
    let rtClock = createRealtimeClock();
    let game = Game.create(rtClock);
    let logger = console;

    let err;
    err = Game.load(game, localStorage);
    if (err != null) {
        logger.error(err, "app.load_game_err");
    }

    let keysetSelector = document.querySelector("#keyset");
    if (!isDomElementAvailable(keysetSelector, HTMLSelectElement)) {
        throw new Error("keyset select is not available");
    }
    renderKeysetOptions(keysetSelector, game.keyset, Object.keys(Game.Keyset));

    let renderingContainer = queryRenderingContainer();
    renderingContainer.keyText.focus();
    renderingContainer.keyText.autofocus = true;
    renderingContainer.modifiers.mixedCase.addEventListener("change", (ev) => {
        let input = ev.currentTarget
        if (!(input instanceof HTMLInputElement)) {
            throw new Error("mixedCaseCheckbox is not an input element");
        }

        // not the cleanest solution
        if (input.checked) {
            Game.upsertModifier(game, { type: "MixedCase" })
        } else {
            Game.removeModifier(game, "MixedCase");
        }
        let err = Game.restart(game, game.mode, game.keyset, game.modifiers);
        if (err != null) {
            logger.error(err, `app.modifiers.mixed_case.restart_err`);
            displayError(err);
            return;
        }
        renderGame(game, renderingContainer);
        input.blur();
        renderingContainer.keyText.focus();
    })

    renderingContainer.modifiers.fingersContainer.addEventListener("click", (ev) => {
        let btn = ev.target;
        if (!(btn instanceof HTMLButtonElement)) {
            logger.warn(`app.modifiers.fingers_container.click_not_button`);
            return; // Ignore clicks on non-button elements
        }

        let fingerAttr = btn.dataset["finger"]
        if (!fingerAttr) {
            logger.warn(`app.modifiers.fingers_container.click_no_finger_data`);
            return; // Ignore buttons without data-finger attribute
        }
        let finger = parseInt(fingerAttr, 10);

        let existingIdx = -1;
        for (let i = 0; i < game.modifiers.length; i += 1) {
            if (game.modifiers[i].type === "FingerFocus") {
                existingIdx = i;
                break;
            }
        }
        if (existingIdx === -1) {
            Game.upsertModifier(game, { type: "FingerFocus", fingers: [finger] });
            setFingerButtonActive(btn);
            return
        }
        /** @type {ModifierFingerFocus} */
        let modifier = game.modifiers[existingIdx];
        let fingers =[...modifier.fingers]
        if (fingers.includes(finger)) {
            fingers = fingers.filter(f => f !== finger);
            setFingerButtonInactive(btn);
        } else {
            if (fingers.length >= Game.KeyFingers.length) {
                logger.warn(`app.modifiers.fingers_container.click_max_fingers_reached`);
                return; // Ignore if max fingers reached
            }
            fingers.push(finger);
            setFingerButtonActive(btn);
        }
        if (fingers.length === 0) {
            Game.removeModifier(game, "FingerFocus");
        } else {
            Game.upsertModifier(game, { type: "FingerFocus", fingers });
        }

        let err = Game.restart(game, game.mode, game.keyset, game.modifiers);
        if (err != null) {
            logger.error(err, `app.modifiers.fingers_container.click_restart_err`);
            displayError(err);
            return;
        }
        renderGame(game, renderingContainer);
        renderingContainer.keyText.focus();
    })

    renderGame(game, renderingContainer);
    const tickMillis = 1000;

    function tickLoop() {
        Game.tick(game, tickMillis);
        renderGame(game, renderingContainer);
    }

    let intervalID = setInterval(tickLoop, tickMillis);
    window.addEventListener("beforeunload", () => {
        Game.save(game, localStorage);
        clearInterval(intervalID);
    });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            clearInterval(intervalID);
        } else {
            intervalID = setInterval(tickLoop, tickMillis);
        }
    });

    keysetSelector.addEventListener("change", (event) => {
        if (!(event.target instanceof HTMLSelectElement)) {
            throw new Error("keysetSelector is not a select element");
        }
        const newKeyset = event.target.value;
        if (!(newKeyset in Game.Keyset)) {
            throw new Error(`Invalid keyset: ${newKeyset}`);
        }
        let err = Game.restart(game, game.mode, newKeyset, game.modifiers);
        if (err != null) {
            logger.error(err, `app.keyset_change.restart_err keyset=${newKeyset}`);
            displayError(err);
            return;
        }
        renderGame(game, renderingContainer);
        renderingContainer.key.classList.remove("error");
        event.target.blur();
        renderingContainer.keyText.focus();
    });

    // Prevent common navigation/browser keys
    const preventKeys = ["Tab", "/", "'", "F1", "F3", "F5", "F7", "F11", "F12"];
    document.addEventListener("keydown", (event) => {
        if (game.keyset !== Game.Keyset.SpecialKeys) {
            if (event.key === "Meta" || event.key === "Control" || event.key === "Alt" || event.key === "Shift") {
                return;
            }
        }
        if (preventKeys.includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (event.key === Game.TerminatingKey) {
            Game.stop(game);
            renderGame(game, renderingContainer);
            return;
        }
        if (game.state !== Game.GameState.Play) {
            Game.play(game);
        }
        Game.registerKeypress(game);
        if (Game.verifyKey(game, event.key)) {
            Game.registerSuccessfulKeypress(game);
            let err = Game.selectKey(game);
            if (err != null) {
                logger.error(err, `app.keydown.select_key_err key=${event.key}`);
                displayError(err);
                return;
            }
        } else {
            renderingContainer.key.classList.add("error");
            setTimeout(() => {
                renderingContainer.key.classList.remove("error");
            }, 500);
        }
        renderGame(game, renderingContainer);
    });

}

main();

/**
 * @returns {RenderingContainer}
 */
function queryRenderingContainer() {
    let key = document.querySelector("#key");
    if (!isDomElementAvailable(key, HTMLDivElement)) {
        throw new Error("keyContainer is not available");
    }

    let keyText = document.querySelector("#key-text");
    if (!isDomElementAvailable(keyText, HTMLParagraphElement)) {
        throw new Error("keyText is not available");
    }

    let fingers = getFingerElements();

    let score = document.querySelector("#score");
    if (!isDomElementAvailable(score, HTMLParagraphElement)) {
        throw new Error("score is not available");
    }

    let time = document.querySelector("#time");
    if (!isDomElementAvailable(time, HTMLTimeElement)) {
        throw new Error("time is not available");
    }

    let charactersPerMinute = document.querySelector("#cpm");
    if (!isDomElementAvailable(charactersPerMinute, HTMLElement)) {
        throw new Error("charactersPerMinute is not available");
    }

    let modifiersBtn = document.getElementById("modifiers-btn");
    if (!isDomElementAvailable(modifiersBtn, HTMLButtonElement)) {
        throw new Error("dialog btn is not available");
    }

    let modifiersDialog = document.getElementById("modifiers-dialog");
    if (!isDomElementAvailable(modifiersDialog, HTMLDialogElement)) {
        throw new Error("dialog is not available");
    }

    let closeDialog = document.getElementById("close-dialog");
    if (!isDomElementAvailable(closeDialog, HTMLButtonElement)) {
        throw new Error("close dialog btn is not available");
    }

    let mixedCaseCheckbox = document.getElementById("mixed-case")
    if (!isDomElementAvailable(mixedCaseCheckbox, HTMLInputElement)) {
        throw new Error("mixed case checkbox is not available");
    }

    modifiersBtn.addEventListener("click", () => {
        modifiersDialog.showModal();
    });

    closeDialog.addEventListener("click", () => {
        modifiersDialog.close();
    });

    modifiersDialog.addEventListener("click", (e) => {
        if (e.target === modifiersDialog) {
            modifiersDialog.close();
        }
    });

    let modifiersFingersContainer = modifiersDialog.querySelector("#fingers-container")
    if (!isDomElementAvailable(modifiersFingersContainer, HTMLDivElement)) {
        throw new Error("modifiers fingers container is not available");
    }

    /** @type {Array<HTMLButtonElement>} */
    let modifiersFingers = new Array(Game.KeyFingers.length)
    for (let i = 0; i < Game.KeyFingers.length; i += 1) {
        let btn = modifiersDialog.querySelector(`[data-finger="${i}"]`)
        if (!isDomElementAvailable(btn, HTMLButtonElement)) {
            throw new Error(`Modifier button for finger ${i} is not available`);
        }
        modifiersFingers[i] = btn;
    }


    return {
        key,
        keyText,
        fingers,
        score,
        time,
        cpm: charactersPerMinute,
        modifiers: {
            root: modifiersDialog,
            mixedCase: mixedCaseCheckbox,
            fingersContainer: modifiersFingersContainer,
            fingers: modifiersFingers,
        }
    };
}

/**
 * @param {Game} game
 * @param {RenderingContainer} container
 */
function renderGame(game, container) {
    container.score.textContent = `correct/pressed ${game.keysCorrect}/${game.keysPressed}`;

    let minutes = Math.floor(game.elapsedMillis / Milliseconds.minute);
    let seconds = Math.floor((game.elapsedMillis % Milliseconds.minute) / Milliseconds.second);
    let minutesFmt = minutes.toString().padStart(2, "0");
    let secondsFmt = seconds.toString().padStart(2, "0");
    container.time.textContent = `${minutesFmt}:${secondsFmt}`;

    const cpm = game.elapsedMillis === 0 ? 0 : Math.floor((game.keysCorrect / game.elapsedMillis) * Milliseconds.minute);
    container.cpm.textContent = cpm.toString();

    container.keyText.textContent = Game.displayKey(game);
    let finger = Game.getKeyFinger(game);
    for (const [k, el] of Object.entries(container.fingers)) {
        if (k === finger) {
            el.classList.add("!bg-red-500");
        } else {
            el.classList.remove("!bg-red-500");
        }
    }

    for (const f of container.modifiers.fingers) {
        setFingerButtonInactive(f);
    }

    for (const m of game.modifiers) {
        if (m.type === "MixedCase") {
            container.modifiers.mixedCase.checked = true
        } else if (m.type === "FingerFocus") {
            for (const f of m.fingers) {
                if (f < 0 || f >= Game.KeyFingers.length) {
                    throw new Error(`Invalid finger index: ${f}`);
                }
                setFingerButtonActive(container.modifiers.fingers[f]);
            }
        }
    }


}


/** @returns {Record<KeyFinger, HTMLElement>} */
function getFingerElements() {
    /** @type {Record<string, HTMLElement>} */
    let fingerElements = {};
    Game.KeyFingers.forEach((finger) => {
        const fingerElement = document.querySelector(`#${finger}`);
        if (!isDomElementAvailable(fingerElement, HTMLElement)) {
            throw new Error(`${finger} is not available`);
        }
        fingerElements[finger] = fingerElement;
    });

    return fingerElements;
}

/**
 * @param {HTMLSelectElement} selectElement
 * @param {string} selectedKeyset
 * @param {Array<string>} keysets
 */
function renderKeysetOptions(selectElement, selectedKeyset, keysets) {
    for (let keyset of keysets) {
        let option = document.createElement("option");
        option.value = keyset;
        if (selectedKeyset === keyset) {
            option.selected = true;
        }
        option.textContent = keyset;
        selectElement.appendChild(option);
    }
}

/**
 *
 * @param {Error} err
 */
function displayError(err) {
    if (err instanceof Game.ErrKeysetEmpty) {
        alert("The chosen keyset has no keys in it");
    } else if (err instanceof Game.ErrNoKeysMatchingFilter) {
        alert("There are no keys that match your filter in the chosen keyset");
    } else {
        alert(`An error occurred: ${err.message}`);
    }
}

/**
 *
 * @param {HTMLElement} btn
 */
function setFingerButtonActive(btn) {
    btn.classList.remove('bg-stone-700', 'border-stone-500', 'text-stone-300');
    btn.classList.add('bg-amber-500', 'border-amber-600', 'text-white');
}
/**
 *
 * @param {HTMLElement} btn
 */
function setFingerButtonInactive(btn) {
    btn.classList.remove('bg-amber-500', 'border-amber-600', 'text-white');
    btn.classList.add('bg-stone-700', 'border-stone-500', 'text-stone-300');
}
