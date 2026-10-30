'use client';

import type { Course } from '@orbi/shared';
import { useRef, useState } from 'react';
import { nearestPage, toPages } from '../course-pages';
import { CourseGridPage } from './course-grid-page';
import { PageControls } from './page-controls';

// six cards fill a page: 3 columns and 2 rows on wide screens
const PAGE_SIZE = 6;

type CourseGridProps = {
	courses: Course[];
	now: Date;
};

// more than one page of courses scrolls sideways and snaps to each page;
// the padding keeps hover shadows and focus rings from being cut off
export function CourseGrid({ courses, now }: CourseGridProps) {
	const scroller = useRef<HTMLDivElement>(null);
	const [page, setPage] = useState(0);
	const pages = toPages(courses, PAGE_SIZE);

	if (pages.length <= 1) return <CourseGridPage courses={courses} now={now} />;

	const pageElements = () =>
		Array.from(scroller.current?.children ?? []) as HTMLElement[];

	const trackPage = () => {
		const starts = pageElements().map((element) => element.offsetLeft);
		setPage(nearestPage(starts, scroller.current?.scrollLeft ?? 0));
	};

	// the scroller's smooth scrolling (or none, with reduced motion) does the animation
	const goTo = (index: number) =>
		pageElements()[index]?.scrollIntoView({
			block: 'nearest',
			inline: 'start',
		});

	return (
		<div className="flex flex-col gap-3">
			<PageControls
				page={Math.min(page, pages.length - 1)}
				count={pages.length}
				onGo={goTo}
			/>
			<div
				ref={scroller}
				onScroll={trackPage}
				role="region"
				aria-label="All courses"
				tabIndex={0}
				className="relative -m-2 flex snap-x snap-mandatory scroll-px-2 gap-3 overflow-x-auto scroll-smooth rounded-2xl p-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:scroll-auto"
			>
				{pages.map((pageCourses, index) => (
					<CourseGridPage
						key={index}
						courses={pageCourses}
						now={now}
						className="w-full shrink-0 snap-start"
					/>
				))}
			</div>
		</div>
	);
}
