CREATE INDEX "answer_question_idx" ON "answer" USING btree ("user_id","question_id","answered_at");--> statement-breakpoint
CREATE INDEX "chat_topic_idx" ON "chat" USING btree ("user_id","topic_id");--> statement-breakpoint
CREATE INDEX "chat_message_topic_id_idx" ON "chat_message" USING btree ("topic_id");