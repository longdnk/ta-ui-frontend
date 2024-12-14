export type Payload = {
    model_name: string
    conservation: ChatItem[]
    max_token: number
    stream_mode: 'token' | 'digit' | 'word'
    sleep_time: number
}

export type ChatItem = {
    role: 'system' | 'assistant' | 'user'
    content: string | JSX.Element | null;
}