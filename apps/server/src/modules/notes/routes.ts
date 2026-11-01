import {
	createNoteInput,
	note,
	noteParams,
	topicParams,
	updateNoteInput,
} from '@orbi/shared';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { RequireUser } from '../auth/session';
import type { NoteService } from './service';

type NoteRoutesDeps = {
	notes: NoteService;
	requireUser: RequireUser;
};

export function createNoteRoutes({
	notes,
	requireUser,
}: NoteRoutesDeps): FastifyPluginAsyncZod {
	return async (api) => {
		api.get(
			'/courses/:courseId/topics/:topicId/notes',
			{ schema: { params: topicParams, response: { 200: z.array(note) } } },
			async (request) => {
				const userId = await requireUser(request);
				const { courseId, topicId } = request.params;
				return notes.listNotes(userId, courseId, topicId);
			}
		);

		api.post(
			'/courses/:courseId/topics/:topicId/notes',
			{
				schema: {
					params: topicParams,
					body: createNoteInput,
					response: { 201: note },
				},
			},
			async (request, reply) => {
				const userId = await requireUser(request);
				const { courseId, topicId } = request.params;
				const created = await notes.createNote(
					userId,
					courseId,
					topicId,
					request.body
				);
				return reply.status(201).send(created);
			}
		);

		api.patch(
			'/courses/:courseId/topics/:topicId/notes/:noteId',
			{
				schema: {
					params: noteParams,
					body: updateNoteInput,
					response: { 200: note },
				},
			},
			async (request) => {
				const userId = await requireUser(request);
				const { courseId, topicId, noteId } = request.params;
				return notes.updateNote(
					userId,
					courseId,
					topicId,
					noteId,
					request.body
				);
			}
		);

		api.delete(
			'/courses/:courseId/topics/:topicId/notes/:noteId',
			{ schema: { params: noteParams } },
			async (request, reply) => {
				const userId = await requireUser(request);
				const { courseId, topicId, noteId } = request.params;
				await notes.deleteNote(userId, courseId, topicId, noteId);
				return reply.status(204).send();
			}
		);
	};
}
