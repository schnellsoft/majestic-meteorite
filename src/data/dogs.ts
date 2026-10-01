import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type Dog = {
	name: string;
	age: number;
	race: string;
	health: string;
	details: string;
};

export function dogSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

export function loadDogs(): Dog[] {
	const dogsFile = resolve(process.cwd(), 'public/dogs.json');
	return JSON.parse(readFileSync(dogsFile, 'utf8')) as Dog[];
}

/** Prefer a natural title in the 50–60 character range used for this site. */
export function dogPageTitle(name: string, race: string): string {
	const options = [
		`${name} the ${race}: dog profile, health notes, and story`,
		`${name} the ${race}: health notes, age, and story`,
		`${name}: ${race} dog profile, health notes, and story`,
		`${name}, ${race}: dog profile, health notes, and story`,
		`${name} the ${race} dog: health notes and story`,
		`${name}: ${race} health notes, age, and daily story`,
		`${name}, ${race}: health, age, and story`,
	];
	const inRange = options.find((title) => title.length >= 50 && title.length <= 60);
	return inRange ?? options[0];
}

/** Trim bios to the 130–155 character meta description range. */
export function metaDescription(text: string): string {
	const normalized = text.replace(/\s+/g, ' ').trim();
	if (normalized.length >= 130 && normalized.length <= 155) return normalized;
	if (normalized.length < 130) return normalized;

	const window = normalized.slice(0, 155);
	const sentenceEnd = Math.max(window.lastIndexOf('. '), window.lastIndexOf('; '));
	if (sentenceEnd >= 129) return window.slice(0, sentenceEnd + 1).trim();

	const space = window.lastIndexOf(' ');
	const cut = space >= 130 ? space : 152;
	return `${window.slice(0, cut).trimEnd()}…`;
}
