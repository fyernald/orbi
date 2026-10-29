import { cn } from '@/lib/utils';

const radius = 8;
const circumference = 2 * Math.PI * radius;

// progress is 0 to 1
export function ProgressRing({
	progress,
	className,
}: {
	progress: number;
	className?: string;
}) {
	return (
		<svg
			viewBox="0 0 20 20"
			aria-hidden="true"
			className={cn('size-5 -rotate-90', className)}
		>
			<circle
				cx="10"
				cy="10"
				r={radius}
				fill="none"
				strokeWidth="2.5"
				className="stroke-current opacity-20"
			/>
			<circle
				cx="10"
				cy="10"
				r={radius}
				fill="none"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeDasharray={circumference}
				strokeDashoffset={circumference * (1 - progress)}
				className="stroke-current transition-[stroke-dashoffset] duration-100 ease-linear motion-reduce:transition-none"
			/>
		</svg>
	);
}
