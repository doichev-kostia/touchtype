const KEYS = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"];

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

const keyContainer = document.querySelector("#key");
if (!isDomElementAvailable(keyContainer, HTMLDivElement)) {
	throw new Error("keyContainer is not available");
}

const keyText = document.querySelector("#key-text")
if (!isDomElementAvailable(keyText, HTMLParagraphElement)) {
	throw new Error("keyText is not available");
}


let chosenKey = getRandomKey();
keyText.textContent = chosenKey;

document.addEventListener("keyup", (event) => {
	if (event.key === chosenKey) {
		const newKey = getRandomKey();
		keyText.textContent = newKey;
		chosenKey = newKey;
	} else {
		keyContainer.classList.add("error");
		setTimeout(() => {
			keyContainer.classList.remove("error");
		}, 500)
	}
});
