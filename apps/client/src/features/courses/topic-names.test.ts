import { describe, expect, it } from 'vitest';
import { hasTopicNamed, sameTopicName } from './topic-names';

describe('sameTopicName', () => {
	it('counts names that only differ in case as the same', () => {
		expect(sameTopicName('Mitosis', 'mitosis')).toBe(true);
		expect(sameTopicName('DNA REPLICATION', 'DNA replication')).toBe(true);
	});

	it('keeps names with other letters or accents apart', () => {
		expect(sameTopicName('Mitosis', 'Meiosis')).toBe(false);
		expect(sameTopicName('Resume', 'Résumé')).toBe(false);
	});
});

describe('hasTopicNamed', () => {
	it('finds a name the list already has', () => {
		expect(hasTopicNamed(['Cell biology', 'Mitosis'], 'MITOSIS')).toBe(true);
		expect(hasTopicNamed(['Cell biology'], 'Mitosis')).toBe(false);
		expect(hasTopicNamed([], 'Mitosis')).toBe(false);
	});
});
