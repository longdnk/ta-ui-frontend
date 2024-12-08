export type Payload = {
    model_name: string
    conservation: ChatItem[]
    max_token: number
    stream_mode: 'token' | 'digit' | 'word'
}

export type ChatItem = {
    role: 'system' | 'assistant' | 'user'
    content: string | JSX.Element
}