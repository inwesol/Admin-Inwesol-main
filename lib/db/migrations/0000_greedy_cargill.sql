-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "career_story_four" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"session_id" integer NOT NULL,
	"rewritten_story" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "career_story_four_user_id_session_id_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "Suggestion" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"documentId" uuid NOT NULL,
	"documentCreatedAt" timestamp NOT NULL,
	"originalText" text NOT NULL,
	"suggestedText" text NOT NULL,
	"description" text,
	"isResolved" boolean DEFAULT false NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(64) NOT NULL,
	"password" varchar(64),
	"name" varchar(64),
	"image" varchar(255),
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "Message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid NOT NULL,
	"role" varchar NOT NULL,
	"content" json NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"userId" uuid NOT NULL,
	"title" text NOT NULL,
	"visibility" varchar DEFAULT 'private' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"entry_date" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_journal_user_date_unique" UNIQUE("user_id","entry_date")
);
--> statement-breakpoint
CREATE TABLE "Message_v2" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid NOT NULL,
	"role" varchar NOT NULL,
	"parts" json NOT NULL,
	"attachments" json NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" varchar(255) NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "chat_feedback_rating_check" CHECK ((rating >= 1) AND (rating <= 5))
);
--> statement-breakpoint
CREATE TABLE "PasswordResetToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(255) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"userId" uuid NOT NULL,
	CONSTRAINT "PasswordResetToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "career_story_five" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"session_id" integer NOT NULL,
	"storyboards" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "career_story_five_user_id_session_id_key" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "career_story_six" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"session_id" integer NOT NULL,
	"selected_storyboard_id" varchar(255),
	"storyboard_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_coaching_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" integer DEFAULT 8 NOT NULL,
	"answers" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_session_post_coaching" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "riasec_test" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"selected_answers" varchar(4000) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"category_counts" json NOT NULL,
	"interest_code" varchar(3) NOT NULL,
	"session_id" integer DEFAULT 2 NOT NULL,
	CONSTRAINT "riasec_test_user_id_session_id_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "psychological_wellbeing_test" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"answers" varchar(4000) NOT NULL,
	"score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"subscale_scores" json DEFAULT '{}'::json NOT NULL,
	"session_id" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "psychological_wellbeing_test_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "psychological_wellbeing_test_user_id_session_id_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "daily_journaling" (
	"user_id" varchar(255) NOT NULL,
	"session_id" integer NOT NULL,
	"date" varchar(10) NOT NULL,
	"took_action" varchar(3) DEFAULT '',
	"what_held_back" text DEFAULT '',
	"challenges" text DEFAULT '[]',
	"progress" text DEFAULT '[]',
	"gratitude" text DEFAULT '[]',
	"gratitude_help" text DEFAULT '[]',
	"tomorrow_step" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "daily_journaling_user_session_date_unique" UNIQUE("user_id","session_id","date")
);
--> statement-breakpoint
CREATE TABLE "career_maturity_assessment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"answers" varchar(4000) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"session_id" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "career_maturity_assessment_user_id_session_id_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "user_session_form_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" integer NOT NULL,
	"form_id" text NOT NULL,
	"status" varchar(32) NOT NULL,
	"score" integer,
	"completed_at" varchar(32),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"insights" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demographics_details_form" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"email" varchar(100),
	"age" integer,
	"education" varchar(100),
	"stress_level" integer,
	"motivation" varchar(500),
	"gender" varchar(30),
	"profession" varchar(50),
	"previous_coaching" varchar(20),
	CONSTRAINT "demographics_details_form_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "pre_assessment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"answers" varchar(4000) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"session_id" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "pre_assessment_user_id_session_id_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "personality_test" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"answers" varchar(4000) NOT NULL,
	"score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"subscale_scores" json DEFAULT '{}'::json NOT NULL,
	"session_id" integer DEFAULT 2 NOT NULL,
	CONSTRAINT "personality_test_user_id_session_id_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "career_story_two" (
	"user_id" varchar(255) NOT NULL,
	"session_id" integer NOT NULL,
	"first_adjectives" text NOT NULL,
	"repeated_words" text NOT NULL,
	"common_traits" text NOT NULL,
	"significant_words" text NOT NULL,
	"self_statement" text NOT NULL,
	"media_activities" text NOT NULL,
	"selected_riasec" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"setting_statement" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pre_coaching_sdq" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" integer DEFAULT 1 NOT NULL,
	"answers" jsonb NOT NULL,
	"score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"subscale_scores" json DEFAULT '{}'::json NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "pre_coaching_sdq_user_id_session_id_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "uploaded_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"image_path" text NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"image_type" varchar(50),
	"is_optimized" boolean DEFAULT false NOT NULL,
	"last_accessed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"session_id" integer NOT NULL,
	CONSTRAINT "uploaded_images_image_url_key" UNIQUE("image_url")
);
--> statement-breakpoint
CREATE TABLE "career_options_matrix" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"session_id" integer NOT NULL,
	"rows" jsonb NOT NULL,
	"columns" jsonb NOT NULL,
	"cells" jsonb NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" integer NOT NULL,
	"overall_feeling" jsonb NOT NULL,
	"key_insight" text NOT NULL,
	"overall_rating" integer NOT NULL,
	"would_recommend" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_user_session_unique" UNIQUE("user_id","session_id"),
	CONSTRAINT "feedback_overall_rating_check" CHECK ((overall_rating >= 1) AND (overall_rating <= 5)),
	CONSTRAINT "feedback_rating_range" CHECK ((overall_rating >= 1) AND (overall_rating <= 5))
);
--> statement-breakpoint
CREATE TABLE "career_story_one" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"session_id" integer NOT NULL,
	"transition_essay" text NOT NULL,
	"occupations" text NOT NULL,
	"heroes" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"media_preferences" text DEFAULT '' NOT NULL,
	"favorite_story" text DEFAULT '' NOT NULL,
	"favorite_saying" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journey_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"current_session" integer NOT NULL,
	"completed_sessions" json NOT NULL,
	"total_score" integer NOT NULL,
	"last_active_date" varchar(32) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"enable_by_coach" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "my_life_collage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"session_id" integer NOT NULL,
	"present_life_collage" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"future_life_collage" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "my_life_collage_user_session_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "career_story_three" (
	"user_id" text NOT NULL,
	"session_id" integer NOT NULL,
	"self_statement" text NOT NULL,
	"setting_statement" text NOT NULL,
	"plot_description" text NOT NULL,
	"plot_activities" text NOT NULL,
	"able_to_be_statement" text NOT NULL,
	"places_where_statement" text NOT NULL,
	"so_that_statement" text NOT NULL,
	"motto_statement" text NOT NULL,
	"selected_occupations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "career_story_three_user_session_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "letter_from_future_self" (
	"user_id" varchar NOT NULL,
	"session_id" integer NOT NULL,
	"letter" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "letter_from_future_self_user_session_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "post_career_maturity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"answers" jsonb NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"session_id" integer DEFAULT 8 NOT NULL,
	CONSTRAINT "post_career_maturity_user_id_session_id_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "mappings" (
	"mapping_id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"person_id" text NOT NULL,
	"coach_email" text NOT NULL,
	"person_data" jsonb,
	"mapped_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text,
	"email" text,
	"role" text,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_psychological_wellbeing_test" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" integer NOT NULL,
	"answers" varchar(4000) NOT NULL,
	"score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"subscale_scores" json DEFAULT '{}'::json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_psychological_wellbeing_test_user_id_session_id_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "coaches" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text,
	"email" text,
	"clients" text,
	"session_links" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "coaches_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" integer NOT NULL,
	"summary" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"coach_feedback" text
);
--> statement-breakpoint
CREATE TABLE "client_summary" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" uuid NOT NULL,
	"session_id" integer NOT NULL,
	"summary" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "client_summary_client_id_session_id_key" UNIQUE("client_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "post_coaching_sdq" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" integer DEFAULT 8 NOT NULL,
	"answers" jsonb NOT NULL,
	"score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"subscale_scores" json DEFAULT '{}'::json NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "post_coaching_sdq_user_id_session_id_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "Vote" (
	"chatId" uuid NOT NULL,
	"messageId" uuid NOT NULL,
	"isUpvoted" boolean NOT NULL,
	CONSTRAINT "Vote_chatId_messageId_pk" PRIMARY KEY("chatId","messageId")
);
--> statement-breakpoint
CREATE TABLE "Vote_v2" (
	"chatId" uuid NOT NULL,
	"messageId" uuid NOT NULL,
	"isUpvoted" boolean NOT NULL,
	CONSTRAINT "Vote_v2_chatId_messageId_pk" PRIMARY KEY("chatId","messageId")
);
--> statement-breakpoint
CREATE TABLE "Document" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"userId" uuid NOT NULL,
	"text" varchar DEFAULT 'text' NOT NULL,
	CONSTRAINT "Document_id_createdAt_pk" PRIMARY KEY("id","createdAt")
);
--> statement-breakpoint
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Message_v2" ADD CONSTRAINT "Message_v2_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploaded_images" ADD CONSTRAINT "uploaded_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_summary" ADD CONSTRAINT "client_summary_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_messageId_Message_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Vote_v2" ADD CONSTRAINT "Vote_v2_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Vote_v2" ADD CONSTRAINT "Vote_v2_messageId_Message_v2_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."Message_v2"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "career_story_six_user_session_idx" ON "career_story_six" USING btree ("user_id" int4_ops,"session_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "career_story_two_user_session_unique" ON "career_story_two" USING btree ("user_id" int4_ops,"session_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_last_accessed" ON "uploaded_images" USING btree ("last_accessed_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_session_id" ON "uploaded_images" USING btree ("session_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_user_id" ON "uploaded_images" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_user_image_type" ON "uploaded_images" USING btree ("user_id" uuid_ops,"image_type" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_feedback_created_at" ON "feedback" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_feedback_session_id" ON "feedback" USING btree ("session_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_feedback_user_id" ON "feedback" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "career_story_one_user_session_idx" ON "career_story_one" USING btree ("user_id" int4_ops,"session_id" int4_ops);--> statement-breakpoint
CREATE INDEX "career_story_three_user_session_idx" ON "career_story_three" USING btree ("user_id" text_ops,"session_id" text_ops);--> statement-breakpoint
CREATE INDEX "letter_from_future_self_user_session_idx" ON "letter_from_future_self" USING btree ("user_id" text_ops,"session_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "report_user_session_unique" ON "report" USING btree ("user_id" int4_ops,"session_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_client_summary_client_session" ON "client_summary" USING btree ("client_id" int4_ops,"session_id" int4_ops);
*/