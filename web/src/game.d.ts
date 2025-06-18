type Finger = "thumb" | "index" | "middle" | "ring" | "pinky";

type Hand = "left" | "right";

type KeyFinger = `${Hand}-${Finger}`;

interface Clock {
	getCurrentMillis(): number
}

type Game = {
	mode: string,
	state: string,
	keyset: string,
	keysShown: number,
	keysCorrect: number,
	startTimeMillis: number,
	elapsedMillis: number,
	clock: Clock,
	selectedKey: string,
	modifiers: number // bitset?
}
