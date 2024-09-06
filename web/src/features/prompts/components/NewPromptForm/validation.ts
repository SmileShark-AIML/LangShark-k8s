import { z } from "zod";
import { PromptType } from "@/src/features/prompts/server/utils/validation";
import { ChatMessageRole } from "@langfuse/shared";

const ChatMessageSchema = z.object({
  role: z.nativeEnum(ChatMessageRole),
  content: z.string(),
});

export const ChatMessageListSchema = z.array(ChatMessageSchema);
export const TextPromptSchema = z.string().min(1, "프롬프트를 입력하세요.");

const NewPromptBaseSchema = z.object({
  name: z.string().min(1, "이름을 입력하세요."),
  isActive: z.boolean({
    required_error: "Enter whether the prompt should go live",
  }),
  config: z.string().refine(validateJson, "설정이 올바른 JSON형식이 아닙니다."),
});

const NewChatPromptSchema = NewPromptBaseSchema.extend({
  type: z.literal(PromptType.Chat),
  chatPrompt: ChatMessageListSchema.refine(
    (messages) => messages.every((message) => message.content.length > 0),
    "메세지를 입력하거나 빈 메세지를 삭제하세요",
  ),
  textPrompt: z.string(),
});

const NewTextPromptSchema = NewPromptBaseSchema.extend({
  type: z.literal(PromptType.Text),
  chatPrompt: z.array(z.any()),
  textPrompt: TextPromptSchema,
});

export const NewPromptFormSchema = z.union([
  NewChatPromptSchema,
  NewTextPromptSchema,
]);
export type NewPromptFormSchemaType = z.infer<typeof NewPromptFormSchema>;

export const PromptContentSchema = z.union([
  z.object({
    type: z.literal(PromptType.Chat),
    prompt: ChatMessageListSchema,
  }),
  z.object({
    type: z.literal(PromptType.Text),
    prompt: z.string(),
  }),
]);
export type PromptContentType = z.infer<typeof PromptContentSchema>;

function validateJson(content: string): boolean {
  try {
    JSON.parse(content);

    return true;
  } catch (e) {
    return false;
  }
}
