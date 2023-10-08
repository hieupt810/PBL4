import EN from "./en/message.json";
import VI from "./vi/message.json";

export default function TranslateCode(language: string, message: string) {
  if (language === "VI") {
    type objectKey = keyof typeof VI;
    const msg = message as objectKey;
    return VI[msg] as string;
  }

  type objectKey = keyof typeof EN;
  const msg = message as objectKey;
  return EN[msg] as string;
}
