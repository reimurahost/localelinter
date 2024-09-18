export let GEMINI_API_KEY:string | undefined;
export function setAPIKey(key: string | undefined) {
    GEMINI_API_KEY = key;
}