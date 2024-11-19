const DEEPL_API_KEY = import.meta.env.VITE_DEEPL_API_KEY;
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const translateText = async (text: string): Promise<string> => {
  if (!DEEPL_API_KEY) {
    console.warn('DeepL APIキーが設定されていません');
    return text;
  }

  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      const params = new URLSearchParams({
        text,
        target_lang: 'JA',
        source_lang: 'EN'
      });

      const response = await fetch(DEEPL_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.translations?.[0]?.text) {
        throw new Error('Invalid translation response format');
      }

      return data.translations[0].text;
    } catch (error) {
      retries++;
      console.error(`翻訳試行 ${retries}/${MAX_RETRIES} 失敗:`, error);
      
      if (retries === MAX_RETRIES) {
        console.error('翻訳エラー: すべての試行が失敗しました');
        return text;
      }
      
      await sleep(RETRY_DELAY * retries);
    }
  }

  return text;
};