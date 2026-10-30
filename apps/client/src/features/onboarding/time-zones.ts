// "America/Argentina/Buenos_Aires" reads as Buenos Aires, America / Argentina
export function timeZoneParts(zone: string): { city: string; region: string } {
	const parts = zone.split('/').map((part) => part.replaceAll('_', ' '));
	const city = parts.pop() ?? zone;
	return { city, region: parts.join(' / ') };
}

// the time it is now in that zone, for example "14:05"
export function timeIn(zone: string, now: Date): string {
	return new Intl.DateTimeFormat('en-GB', {
		timeZone: zone,
		hour: '2-digit',
		minute: '2-digit',
	}).format(now);
}

export function browserTimeZone(): string {
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function allTimeZones(): string[] {
	return Intl.supportedValuesOf('timeZone');
}
