/// <reference types="@sveltejs/kit" />
/// <reference types="@types/vite" />

declare namespace App {
	// interface Locals {}
	// interface Platform {}
	// interface Session {}
	// interface Stuff {}
}

declare interface IQRiousOptions {
	background?: string;
	backgroundAlpha?: number;
	element: HTMLElement;
	foreground?: string;
	foregroundAlpha?: number;
	level?: 'L' | 'M' | 'Q' | 'H';
	mime?: string;
	padding?: number;
	size?: number;
	value?: string;
}

declare class QRious {
	background: string;
	backgroundAlpha: number;
	foreground: string;
	foregroundAlpha: number;
	level: 'L' | 'M' | 'Q' | 'H';
	mime: string;
	padding: number;
	size: number;
	value: string;

	constructor(options: IQRiousOptions);
}

declare interface Window {
	io: typeof io;
	SimplePeer: SimplePeer.SimplePeer;
	QRious: typeof QRious;
}
