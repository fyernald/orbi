'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
import { useCourses } from '@/features/courses/hooks';
import { cn } from '@/lib/utils';
import { breadcrumbFor } from '../page-titles';

export function PageTitle({ className }: { className?: string }) {
	const courses = useCourses();
	const crumbs = breadcrumbFor(
		usePathname(),
		(courseId) => courses.data?.find(({ id }) => id === courseId)?.name
	);
	if (crumbs.length === 0) return null;

	return (
		<nav
			aria-label="Breadcrumb"
			className={cn('min-w-0 items-center gap-1.5', className)}
		>
			{crumbs.map((crumb, index) => (
				<Fragment key={index}>
					{index > 0 && (
						<ChevronRight
							aria-hidden="true"
							className="size-3.5 shrink-0 text-muted-foreground"
						/>
					)}
					{crumb.href ? (
						<Link
							href={crumb.href}
							className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
						>
							{crumb.label}
						</Link>
					) : (
						<span aria-current="page" className="truncate">
							{crumb.label}
						</span>
					)}
				</Fragment>
			))}
		</nav>
	);
}
