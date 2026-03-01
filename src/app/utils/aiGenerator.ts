import type { Question, Difficulty, QuestionType } from '../types/question'
import { generateId } from './questionBank'

export type AIProviderType = 'claude' | 'openai' | 'qianwen' | 'zhipu'

export interface AIProviderInfo {
  id: AIProviderType
  name: string
  description: string
  baseURL: string
  defaultModel: string
}

export const AI_PROVIDERS: AIProviderInfo[] = [
  {
    id: 'claude',
    name: 'Anthropic Claude',
    description: '高质量出题，推荐',
    baseURL: 'https://api.anthropic.com',
    defaultModel: 'claude-haiku-4-5-20251001',
  },
  {
    id: 'openai',
    name: 'OpenAI GPT',
    description: '通用备选',
    baseURL: 'https://api.openai.com',
    defaultModel: 'gpt-4o-mini',
  },
  {
    id: 'qianwen',
    name: '阿里通义千问',
    description: '国内首选，速度快',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode',
    defaultModel: 'qwen-turbo',
  },
  {
    id: 'zhipu',
    name: '智谱 GLM',
    description: '国内备选，免费额度大',
    baseURL: 'https://open.bigmodel.cn/api/paas',
    defaultModel: 'glm-4-flash',
  },
]

export interface GenerateConfig {
  subject: string
  difficulty: Difficulty
  count: number
  questionType: QuestionType | 'mixed'
  extraPrompt?: string
}

export interface AIKeys {
  claude?: string
  openai?: string
  qianwen?: string
  zhipu?: string
}

const AI_KEYS_STORAGE = 'ai-keys'

export function loadAIKeys(): AIKeys {
  try {
    const raw = localStorage.getItem(AI_KEYS_STORAGE)
    return raw ? (JSON.parse(raw) as AIKeys) : {}
  } catch {
    return {}
  }
}

export function saveAIKeys(keys: AIKeys): void {
  localStorage.setItem(AI_KEYS_STORAGE, JSON.stringify(keys))
}

function buildPrompt(config: GenerateConfig): string {
  const typeDesc = {
    single: '单选题（4个选项，1个正确答案）',
    multiple: '多选题（4个选项，2-3个正确答案）',
    truefalse: '判断题（正确/错误）',
    short: '简答题',
    mixed: '混合类型（单选为主，适量多选和判断题）',
  }[config.questionType]

  return `你是一位专业出题专家。请为"${config.subject}"科目生成 ${config.count} 道 ${config.difficulty === 'easy' ? '简单' : config.difficulty === 'medium' ? '中等' : '困难'} 难度的${typeDesc}。
${config.extraPrompt ? `\n额外要求：${config.extraPrompt}\n` : ''}
请严格按照以下 JSON 格式输出，不要有任何其他内容：

[
  {
    "type": "single" | "multiple" | "truefalse",
    "content": "题目内容",
    "options": [
      { "id": "a", "text": "选项A" },
      { "id": "b", "text": "选项B" },
      { "id": "c", "text": "选项C" },
      { "id": "d", "text": "选项D" }
    ],
    "correctAnswers": ["a"],
    "explanation": "解析说明"
  }
]

注意：
- 判断题只需两个选项：{"id":"true","text":"正确"} 和 {"id":"false","text":"错误"}
- 多选题 correctAnswers 包含多个 id
- 确保题目内容清晰、准确、无歧义
- 输出纯 JSON，不要加 markdown 代码块标记`
}

function parseAIResponse(text: string, config: GenerateConfig): Question[] {
  // 尝试提取 JSON 数组
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('AI 返回格式错误，未找到 JSON 数组')

  const items = JSON.parse(match[0]) as Array<{
    type: QuestionType
    content: string
    options: Array<{ id: string; text: string }>
    correctAnswers: string[]
    explanation?: string
  }>

  return items.map(item => ({
    id: generateId(),
    type: item.type,
    subject: config.subject,
    difficulty: config.difficulty,
    content: item.content,
    options: item.options,
    correctAnswers: item.correctAnswers,
    explanation: item.explanation,
    tags: [config.subject],
    createdAt: Date.now(),
  }))
}

async function callClaude(apiKey: string, prompt: string, model: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Claude API 错误：${res.status} ${(err as { error?: { message?: string } }).error?.message ?? ''}`)
  }
  const data = await res.json() as { content: Array<{ text: string }> }
  return data.content[0]?.text ?? ''
}

async function callOpenAICompat(
  apiKey: string,
  baseURL: string,
  model: string,
  prompt: string,
): Promise<string> {
  const res = await fetch(`${baseURL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`API 错误：${res.status} ${(err as { error?: { message?: string } }).error?.message ?? ''}`)
  }
  const data = await res.json() as { choices: Array<{ message: { content: string } }> }
  return data.choices[0]?.message?.content ?? ''
}

export async function generateQuestions(
  provider: AIProviderType,
  apiKey: string,
  config: GenerateConfig,
  customModel?: string,
): Promise<Question[]> {
  const providerInfo = AI_PROVIDERS.find(p => p.id === provider)
  if (!providerInfo) throw new Error('不支持的 AI 服务商')

  const model = customModel ?? providerInfo.defaultModel
  const prompt = buildPrompt(config)

  let text: string

  if (provider === 'claude') {
    text = await callClaude(apiKey, prompt, model)
  } else {
    text = await callOpenAICompat(apiKey, providerInfo.baseURL, model, prompt)
  }

  return parseAIResponse(text, config)
}
