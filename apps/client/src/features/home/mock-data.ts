// mock data until the API is ready

import type { Topic } from '@/features/tutor/mock-data';

// the due count comes with the study sessions (US-06); the questions to approve are real
export type TodaySummary = {
	dueCount: number;
};

const biology = (id: string, name: string): Topic => ({
	id: `bio-${id}`,
	course: 'Biology 101',
	name,
});

// the first one is the topic the student studied last
export const recentTopics: Topic[] = [
	biology('meiosis', 'Meiosis & crossing over'),
	{ id: 'calc-series', course: 'Calculus II', name: 'Taylor series' },
	biology('mitosis', 'Mitosis & the cell cycle'),
	{
		id: 'eco-inflation',
		course: 'Macroeconomics',
		name: 'Inflation & the CPI',
	},
	biology('membrane', 'Cell membrane transport'),
	biology('dna', 'DNA replication'),
	biology('protein', 'Transcription & translation'),
	biology('mendel', 'Mendelian genetics'),
	biology('photosynthesis', 'Photosynthesis'),
	biology('respiration', 'Cellular respiration'),
	biology('enzymes', 'Enzymes & reaction rates'),
	biology('selection', 'Natural selection'),
];

export const today: TodaySummary = { dueCount: 24 };
