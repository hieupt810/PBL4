import EN from "./en/message.json";

export default function TranslateCode(language: string, message: string) {
  if (language === "VI") return "Chưa hỗ trợ";

  type objectKey = keyof typeof EN;
  const msg = message as objectKey;
  return EN[msg] as string;
}
