type Finger = "thumb" | "index" | "middle" | "ring" | "pinky";
type Hand = "left" | "right";

type KeyFinger = `${Hand}-${Finger}`;

const keyFingers: KeyFinger[] = [
	"left-index",
	"left-middle",
	"left-ring",
	"left-pinky",
	"right-index",
	"right-middle",
	"right-ring",
	"right-pinky",
];

const KEY_FINGER_MAP: Record<string, KeyFinger> = {
	"q": "left-pinky",
	"w": "left-ring",
	"e": "left-middle",
	"r": "left-index",
	"t": "left-index",
	"y": "right-index",
	"u": "right-index",
	"i": "right-middle",
	"o": "right-ring",
	"p": "right-pinky",
	"a": "left-pinky",
	"s": "left-ring",
	"d": "left-middle",
	"f": "left-index",
	"g": "left-index",
	"h": "right-index",
	"j": "right-index",
	"k": "right-middle",
	"l": "right-ring",
	"z": "left-pinky",
	"x": "left-ring",
	"c": "left-middle",
	"v": "left-index",
	"b": "left-index",
	"n": "right-index",
	"m": "right-index",
};

const KEYS = Object.keys(KEY_FINGER_MAP);

type Constructor<T> = new (...args: any[]) => T;

function isDomElementAvailable<E extends HTMLElement>(element: unknown, target: Constructor<E>): element is E {
	return element instanceof target;
}

function getRandomInteger(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomKey(): string {
	const index = getRandomInteger(0, KEYS.length - 1);
	return KEYS[index];
}

function getFingerElements(): Record<KeyFinger, HTMLElement> {
	const fingerElements: Record<KeyFinger, HTMLElement> = {} as Record<KeyFinger, HTMLElement>;
	keyFingers.forEach((finger) => {
		const fingerElement = document.querySelector(`#${finger}`);
		if (!isDomElementAvailable(fingerElement, HTMLElement)) {
			throw new Error(`${finger} is not available`);
		}
		fingerElements[finger] = fingerElement;
	});

	return fingerElements;
}

const keyContainer = document.querySelector("#key");
if (!isDomElementAvailable(keyContainer, HTMLDivElement)) {
	throw new Error("keyContainer is not available");
}

const keyText = document.querySelector("#key-text");
if (!isDomElementAvailable(keyText, HTMLParagraphElement)) {
	throw new Error("keyText is not available");
}

const fingerElements = getFingerElements();


let chosenKey = getRandomKey();
let chosenFinger = KEY_FINGER_MAP[chosenKey];
keyText.textContent = chosenKey;
fingerElements[chosenFinger].classList.add("!bg-red-500");


document.addEventListener("keyup", (event) => {
	if (event.key === chosenKey) {
		fingerElements[chosenFinger].classList.remove("!bg-red-500");
		const newKey = getRandomKey();
		const newFinger = KEY_FINGER_MAP[newKey];
		keyText.textContent = newKey;
		fingerElements[newFinger].classList.add("!bg-red-500");
		chosenKey = newKey;
		chosenFinger = newFinger;
	} else {
		keyContainer.classList.add("error");
		setTimeout(() => {
			keyContainer.classList.remove("error");
		}, 500);
	}
});
