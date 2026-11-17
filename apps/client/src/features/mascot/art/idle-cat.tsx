import { useId, type SVGProps } from 'react';

// Stand-in art until the paid drawings arrive: a tabby with round glasses (as in
// the T-03 wireframes) on a patch of night sky. The real art replaces this file.
export function IdleCat(props: SVGProps<SVGSVGElement>) {
	const clip = useId();

	return (
		<svg viewBox="0 0 40 40" aria-hidden="true" {...props}>
			<clipPath id={clip}>
				<circle cx="20" cy="20" r="20" />
			</clipPath>
			<g clipPath={`url(#${clip})`}>
				<circle cx="20" cy="20" r="20" className="fill-mascot-sky" />
				<g className="fill-mascot-star">
					<circle cx="7.5" cy="9" r="0.8" />
					<circle cx="32.5" cy="7" r="0.6" />
					<circle cx="35" cy="15" r="0.5" />
				</g>
				{/* shoulders */}
				<path
					d="M6 42 Q20 30 34 42 Z"
					className="fill-mascot-fur stroke-mascot-line"
					strokeWidth="1.1"
				/>
				{/* ears */}
				<g
					className="fill-mascot-fur stroke-mascot-line"
					strokeWidth="1.1"
					strokeLinejoin="round"
				>
					<path d="M8.5 18 L10.5 6 L18 12 Z" />
					<path d="M31.5 18 L29.5 6 L22 12 Z" />
				</g>
				<g className="fill-mascot-blush">
					<path d="M11.4 13.5 L12 8.8 L15.4 11.6 Z" />
					<path d="M28.6 13.5 L28 8.8 L24.6 11.6 Z" />
				</g>
				{/* head */}
				<ellipse
					cx="20"
					cy="22.5"
					rx="13"
					ry="11"
					className="fill-mascot-fur stroke-mascot-line"
					strokeWidth="1.1"
				/>
				{/* tabby stripes */}
				<g
					className="stroke-mascot-stripe"
					strokeWidth="1.4"
					strokeLinecap="round"
					fill="none"
				>
					<path d="M20 12.6 V15.8" />
					<path d="M16.8 13.2 L17.5 15.8" />
					<path d="M23.2 13.2 L22.5 15.8" />
				</g>
				{/* glasses and eyes */}
				<g className="stroke-mascot-line" strokeWidth="1.1" fill="none">
					<circle cx="15" cy="21.8" r="3.6" className="fill-white/35" />
					<circle cx="25" cy="21.8" r="3.6" className="fill-white/35" />
					<path d="M18.6 21.6 Q20 20.6 21.4 21.6" />
				</g>
				<g className="fill-mascot-line">
					<circle cx="15" cy="22" r="1.3" />
					<circle cx="25" cy="22" r="1.3" />
				</g>
				<g className="fill-white">
					<circle cx="15.5" cy="21.5" r="0.4" />
					<circle cx="25.5" cy="21.5" r="0.4" />
				</g>
				{/* cheeks, nose, mouth and whiskers */}
				<g className="fill-mascot-blush" opacity="0.7">
					<ellipse cx="11.8" cy="27" rx="1.4" ry="0.8" />
					<ellipse cx="28.2" cy="27" rx="1.4" ry="0.8" />
				</g>
				<path d="M19 26 H21 L20 27.2 Z" className="fill-mascot-blush" />
				<g
					className="stroke-mascot-line"
					strokeWidth="0.8"
					strokeLinecap="round"
					fill="none"
				>
					<path d="M20 27.2 Q19 28.6 17.8 28" />
					<path d="M20 27.2 Q21 28.6 22.2 28" />
					<path d="M6.5 25.5 L11 26.2" />
					<path d="M6.5 28.3 L11 27.6" />
					<path d="M33.5 25.5 L29 26.2" />
					<path d="M33.5 28.3 L29 27.6" />
				</g>
			</g>
		</svg>
	);
}
