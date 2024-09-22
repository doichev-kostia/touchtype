type Finger = "thumb" | "index" | "middle" | "ring" | "pinky";

type Hand = "left" | "right";

type KeyFinger = `${Hand}-${Finger}`;

type Constructor<T> = new (...args: any[]) => T;

declare function isDomElementAvailable<E extends HTMLElement>(element: unknown, target: Constructor<E>): element is E;
