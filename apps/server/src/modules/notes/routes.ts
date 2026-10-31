import { createNoteInput, note, topicParams } from '@orbi/shared';
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
	};
}
