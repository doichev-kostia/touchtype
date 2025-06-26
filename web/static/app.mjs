import * as Game from "./game.mjs";
import { createRealtimeClock, Milliseconds } from "./time.mjs";


function main() {
	let rtClock = createRealtimeClock();
	let game = Game.create(rtClock);

	let keysetSelector = document.querySelector("#keyset");
	if (!isDomElementAvailable(keysetSelector, HTMLSelectElement)) {
		throw new Error("keyset select is not available");
	}
	renderKeysetOptions(keysetSelector, game.keyset, Object.keys(Game.Keyset));

	let renderingContainer = queryRenderingContainer();
	renderingContainer.keyText.focus();
	renderingContainer.keyText.autofocus = true;
	renderGame(game, renderingContainer);
	const tickMillis = 1000;

	let intervalID = setInterval(function tickLoop() {
		Game.tick(game, tickMillis);
		renderGame(game, renderingContainer);
	}, tickMillis);
	keysetSelector.addEventListener("change", (event) => {
		if (!(event.target instanceof HTMLSelectElement)) {
			throw new Error("keysetSelector is not a select element");
		}
		const newKeyset = event.target.value;
		if (!(newKeyset in Game.Keyset)) {
			throw new Error(`Invalid keyset: ${newKeyset}`);
		}
		Game.restart(game, game.mode, newKeyset);
		renderGame(game, renderingContainer);
		renderingContainer.key.classList.remove("error");
		event.target.blur();
		renderingContainer.keyText.focus();
	});

	// Prevent common navigation/browser keys
	const preventKeys = ['Tab', '/', "'", 'F1', 'F3', 'F5', "F7", 'F11', 'F12'];
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
			Game.start(game, game.mode, game.keyset);
		}
		Game.registerKeypress(game);
		if (Game.verifyKey(game, event.key)) {
			Game.registerSuccessfulKeypress(game);
			Game.selectKey(game);
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

	return {
		key,
		keyText,
		fingers,
		score,
		time,
		cpm: charactersPerMinute
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
}

/**
 * @template T
 * @param {Element | null} element
 * @param {new (...args: any[]) => T} target
 * @returns {element is T}
 */
function isDomElementAvailable(element, target) {
	return element instanceof target;
}

/** @returns {Record<KeyFinger, HTMLElement>} */
function getFingerElements()  {
	/** @type {Record<KeyFinger, HTMLElement>} */
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
