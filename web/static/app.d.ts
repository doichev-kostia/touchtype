type RenderingContainer = {
	key: HTMLElement,
	keyText: HTMLElement,
	score: HTMLElement,
	time: HTMLElement,
	cpm: HTMLElement,
	fingers: Record<KeyFinger, HTMLElement>
	modifiers: ModifiersContainer
}

type ModifiersContainer = {
	root: HTMLDialogElement
	mixedCase: HTMLInputElement
	fingersContainer: HTMLElement
	fingers: Array<HTMLButtonElement>
}
