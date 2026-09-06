export type AiChannel = "website" | "whatsapp" | "admin" | "api";

export type AiWorkerKey =
  | "faith_reception"
  | "job_matching"
  | "application_support"
  | "document_verification"
  | "canada"
  | "australia"
  | "new_zealand"
  | "gulf"
  | "medical_compliance"
  | "application_status"
  | "human_handoff";

export type AiContactInput = {
  fullName?: string;
  phone?: string;
  email?: string;
  jobInterest?: string;
  countryInterest?: string;
  consentToContact?: boolean;
};

export type AiChatInput = {
  message: string;
  conversationId?: string;
  channel?: AiChannel;
  externalThreadId?: string;
  contact?: AiContactInput;
};

export type AiConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiWorkerDefinition = {
  key: AiWorkerKey;
  label: string;
  model: string;
  instructions: string;
};

export type AiProviderResult = {
  responseId: string;
  text: string;
  inputTokens?: number;
  outputTokens?: number;
};
