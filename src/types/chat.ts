export type Payload = {
    model_name: string
    conservation: ChatItem[]
    max_tokens?: number | null
    temperature?: number | null
    callbackResult?: (item: string) => void
    callbackReset?: (isRender: boolean) => void
}

export type ChatItem = {
    role: 'system' | 'assistant' | 'user'
    content: string | JSX.Element | null;
}