import { pgTable, unique, uuid, text, integer, timestamp, foreignKey, boolean, varchar, json, check, serial, jsonb, uniqueIndex, numeric, index, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const careerStoryFour = pgTable("career_story_four", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	sessionId: integer("session_id").notNull(),
	rewrittenStory: text("rewritten_story").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("career_story_four_user_id_session_id_unique").on(table.userId, table.sessionId),
]);

export const suggestion = pgTable("Suggestion", {
	id: uuid().defaultRandom().notNull(),
	documentId: uuid().notNull(),
	documentCreatedAt: timestamp({ mode: 'string' }).notNull(),
	originalText: text().notNull(),
	suggestedText: text().notNull(),
	description: text(),
	isResolved: boolean().default(false).notNull(),
	userId: uuid().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Suggestion_userId_User_id_fk"
		}),
]);

export const user = pgTable("User", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 64 }).notNull(),
	password: varchar({ length: 64 }),
	name: varchar({ length: 64 }),
	image: varchar({ length: 255 }),
	emailVerified: boolean("email_verified").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("User_email_unique").on(table.email),
]);

export const message = pgTable("Message", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chatId: uuid().notNull(),
	role: varchar().notNull(),
	content: json().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Message_chatId_Chat_id_fk"
		}),
]);

export const chat = pgTable("Chat", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	userId: uuid().notNull(),
	title: text().notNull(),
	visibility: varchar().default('private').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Chat_userId_User_id_fk"
		}),
]);

export const dailyJournalEntries = pgTable("daily_journal_entries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	title: text(),
	content: text().notNull(),
	wordCount: integer("word_count").default(0).notNull(),
	entryDate: varchar("entry_date", { length: 10 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("daily_journal_user_date_unique").on(table.userId, table.entryDate),
]);

export const messageV2 = pgTable("Message_v2", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chatId: uuid().notNull(),
	role: varchar().notNull(),
	parts: json().notNull(),
	attachments: json().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Message_v2_chatId_Chat_id_fk"
		}),
]);

export const chatFeedback = pgTable("chat_feedback", {
	id: serial().primaryKey().notNull(),
	chatId: varchar("chat_id", { length: 255 }).notNull(),
	userEmail: varchar("user_email", { length: 255 }).notNull(),
	rating: integer().notNull(),
	comment: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	check("chat_feedback_rating_check", sql`(rating >= 1) AND (rating <= 5)`),
]);

export const passwordResetToken = pgTable("PasswordResetToken", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	token: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	userId: uuid().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "PasswordResetToken_userId_User_id_fk"
		}),
	unique("PasswordResetToken_token_unique").on(table.token),
]);

export const careerStoryFive = pgTable("career_story_five", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }).notNull(),
	sessionId: integer("session_id").notNull(),
	storyboards: jsonb().default([]).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("career_story_five_user_id_session_id_key").on(table.userId, table.sessionId),
]);

export const careerStorySix = pgTable("career_story_six", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }).notNull(),
	sessionId: integer("session_id").notNull(),
	selectedStoryboardId: varchar("selected_storyboard_id", { length: 255 }),
	storyboardData: jsonb("storyboard_data"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("career_story_six_user_session_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.sessionId.asc().nullsLast().op("int4_ops")),
]);

export const postCoachingAssessments = pgTable("post_coaching_assessments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	sessionId: integer("session_id").default(8).notNull(),
	answers: jsonb().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("unique_user_session_post_coaching").on(table.userId, table.sessionId),
]);

export const riasecTest = pgTable("riasec_test", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	selectedAnswers: varchar("selected_answers", { length: 4000 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	categoryCounts: json("category_counts").notNull(),
	interestCode: varchar("interest_code", { length: 3 }).notNull(),
	sessionId: integer("session_id").default(2).notNull(),
}, (table) => [
	unique("riasec_test_user_id_session_id_unique").on(table.userId, table.sessionId),
]);

export const psychologicalWellbeingTest = pgTable("psychological_wellbeing_test", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	answers: varchar({ length: 4000 }).notNull(),
	score: numeric({ precision: 5, scale:  2 }).default('0').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	subscaleScores: json("subscale_scores").default({}).notNull(),
	sessionId: integer("session_id").default(1).notNull(),
}, (table) => [
	unique("psychological_wellbeing_test_user_id_unique").on(table.userId),
	unique("psychological_wellbeing_test_user_id_session_id_unique").on(table.userId, table.sessionId),
]);

export const dailyJournaling = pgTable("daily_journaling", {
	userId: varchar("user_id", { length: 255 }).notNull(),
	sessionId: integer("session_id").notNull(),
	date: varchar({ length: 10 }).notNull(),
	tookAction: varchar("took_action", { length: 3 }).default('),
	whatHeldBack: text("what_held_back").default('),
	challenges: text().default('[]'),
	progress: text().default('[]'),
	gratitude: text().default('[]'),
	gratitudeHelp: text("gratitude_help").default('[]'),
	tomorrowStep: text("tomorrow_step").default('),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	id: uuid().defaultRandom().primaryKey().notNull(),
}, (table) => [
	unique("daily_journaling_user_session_date_unique").on(table.userId, table.sessionId, table.date),
]);

export const careerMaturityAssessment = pgTable("career_maturity_assessment", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	answers: varchar({ length: 4000 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	sessionId: integer("session_id").default(1).notNull(),
}, (table) => [
	unique("career_maturity_assessment_user_id_session_id_unique").on(table.userId, table.sessionId),
]);

export const userSessionFormProgress = pgTable("user_session_form_progress", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	sessionId: integer("session_id").notNull(),
	formId: text("form_id").notNull(),
	status: varchar({ length: 32 }).notNull(),
	score: integer(),
	completedAt: varchar("completed_at", { length: 32 }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	insights: jsonb().default({}),
});

export const emailVerificationTokens = pgTable("email_verification_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "email_verification_tokens_user_id_User_id_fk"
		}).onDelete("cascade"),
]);

export const demographicsDetailsForm = pgTable("demographics_details_form", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	fullName: varchar("full_name", { length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	email: varchar({ length: 100 }),
	age: integer(),
	education: varchar({ length: 100 }),
	stressLevel: integer("stress_level"),
	motivation: varchar({ length: 500 }),
	gender: varchar({ length: 30 }),
	profession: varchar({ length: 50 }),
	previousCoaching: varchar("previous_coaching", { length: 20 }),
}, (table) => [
	unique("demographics_details_form_user_id_unique").on(table.userId),
]);

export const preAssessment = pgTable("pre_assessment", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	answers: varchar({ length: 4000 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	sessionId: integer("session_id").default(1).notNull(),
}, (table) => [
	unique("pre_assessment_user_id_session_id_unique").on(table.userId, table.sessionId),
]);

export const personalityTest = pgTable("personality_test", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	answers: varchar({ length: 4000 }).notNull(),
	score: numeric({ precision: 5, scale:  2 }).default('0').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	subscaleScores: json("subscale_scores").default({}).notNull(),
	sessionId: integer("session_id").default(2).notNull(),
}, (table) => [
	unique("personality_test_user_id_session_id_unique").on(table.userId, table.sessionId),
]);

export const careerStoryTwo = pgTable("career_story_two", {
	userId: varchar("user_id", { length: 255 }).notNull(),
	sessionId: integer("session_id").notNull(),
	firstAdjectives: text("first_adjectives").notNull(),
	repeatedWords: text("repeated_words").notNull(),
	commonTraits: text("common_traits").notNull(),
	significantWords: text("significant_words").notNull(),
	selfStatement: text("self_statement").notNull(),
	mediaActivities: text("media_activities").notNull(),
	selectedRiasec: jsonb("selected_riasec").default([]).notNull(),
	settingStatement: text("setting_statement").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	id: uuid().defaultRandom().primaryKey().notNull(),
}, (table) => [
	uniqueIndex("career_story_two_user_session_unique").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.sessionId.asc().nullsLast().op("int4_ops")),
]);

export const preCoachingSdq = pgTable("pre_coaching_sdq", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	sessionId: integer("session_id").default(1).notNull(),
	answers: jsonb().notNull(),
	score: numeric({ precision: 5, scale:  2 }).default('0').notNull(),
	subscaleScores: json("subscale_scores").default({}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("pre_coaching_sdq_user_id_session_id_unique").on(table.userId, table.sessionId),
]);

export const uploadedImages = pgTable("uploaded_images", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	imageUrl: text("image_url").notNull(),
	imagePath: text("image_path").notNull(),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	fileSize: integer("file_size").notNull(),
	mimeType: varchar("mime_type", { length: 100 }).notNull(),
	imageType: varchar("image_type", { length: 50 }),
	isOptimized: boolean("is_optimized").default(false).notNull(),
	lastAccessedAt: timestamp("last_accessed_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	sessionId: integer("session_id").notNull(),
}, (table) => [
	index("idx_last_accessed").using("btree", table.lastAccessedAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_session_id").using("btree", table.sessionId.asc().nullsLast().op("int4_ops")),
	index("idx_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	index("idx_user_image_type").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.imageType.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "uploaded_images_user_id_fkey"
		}).onDelete("cascade"),
	unique("uploaded_images_image_url_key").on(table.imageUrl),
]);

export const careerOptionsMatrix = pgTable("career_options_matrix", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }).notNull(),
	sessionId: integer("session_id").notNull(),
	rows: jsonb().notNull(),
	columns: jsonb().notNull(),
	cells: jsonb().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const feedback = pgTable("feedback", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	sessionId: integer("session_id").notNull(),
	overallFeeling: jsonb("overall_feeling").notNull(),
	keyInsight: text("key_insight").notNull(),
	overallRating: integer("overall_rating").notNull(),
	wouldRecommend: boolean("would_recommend").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_feedback_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_feedback_session_id").using("btree", table.sessionId.asc().nullsLast().op("int4_ops")),
	index("idx_feedback_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	unique("feedback_user_session_unique").on(table.userId, table.sessionId),
	check("feedback_overall_rating_check", sql`(overall_rating >= 1) AND (overall_rating <= 5)`),
	check("feedback_rating_range", sql`(overall_rating >= 1) AND (overall_rating <= 5)`),
]);

export const careerStoryOne = pgTable("career_story_one", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	sessionId: integer("session_id").notNull(),
	transitionEssay: text("transition_essay").notNull(),
	occupations: text().notNull(),
	heroes: jsonb().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	mediaPreferences: text("media_preferences").default(').notNull(),
	favoriteStory: text("favorite_story").default(').notNull(),
	favoriteSaying: text("favorite_saying").default(').notNull(),
}, (table) => [
	uniqueIndex("career_story_one_user_session_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.sessionId.asc().nullsLast().op("int4_ops")),
]);

export const journeyProgress = pgTable("journey_progress", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	currentSession: integer("current_session").notNull(),
	completedSessions: json("completed_sessions").notNull(),
	totalScore: integer("total_score").notNull(),
	lastActiveDate: varchar("last_active_date", { length: 32 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	enableByCoach: jsonb("enable_by_coach").default({}),
});

export const myLifeCollage = pgTable("my_life_collage", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }).notNull(),
	sessionId: integer("session_id").notNull(),
	presentLifeCollage: jsonb("present_life_collage").default([]).notNull(),
	futureLifeCollage: jsonb("future_life_collage").default([]).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("my_life_collage_user_session_unique").on(table.userId, table.sessionId),
]);

export const careerStoryThree = pgTable("career_story_three", {
	userId: text("user_id").notNull(),
	sessionId: integer("session_id").notNull(),
	selfStatement: text("self_statement").notNull(),
	settingStatement: text("setting_statement").notNull(),
	plotDescription: text("plot_description").notNull(),
	plotActivities: text("plot_activities").notNull(),
	ableToBeStatement: text("able_to_be_statement").notNull(),
	placesWhereStatement: text("places_where_statement").notNull(),
	soThatStatement: text("so_that_statement").notNull(),
	mottoStatement: text("motto_statement").notNull(),
	selectedOccupations: jsonb("selected_occupations").default([]).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	id: uuid().defaultRandom().primaryKey().notNull(),
}, (table) => [
	index("career_story_three_user_session_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.sessionId.asc().nullsLast().op("text_ops")),
	unique("career_story_three_user_session_unique").on(table.userId, table.sessionId),
]);

export const letterFromFutureSelf = pgTable("letter_from_future_self", {
	userId: varchar("user_id").notNull(),
	sessionId: integer("session_id").notNull(),
	letter: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	id: uuid().defaultRandom().primaryKey().notNull(),
}, (table) => [
	index("letter_from_future_self_user_session_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.sessionId.asc().nullsLast().op("text_ops")),
	unique("letter_from_future_self_user_session_unique").on(table.userId, table.sessionId),
]);

export const postCareerMaturity = pgTable("post_career_maturity", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	answers: jsonb().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	sessionId: integer("session_id").default(8).notNull(),
}, (table) => [
	unique("post_career_maturity_user_id_session_id_unique").on(table.userId, table.sessionId),
]);

export const mappings = pgTable("mappings", {
	mappingId: text("mapping_id").primaryKey().notNull(),
	userId: text("user_id").notNull(),
	personId: text("person_id").notNull(),
	coachEmail: text("coach_email").notNull(),
	personData: jsonb("person_data"),
	mappedAt: timestamp("mapped_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const people = pgTable("people", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: text(),
	email: text(),
	role: text(),
	data: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const postPsychologicalWellbeingTest = pgTable("post_psychological_wellbeing_test", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	sessionId: integer("session_id").notNull(),
	answers: varchar({ length: 4000 }).notNull(),
	score: numeric({ precision: 5, scale:  2 }).default('0').notNull(),
	subscaleScores: json("subscale_scores").default({}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("post_psychological_wellbeing_test_user_id_session_id_unique").on(table.userId, table.sessionId),
]);

export const coaches = pgTable("coaches", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text(),
	email: text(),
	clients: text(),
	sessionLinks: text("session_links"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("coaches_email_key").on(table.email),
]);

export const report = pgTable("report", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	sessionId: integer("session_id").notNull(),
	summary: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	coachFeedback: text("coach_feedback"),
}, (table) => [
	uniqueIndex("report_user_session_unique").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.sessionId.asc().nullsLast().op("int4_ops")),
]);

export const clientSummary = pgTable("client_summary", {
	id: serial().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	sessionId: integer("session_id").notNull(),
	summary: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_client_summary_client_session").using("btree", table.clientId.asc().nullsLast().op("int4_ops"), table.sessionId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [user.id],
			name: "client_summary_client_id_fkey"
		}).onDelete("cascade"),
	unique("client_summary_client_id_session_id_key").on(table.clientId, table.sessionId),
]);

export const postCoachingSdq = pgTable("post_coaching_sdq", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	sessionId: integer("session_id").default(8).notNull(),
	answers: jsonb().notNull(),
	score: numeric({ precision: 5, scale:  2 }).default('0').notNull(),
	subscaleScores: json("subscale_scores").default({}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("post_coaching_sdq_user_id_session_id_unique").on(table.userId, table.sessionId),
]);

export const vote = pgTable("Vote", {
	chatId: uuid().notNull(),
	messageId: uuid().notNull(),
	isUpvoted: boolean().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Vote_chatId_Chat_id_fk"
		}),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [message.id],
			name: "Vote_messageId_Message_id_fk"
		}),
	primaryKey({ columns: [table.chatId, table.messageId], name: "Vote_chatId_messageId_pk"}),
]);

export const voteV2 = pgTable("Vote_v2", {
	chatId: uuid().notNull(),
	messageId: uuid().notNull(),
	isUpvoted: boolean().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Vote_v2_chatId_Chat_id_fk"
		}),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [messageV2.id],
			name: "Vote_v2_messageId_Message_v2_id_fk"
		}),
	primaryKey({ columns: [table.chatId, table.messageId], name: "Vote_v2_chatId_messageId_pk"}),
]);

export const document = pgTable("Document", {
	id: uuid().defaultRandom().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	title: text().notNull(),
	content: text(),
	userId: uuid().notNull(),
	text: varchar().default('text').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Document_userId_User_id_fk"
		}),
	primaryKey({ columns: [table.id, table.createdAt], name: "Document_id_createdAt_pk"}),
]);
