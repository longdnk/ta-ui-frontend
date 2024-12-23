import useWebSocket, { ReadyState } from 'react-use-websocket';
import React, { useEffect, useState, useRef, useCallback } from "react";
import { ChatItem, Payload } from "../types";
import { useAuth } from "./useAuth";
import { PulseLoader } from "react-spinners";
import { useRagQueryMutation } from "../api/rag/rag.slice";

const URL = process.env.WDS_SOCKET_PATH;
const MAX_RETRY_ATTEMPTS = 100;
const RETRY_DELAY = 2000; // 1 giây

type ChatParams = {
    inputMessage: string
    connectionStatus: string
    retryCount: number
    isRender: boolean
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
    const { userName } = useAuth()
    // Thêm các state mới cho kết nối
    const [chatParam, setChatParam] = useState<ChatParams>({
        inputMessage: '', connectionStatus: 'Uninstantiated', retryCount: 0, isRender: false
    })

    const [ragQuery, { isLoading, isSuccess, data }] = useRagQueryMutation()

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
    })

    // State chat ban đầu chứa các tin nhắn giữa user và assistant
    const [messages, setMessages] = useState<ChatItem[]>([
        {
            role: 'assistant',
            content: `Chào **${userName.toUpperCase()}**, tôi tên là **MeMe** trợ lý của bạn, tôi có thể hỏi đáp các thắc mắc về dịch vụ tài chính, tiền tệ hoặc ví trả trước trả sau và các vấn đề liên quan tới MoMo !!!`,
        }
    ])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChatParam({ ...chatParam, inputMessage: event.target.value });
    }

    const handleSendMessage = () => {
        if (chatParam.inputMessage.trim()) {
            sendMessage()
            setChatParam({ ...chatParam, inputMessage: '', isRender: true })
        }
    }

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (chatParam.isRender) {
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault()
            updateMessage(chatParam.inputMessage)
            handleSendMessage()
        }
    };

    const result = useRef<string>('');

    // Cập nhật tin nhắn từ user và thêm tin nhắn assistant mới
    const updateMessage = (message: string) => {
        messages.push(
            { role: 'user', content: message },
            { role: 'assistant', content: <PulseLoader color={'#4229fb'} margin={2} size={8}/> }
        )
        // Reset result for new message
        result.current = '';
    };

    const sendMessage = async () => {
        const data = await retrieveInfo()
        const item: ChatItem = {
            role: 'system',
            content: `
            Bạn là một chatbot thông minh thuộc Công ty Cổ phần Dịch vụ Di Động Trực tuyến (M_Service) 
            được biết tới với tên là MoMo, 
            nhiệm vụ của bạn là hỏi đáp các thông tin về dịch vụ của MoMo, 
            hãy luôn dựa vào context(thông tin cơ sở) được cung cấp để trả lời câu hỏi, 
            với các câu hỏi mà bạn cảm thấy thông tin trong context và nội dung câu hỏi không khớp 
            hoặc ngữ cảnh không phù hợp thì hãy hoặc bạn thực sự không biết câu trả lời thì hãy trả lời là bạn không biết, 
            lưu ý là không được bịa ra thông tin và trả lời câu hỏi một cách ngắn gọn nhất có thể, và một lần nữa nhớ là tên bạn là MeMe
            context: ${data}
            bạn lưu ý luôn luôn phải để đưởng dẫn thông tin (các đường https://) vào câu trả lời nếu có thể nhé !!!
            Ưu tiên trả lời bằng tiếng Việt và chỉ trả lời bằng ngôn ngữ khác khi cần thiết
            Không cần phải chào người dùng quá nhiều.
            Nếu người dùng chào bạn, hoặc làm các hành động tương tự hãy nói bạn tên là **MeMe** và rất vui được phục vụ là được
            `
        }

        const payload: Payload = {
            // model_name: 'Qwen/Qwen2.5-72B-Instruct',
            // model_name: "Qwen/QwQ-32B-Preview",
            // model_name: "Qwen/Qwen2.5-1.5B-Instruct",
            // model_name: "meta-llama/Llama-3.2-3B-Instruct",
            // model_name: "meta-llama/Llama-3.2-1B-Instruct",
            model_name: "meta-llama/Meta-Llama-3-8B-Instruct",
            // model_name: "meta-llama/Llama-3.1-8B-Instruct",
            // model_name: "microsoft/Phi-3.5-mini-instruct",
            // model_name: "microsoft/Phi-3-mini-4k-instruct",
            conservation: [item, ...messages],
            max_token: 1024,
            stream_mode: 'token',
            sleep_time: 0.01
        };
        payload.conservation.pop();
        payload.conservation.push({ role: 'assistant', content: 'Thinking...' })
        sendJsonMessage(payload);
        result.current = '';
    };

    const resetMessages = useCallback(() => {
        setChatParam({ ...chatParam, isRender: true })
        setMessages(prevMessages => {
            // Bước 1: Xóa tin nhắn 'role: assistant' cuối cùng
            const newMessages = prevMessages.slice(0, prevMessages.length - 1);

            // Bước 3: Cập nhật lại tin nhắn assistant cuối cùng
            return [...newMessages,
                { role: 'assistant', content: <PulseLoader color={'#4229fb'} margin={2} size={8}/> }
            ];
        });
        messages.pop()
        messages.push({ role: 'assistant', content: 'Thinking...' })
    }, [setChatParam, setMessages, messages]);

    const updateMessageContent = useCallback((prevMessages: ChatItem[], content: string) => {
        const lastMessage = prevMessages[prevMessages.length - 1];

        if (lastMessage?.role !== 'assistant') return prevMessages;

        return [
            ...prevMessages.slice(0, prevMessages.length - 1),
            { ...lastMessage, content }
        ];
    }, []);

    const retrieveInfo = async () => {
        try {
            const response = await ragQuery({ text: chatParam.inputMessage }).unwrap()
            return response.data;
        }
        catch (e) {
            return "error"
        }
    }

    // Theo dõi trạng thái kết nối
    useEffect(() => {
        const status = connectionStatusMap[readyState];
        setChatParam({ ...chatParam, connectionStatus: status });
    }, [readyState, setChatParam]);

    useEffect(() => {
        if (!lastJsonMessage) return;

        const { status, text } = lastJsonMessage;

        switch (status) {
            case 'done': {
                setChatParam(prev => ({ ...prev, isRender: false }));
                result.current = ""
                break;
            }
            default: {
                if (status === 'done') break;
                result.current += text;
                // Batch update: chỉ update UI sau mỗi N tokens
                setMessages(prev => updateMessageContent(prev, result.current));
            }
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
        resetMessages,
        // Thêm các trạng thái kết nối
        connectionStatus: chatParam.connectionStatus,
        retryCount: chatParam.retryCount,
        manualReconnect,
        isConnected: readyState === ReadyState.OPEN,
        isRender: chatParam.isRender,
        textResult: result.current,
    };
};