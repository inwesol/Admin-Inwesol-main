import { relations } from "drizzle-orm/relations";
import { user, suggestion, chat, message, messageV2, passwordResetToken, emailVerificationTokens, uploadedImages, clientSummary, vote, voteV2, document } from "./schema";

export const suggestionRelations = relations(suggestion, ({one}) => ({
	user: one(user, {
		fields: [suggestion.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	suggestions: many(suggestion),
	chats: many(chat),
	passwordResetTokens: many(passwordResetToken),
	emailVerificationTokens: many(emailVerificationTokens),
	uploadedImages: many(uploadedImages),
	clientSummaries: many(clientSummary),
	documents: many(document),
}));

export const messageRelations = relations(message, ({one, many}) => ({
	chat: one(chat, {
		fields: [message.chatId],
		references: [chat.id]
	}),
	votes: many(vote),
}));

export const chatRelations = relations(chat, ({one, many}) => ({
	messages: many(message),
	user: one(user, {
		fields: [chat.userId],
		references: [user.id]
	}),
	messageV2s: many(messageV2),
	votes: many(vote),
	voteV2s: many(voteV2),
}));

export const messageV2Relations = relations(messageV2, ({one, many}) => ({
	chat: one(chat, {
		fields: [messageV2.chatId],
		references: [chat.id]
	}),
	voteV2s: many(voteV2),
}));

export const passwordResetTokenRelations = relations(passwordResetToken, ({one}) => ({
	user: one(user, {
		fields: [passwordResetToken.userId],
		references: [user.id]
	}),
}));

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({one}) => ({
	user: one(user, {
		fields: [emailVerificationTokens.userId],
		references: [user.id]
	}),
}));

export const uploadedImagesRelations = relations(uploadedImages, ({one}) => ({
	user: one(user, {
		fields: [uploadedImages.userId],
		references: [user.id]
	}),
}));

export const clientSummaryRelations = relations(clientSummary, ({one}) => ({
	user: one(user, {
		fields: [clientSummary.clientId],
		references: [user.id]
	}),
}));

export const voteRelations = relations(vote, ({one}) => ({
	chat: one(chat, {
		fields: [vote.chatId],
		references: [chat.id]
	}),
	message: one(message, {
		fields: [vote.messageId],
		references: [message.id]
	}),
}));

export const voteV2Relations = relations(voteV2, ({one}) => ({
	chat: one(chat, {
		fields: [voteV2.chatId],
		references: [chat.id]
	}),
	messageV2: one(messageV2, {
		fields: [voteV2.messageId],
		references: [messageV2.id]
	}),
}));

export const documentRelations = relations(document, ({one}) => ({
	user: one(user, {
		fields: [document.userId],
		references: [user.id]
	}),
}));