import { OrbitBackdrop } from './orbit-backdrop';
import { ShootingStar } from './shooting-star';
import { StarField } from './star-field';

type OnboardingSkyProps = {
	// the screen on show, counted from 0; each change moves the sky on
	step: number;
	// share of the questions answered, 0 to 1
	progress: number;
	finished: boolean;
};

// the night sky behind onboarding: a berry glow, drifting stars, a shooting star
// for every change of question, and the orbit the student travels along
export function OnboardingSky({
	step,
	progress,
	finished,
}: OnboardingSkyProps) {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
		>
			<div className="sky-glow absolute inset-0" />
			<StarField travel={step} />
			<OrbitBackdrop progress={progress} finished={finished} />
			{step > 0 && <ShootingStar key={step} seed={step} />}
		</div>
	);
}
