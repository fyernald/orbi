'use client';

import {
	course,
	topic,
	type Course,
	type CreateCourseInput,
	type CreateTopicInput,
	type Topic,
} from '@orbi/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api';

const coursesKey = ['courses'] as const;
const courseKey = (courseId: string) => [...coursesKey, courseId] as const;
const topicsKey = (courseId: string) =>
	[...courseKey(courseId), 'topics'] as const;

export function useCourses() {
	return useQuery({
		queryKey: coursesKey,
		queryFn: () => api.get('/courses', z.array(course)),
	});
}

// starts from the course list when it is loaded, so a course opens at once from the sidebar
export function useCourse(courseId: string) {
	const queryClient = useQueryClient();
	return useQuery({
		queryKey: courseKey(courseId),
		queryFn: () => api.get(`/courses/${courseId}`, course),
		initialData: () =>
			queryClient
				.getQueryData<Course[]>(coursesKey)
				?.find((item) => item.id === courseId),
		initialDataUpdatedAt: () =>
			queryClient.getQueryState(coursesKey)?.dataUpdatedAt,
	});
}

export function useCreateCourse() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateCourseInput) =>
			api.post('/courses', course, input),
		// new courses come last, the same order the server lists them in
		onSuccess: (created) => {
			queryClient.setQueryData<Course[]>(coursesKey, (courses) =>
				courses ? [...courses, created] : courses
			);
			queryClient.setQueryData(courseKey(created.id), created);
		},
	});
}

export function useTopics(courseId: string) {
	return useQuery({
		queryKey: topicsKey(courseId),
		queryFn: () => api.get(`/courses/${courseId}/topics`, z.array(topic)),
	});
}

// keeps the topic count on the course list and the course page in step
function useAdjustTopicCount() {
	const queryClient = useQueryClient();
	return (courseId: string, change: number) => {
		const adjusted = (course: Course) =>
			course.id === courseId
				? { ...course, topicCount: course.topicCount + change }
				: course;
		queryClient.setQueryData<Course[]>(coursesKey, (courses) =>
			courses?.map(adjusted)
		);
		queryClient.setQueryData<Course>(
			courseKey(courseId),
			(course) => course && adjusted(course)
		);
	};
}

export function useCreateTopic(courseId: string) {
	const queryClient = useQueryClient();
	const adjustTopicCount = useAdjustTopicCount();
	return useMutation({
		mutationFn: (input: CreateTopicInput) =>
			api.post(`/courses/${courseId}/topics`, topic, input),
		onSuccess: (created) => {
			queryClient.setQueryData<Topic[]>(topicsKey(courseId), (topics) =>
				topics ? [...topics, created] : topics
			);
			adjustTopicCount(courseId, 1);
		},
	});
}

export function useDeleteTopic(courseId: string) {
	const queryClient = useQueryClient();
	const adjustTopicCount = useAdjustTopicCount();
	return useMutation({
		mutationFn: (topicId: string) =>
			api.delete(`/courses/${courseId}/topics/${topicId}`),
		onSuccess: (_, topicId) => {
			queryClient.setQueryData<Topic[]>(topicsKey(courseId), (topics) =>
				topics?.filter((item) => item.id !== topicId)
			);
			adjustTopicCount(courseId, -1);
		},
	});
}

// the page that shows the course moves away itself; removing its data here
// would make it load the deleted course again first
export function useDeleteCourse() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (courseId: string) => api.delete(`/courses/${courseId}`),
		onSuccess: (_, courseId) => {
			queryClient.setQueryData<Course[]>(coursesKey, (courses) =>
				courses?.filter((item) => item.id !== courseId)
			);
		},
	});
}
