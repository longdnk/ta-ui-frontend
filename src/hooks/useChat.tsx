import React, { useState, useRef, useCallback } from "react";
import { ChatItem, Payload } from "../types";
import { useAuth } from "./useAuth";
import { PulseLoader } from "react-spinners";
import { useChatStreamMutation } from "../api/chat/chat.slice";
import { useRagStreamMutation } from "../api/rag/rag.slice"
import { useQuestion } from "./useQuestion";

type ChatParams = {
    inputMessage: string
    connectionStatus: string
    retryCount: number
    isRender: boolean
}

export const useChat = () => {
    const { userName } = useAuth()
    // Thêm các state mới cho kết nối
    const [chatParam, setChatParam] = useState<ChatParams>({
        inputMessage: '', connectionStatus: 'Uninstantiated', retryCount: 0, isRender: false
    })

    const [chatStream, {isLoading: isChatting}] = useChatStreamMutation()
    const [ragStream, {isLoading: isRetrieving}] = useRagStreamMutation()

    const setResult = (chunk: string) => {
        result.current += chunk;
        setMessages(prev => updateMessageContent(prev, result.current));
    }

    const resetItem = (isRender: boolean) => {
        setChatParam({ ...chatParam, inputMessage: '', isRender: isRender });
    }

    const [messages, setMessages] = useState<ChatItem[]>([
        {
            role: 'assistant',
            content: `Chào **${userName.toUpperCase()}**, tôi tên là **MeMe** trợ lý của bạn, tôi có thể hỏi đáp các thắc mắc về dịch vụ tài chính, tiền tệ hoặc ví trả trước trả sau và các vấn đề liên quan tới MoMo !!!`,
        }
    ])

    const result = useRef<string>('');

    const { checkSimilarity } = useQuestion()

    const updateMessage = (message: string) => {
        messages.push(
            { role: 'user', content: message },
            { role: 'assistant', content: <PulseLoader color={'#4229fb'} margin={2} size={8}/> }
        )
        // Reset result for new message
        result.current = '';
    };

    const sendMessage = async () => {
        // checkSimilarity(messages[])
        const item: ChatItem = {
            role: 'system',
            content: 'Your name is Mr Beast, best AI for machine learning, deep learning, RAG.'
        }

        const payload: Payload = {
            model_name: "gemma2-9b-it",
            conservation: [item, ...messages],
            max_tokens: 1024,
        };

        payload.conservation.pop();
        const messageUser = payload.conservation.slice(-1)[0].content
        payload.conservation.push({ role: 'assistant', content: 'Thinking...' })
        result.current = '';

        const isValid = checkSimilarity(messageUser)
        if (isValid) {
            return await chatStream({ ...payload, callbackResult: setResult, callbackReset: resetItem })
        }
        // logic send message
        await ragStream({ ...payload, callbackResult: setResult, callbackReset: resetItem })
        const prompt: ChatItem = {
            role: 'system',
            content: `
Based on the question: "[${payload.conservation.slice(-1)[0].content}]" and the context: "[${result.current}]",
please provide a clearer, more effective, and easily understandable answer,
responding in the same language as the input, don't forget put reference link in the answer if context have.
Note: MoMo is not a company; it is merely an e-wallet created by M Service.
If user ask 'Momo có phải là công ty không' or same, this is true answer 'Momo không phải là công ty'
`
        }
        const newPayload: Payload = {
            model_name: "llama-3.2-3b-preview",
            conservation: [prompt, ...messages],
            max_tokens: 1024,
        };
        await chatStream({ ...newPayload, callbackResult: setResult, callbackReset: resetItem })
    };

    const resetMessages = useCallback(() => {
        setChatParam({ ...chatParam, isRender: true })
        setMessages(prevMessages => {
            // Bước 1: Xóa tin nhắn 'role: assistant' cuối cùng
            const newMessages = prevMessages.slice(0, prevMessages.length - 1)

            // Bước 3: Cập nhật lại tin nhắn assistant cuối cùng
            return [...newMessages,
                { role: 'assistant', content: <PulseLoader color={'#4229fb'} margin={2} size={8}/> }
            ]
        })
        messages.pop()
        messages.push({ role: 'assistant', content: 'Thinking...' })
    }, [setChatParam, setMessages, messages])

    const updateMessageContent = useCallback((prevMessages: ChatItem[], content: string) => {
        const lastMessage = prevMessages[prevMessages.length - 1]

        if (lastMessage?.role !== 'assistant') return prevMessages

        return [
            ...prevMessages.slice(0, prevMessages.length - 1),
            { ...lastMessage, content }
        ]
    }, [])

    return {
        messages,
        inputMessage: chatParam.inputMessage,
        sendMessage,
        resetMessages,
        chatParam,
        setChatParam,
        updateMessage,
        connectionStatus: chatParam.connectionStatus,
        retryCount: chatParam.retryCount,
        isRender: chatParam.isRender,
        textResult: result.current,
        isChatting: isChatting,
        isRetrieving: isRetrieving
    };
};