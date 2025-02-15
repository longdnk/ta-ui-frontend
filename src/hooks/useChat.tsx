import React, { useState, useRef, useCallback } from "react";
import { ChatItem, Payload } from "../types";
import { useAuth } from "./useAuth";
import { PulseLoader } from "react-spinners";
import { useChatStreamMutation } from "../api/chat/chat.slice";
import { useRagStreamMutation } from "../api/rag/rag.slice"
import { useQuestion } from "./useQuestion";
import { useLocalChat } from "./useLocalChat";

type ChatParams = {
    inputMessage: string
    connectionStatus: string
    retryCount: number
    isRender: boolean
}

export const useChat = () => {
    // Thêm các state mới cho kết nối
    const [chatParam, setChatParam] = useState<ChatParams>({
        inputMessage: '', connectionStatus: 'Uninstantiated', retryCount: 0, isRender: false
    })

    const [chatStream, { isLoading: isChatting }] = useChatStreamMutation()
    const [ragStream, { isLoading: isRetrieving }] = useRagStreamMutation()

    const result = useRef<string>('')

    const { localChat } = useLocalChat()

    const [messages, setMessages] = useState<ChatItem[]>(localChat)

    const setResult = (chunk: string) => {
        result.current += chunk;
        setMessages(prev => updateMessageContent(prev, result.current));
    }

    const resetItem = (isRender: boolean) => {
        setChatParam({ ...chatParam, inputMessage: '', isRender: isRender });
    }

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
        const item: ChatItem = {
            role: 'system',
            content: 'Your name is Meme, best chatbot for question answering with all MoMo problem.'
        }

        const payload: Payload = {
            model_name: "llama3-70b-8192",
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
        await ragStream({
            ...payload,
            callbackResult: setResult,
            callbackReset: resetItem
        }).then(() => console.log("DONE RAG FLOW"))

        const prompt: ChatItem = {
            role: 'system',
            content: `
Dựa vào câu hỏi: "[${payload.conservation.slice(-1)[0].content}]" và context được cung cấp: "[${result.current}]",
nhiệm vụ của bạn là đưa ra câu trả lời dễ hiểu, rõ ràng hơn và dễ đọc hơn, ưu tiên trả lời tiếng Việt.
Hãy chèn các link tham khảo nếu bạn có thể, đảm bảo ở câu trả lời cuối không chứa các khối HTML.
`
        }

        let resultString = "";

        const detailsRegex = /<details[^>]*>[\s\S]*?<summary>(.*?)<\/summary>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi;
        for (const match of result.current.matchAll(detailsRegex)) {
            const summaryContent = match[1].trim();
            const pContent = match[2].trim();
            if (summaryContent.includes("Relevant")) {
                const cleanContent = pContent.replace(/<[^>]+>/g, "").trim();
                resultString += `Type: Relevant\nSummary: ${summaryContent}\nContent: ${cleanContent}\n\n---\n\n`;
            }
        }

        const generateRegex = /<blockquote[^>]*>\s*<strong>\s*Generate Response\s*<span[^>]*>(.*?)<\/span>\s*<\/strong>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/blockquote>/gi;
        for (const match of result.current.matchAll(generateRegex)) {
            const resultMessage = match[1].trim();
            const generatedContent = match[2].replace(/<[^>]+>/g, "").trim();
            resultString += `Type: Generate Response\nResult: ${resultMessage}\nContent: ${generatedContent}\n\n===\n\n`;
        }

        const newPayload: Payload = {
            model_name: "llama3-70b-8192",
            conservation: [prompt, { role: 'user', content: resultString }],
            max_tokens: 1024,
            temperature: 0
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
        isRetrieving: isRetrieving,
        setMessages
    };
};