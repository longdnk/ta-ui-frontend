export type Payload = {
    model_name: string
    conservation: ChatItem[]
    max_token: number
    stream_mode: 'token' | 'digit' | 'word'
    sleep_time: number
    callbackResult?: (item: string) => void
    callbackReset?: (isRender: boolean) => void
}

export type ChatItem = {
    role: 'system' | 'assistant' | 'user'
    content: string | JSX.Element | null;
}