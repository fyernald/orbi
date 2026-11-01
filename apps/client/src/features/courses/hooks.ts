'use client';

import {
	course,
	topic,
	type Course,
	type CreateCourseInput,
	type CreateTopicInput,
	type Topic,
	type UpdateCourseInput,
	type UpdateTopicInput,
} from '@orbi/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api';
import { courseKey, coursesKey, topicsKey } from './query-keys';

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

// after a topic changes, the course list and the course load again, so their note
// count and last activity come from the server; the topic count moves at once meanwhile
function useTopicsChanged(courseId: string) {
	const queryClient = useQueryClient();
	return (topicChange: number) => {
		const adjusted = (course: Course) =>
			course.id === courseId
				? { ...course, topicCount: course.topicCount + topicChange }
				: course;
		queryClient.setQueryData<Course[]>(coursesKey, (courses) =>
			courses?.map(adjusted)
		);
		queryClient.setQueryData<Course>(
			courseKey(courseId),
			(course) => course && adjusted(course)
		);
		void queryClient.invalidateQueries({ queryKey: coursesKey, exact: true });
		void queryClient.invalidateQueries({
			queryKey: courseKey(courseId),
			exact: true,
		});
	};
}

export function useCreateTopic(courseId: string) {
	const queryClient = useQueryClient();
	const topicsChanged = useTopicsChanged(courseId);
	return useMutation({
		mutationFn: (input: CreateTopicInput) =>
			api.post(`/courses/${courseId}/topics`, topic, input),
		onSuccess: (created) => {
			queryClient.setQueryData<Topic[]>(topicsKey(courseId), (topics) =>
				topics ? [...topics, created] : topics
			);
			topicsChanged(1);
		},
	});
}

// the course list and the open course show the new name at once
export function useRenameCourse(courseId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpdateCourseInput) =>
			api.patch(`/courses/${courseId}`, course, input),
		onSuccess: (renamed) => {
			queryClient.setQueryData<Course[]>(coursesKey, (courses) =>
				courses?.map((item) => (item.id === renamed.id ? renamed : item))
			);
			queryClient.setQueryData(courseKey(renamed.id), renamed);
		},
	});
}

export function useRenameTopic(courseId: string) {
	const queryClient = useQueryClient();
	const topicsChanged = useTopicsChanged(courseId);
	return useMutation({
		mutationFn: ({
			topicId,
			...input
		}: UpdateTopicInput & { topicId: string }) =>
			api.patch(`/courses/${courseId}/topics/${topicId}`, topic, input),
		onSuccess: (renamed) => {
			queryClient.setQueryData<Topic[]>(topicsKey(courseId), (topics) =>
				topics?.map((item) => (item.id === renamed.id ? renamed : item))
			);
			topicsChanged(0);
		},
	});
}

export function useDeleteTopic(courseId: string) {
	const queryClient = useQueryClient();
	const topicsChanged = useTopicsChanged(courseId);
	return useMutation({
		mutationFn: (topicId: string) =>
			api.delete(`/courses/${courseId}/topics/${topicId}`),
		onSuccess: (_, topicId) => {
			queryClient.setQueryData<Topic[]>(topicsKey(courseId), (topics) =>
				topics?.filter((item) => item.id !== topicId)
			);
			topicsChanged(-1);
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
