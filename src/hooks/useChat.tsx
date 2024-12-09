import useWebSocket, { ReadyState } from 'react-use-websocket';
import React, { useEffect, useState, useRef, useCallback } from "react";
import { ChatItem, Payload } from "../types";
import { useAuth } from "./useAuth";
import { sleep } from "../helper";
import { PulseLoader } from "react-spinners";

const URL = process.env.WDS_SOCKET_PATH;
const MAX_RETRY_ATTEMPTS = 100;
const RETRY_DELAY = 2000; // 1 giây

type ChatParams = {
    inputMessage: string
    connectionStatus: string
    retryCount: number
}

// Ánh xạ trạng thái kết nối
const connectionStatusMap = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
};

export const useChat = () => {
    const { userName } = useAuth();
    // Thêm các state mới cho kết nối
    const [chatParam, setChatParam] = useState<ChatParams>({
        inputMessage: '', connectionStatus: 'Uninstantiated', retryCount: 0
    });

    const { sendJsonMessage, lastJsonMessage, readyState, getWebSocket } = useWebSocket(URL, {
        // Tùy chọn kết nối
        shouldReconnect: closeEvent => {
            // Tự động thử kết nối lại nếu chưa vượt quá số lần thử
            console.log(closeEvent.code)
            return chatParam.retryCount < MAX_RETRY_ATTEMPTS
        },
        reconnectAttempts: MAX_RETRY_ATTEMPTS,
        reconnectInterval: RETRY_DELAY,
        onOpen: () => {
            setChatParam({ ...chatParam, connectionStatus: 'Connected', retryCount: 0 });
        },
        onClose: () => {
            setChatParam({ ...chatParam, connectionStatus: 'Closed', retryCount: 0 });
        },
        onError: () => {
            setChatParam({ ...chatParam, connectionStatus: 'Error', retryCount: 0 });
        }
    });

    // State chat ban đầu chứa các tin nhắn giữa user và assistant
    const [messages, setMessages] = useState<ChatItem[]>([
        {
            role: 'assistant',
            content: `Hello ${userName.toUpperCase()}, my name is MeMe your assistant, what you need in Machine Learning, Deep Learning or A.I, what i can do for you !!!`,
        }
    ]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChatParam({ ...chatParam, inputMessage: event.target.value });
    };

    const handleSendMessage = () => {
        if (chatParam.inputMessage.trim()) {
            sendMessage();
            setChatParam({ ...chatParam, inputMessage: '' });
        }
    };

    const handleKeyPress = async (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            updateMessage(chatParam.inputMessage);
            handleSendMessage();  // Gửi tin nhắn khi nhấn Enter
        }
    };

    const result = useRef<string>('');

    // Cập nhật tin nhắn từ user và thêm tin nhắn assistant mới
    const updateMessage = (message: string) => {
        messages.push(
            { role: 'user', content: message },
            { role: 'assistant', content: <PulseLoader color={'#4229fb'} margin={2} size={8} /> }
        )
        // Reset result for new message
        result.current = '';
    };

    const sendMessage = () => {
        const item: ChatItem = {
            role: 'system',
            content: `CORE PERSONA:
            - Expert AI Assistant specializing in Artificial Intelligence, Machine Learning, and Deep Learning
            - Communication Protocol:
                1. Always provide direct, precise, and technically accurate answers
                2. Prioritize clarity and technical depth over verbosity
                3. Explain complex concepts in the most straightforward manner possible

            RESPONSE GUIDELINES:
            - Direct Questions: Deliver clear, concise definitions with key technical details
            - Comparative Queries: Structured comparison using:
                * Precise technical differences
                * Pros and cons
                * Practical application scenarios
            - Technical Depth: Balance technical accuracy with understandable language
            - Avoid: Redundant explanations, filler content, casual language

             COMMUNICATION STYLE:
            - Professional and academic tone
            - Use domain-specific terminology accurately
            - Provide context when necessary, but remain succinct
            - If a full explanation requires more detail, offer to elaborate

            CORE OBJECTIVE:
            Maximize information transfer with minimal words, ensuring the user gains precise understanding of AI, ML, and Deep Learning concepts
            `,
        }

        const payload: Payload = {
            model_name: 'Qwen/Qwen2.5-72B-Instruct',
            conservation: [item, ...messages],
            max_token: 2048,
            stream_mode: 'token'
        };
        sleep(100).then(() => console.log("Loading..."))
        payload.conservation.pop();
        payload.conservation.push({ role: 'assistant', content: 'Thinking...' })
        sendJsonMessage(payload);
    };

    // Theo dõi trạng thái kết nối
    useEffect(() => {
        const status = connectionStatusMap[readyState];
        setChatParam({ ...chatParam, connectionStatus: status });
    }, [readyState]);

    useEffect(() => {
        if (lastJsonMessage && lastJsonMessage.text) {
            const token = lastJsonMessage.text;

            // Cộng token vào result.current theo chế độ stream
            result.current += token;

            setMessages(prevMessages => {
                const lastMessage = prevMessages[prevMessages.length - 1];

                if (lastMessage && lastMessage.role === 'assistant') {
                    // Cập nhật tin nhắn assistant cuối cùng theo chế độ stream
                    const updatedLastMessage = { ...lastMessage, content: result.current };

                    return [
                        ...prevMessages.slice(0, prevMessages.length - 1),
                        updatedLastMessage
                    ];
                }
                return prevMessages;
            });
        }
    }, [lastJsonMessage]);

    // Phương thức thử kết nối lại theo yêu cầu
    const manualReconnect = useCallback(() => {
        if (readyState !== ReadyState.OPEN) {
            // Reset retry count
            setChatParam({ ...chatParam, retryCount: 0 });
            // Thực hiện kết nối lại
            const socket = getWebSocket();
            if (socket) {
                socket.close();
            }
        }
    }, [readyState, getWebSocket]);

    return {
        messages,
        inputMessage: chatParam.inputMessage,
        handleChange,
        handleKeyPress,
        handleSendMessage,
        sendMessage,
        // Thêm các trạng thái kết nối
        connectionStatus: chatParam.connectionStatus,
        retryCount: chatParam.retryCount,
        manualReconnect,
        isConnected: readyState === ReadyState.OPEN
    };
};