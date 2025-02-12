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

export type NewChatPayload = {
    title: string
    user_id: number
    conversation: ChatItem[]
}

export type NewChatResponse = {
    id: number
    title: string
    conversation: ChatItem[]
    user_id: number
    id_deleted?: boolean
    created_at?: string
    updated_at?: string
    user?: object | null | undefined
    default_prompt?: object | null | undefined
    default_model?: object | null | undefined
}