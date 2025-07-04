type Finger = "thumb" | "index" | "middle" | "ring" | "pinky";

type Hand = "left" | "right";

type KeyFinger = `${Hand}-${Finger}`;

type ModifierMixedCase = {
	type: "MixedCase",
}

type ModifierFingerFocus = {
	type: "FingerFocus",
	fingers: number[], // finger idx, starting from the left pinky
}

type Modifier = ModifierMixedCase | ModifierFingerFocus

type SelectedKey = {
	key: string;
	finger: number
}

type Game = {
	mode: string,
	state: string,
	keyset: string,
	keysShown: number,
	keysCorrect: number,
	keysPressed: number,
	startTimeMillis: number,
	elapsedMillis: number,
	clock: Clock,
	selectedKey: SelectedKey,
	modifiers: Array<Modifier>
}
