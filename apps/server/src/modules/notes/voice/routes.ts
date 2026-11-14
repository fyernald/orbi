import {
	note,
	topicParams,
	VOICE_NOTE_MAX_SIZE,
	VOICE_NOTE_MEDIA_TYPES,
	voiceNoteQuery,
	type VoiceNoteMediaType,
} from '@orbi/shared';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { routeLimit, type RateLimits } from '../../../rate-limit';
import type { RequireUser } from '../../auth/session';
import type { WriteVoiceNote } from './writer';

type VoiceNoteRoutesDeps = {
	writeVoiceNote: WriteVoiceNote;
	requireUser: RequireUser;
	limits: RateLimits;
};

// "audio/webm;codecs=opus" is audio/webm; the parsers below only let the listed types in
const mediaTypeOf = (contentType: string | undefined) =>
	(contentType ?? '').split(';')[0]!.trim().toLowerCase() as VoiceNoteMediaType;

export function createVoiceNoteRoutes({
	writeVoiceNote,
	requireUser,
	limits,
}: VoiceNoteRoutesDeps): FastifyPluginAsyncZod {
	return async (api) => {
		// the recording itself is the body, kept as bytes and never written to disk;
		// a longer one than five minutes at the browser's bit rate is refused unread
		for (const type of VOICE_NOTE_MEDIA_TYPES) {
			api.addContentTypeParser(
				type,
				{ parseAs: 'buffer', bodyLimit: VOICE_NOTE_MAX_SIZE },
				(_request, body, done) => done(null, body)
			);
		}

		api.post(
			'/courses/:courseId/topics/:topicId/notes/voice',
			{
				schema: {
					params: topicParams,
					querystring: voiceNoteQuery,
					body: z.instanceof(Uint8Array, { error: 'Attach a recording.' }),
					response: { 201: note },
				},
				config: routeLimit(limits.voiceNote),
				// checked before the body is read, so a request without a login cannot
				// make the server hold a recording in memory
				onRequest: async (request) => {
					await requireUser(request);
				},
			},
			async (request, reply) => {
				const userId = await requireUser(request);
				const { courseId, topicId } = request.params;
				const { modelId, tidy } = request.query;
				// Cancel in the browser ends the request: the model stops too
				const controller = new AbortController();
				reply.raw.on('close', () => {
					if (!reply.raw.writableFinished) controller.abort();
				});
				const created = await writeVoiceNote(
					userId,
					courseId,
					topicId,
					{
						modelId,
						tidy,
						mediaType: mediaTypeOf(request.headers['content-type']),
						audio: request.body,
					},
					controller.signal
				);
				return reply.status(201).send(created);
			}
		);
	};
}
