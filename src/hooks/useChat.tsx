import React, { useState, useRef, useCallback } from "react";
import { ChatItem, Payload } from "../types";
import { useAuth } from "./useAuth";
import { PulseLoader } from "react-spinners";
import { useRagQueryMutation } from "../api/rag/rag.slice";
import { useChatStreamMutation } from "../api/chat/chat.slice";

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

    const [ragQuery, { }] = useRagQueryMutation()
    const [chatStream, {isLoading, isSuccess, isError}] = useChatStreamMutation()

    const setResult = (chunk: string) => {
        result.current += chunk;
        setMessages(prev => updateMessageContent(prev, result.current));
    }

    const resetItem = (isRender: boolean) => {
        setChatParam({...chatParam, inputMessage: '', isRender: isRender});
    }

    // State chat ban đầu chứa các tin nhắn giữa user và assistant
    const [messages, setMessages] = useState<ChatItem[]>([
        {
            role: 'assistant',
            content: `Chào **${userName.toUpperCase()}**, tôi tên là **MeMe** trợ lý của bạn, tôi có thể hỏi đáp các thắc mắc về dịch vụ tài chính, tiền tệ hoặc ví trả trước trả sau và các vấn đề liên quan tới MoMo !!!`,
        }
    ])

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
        console.log(data);
        const item: ChatItem = {
            role: 'system',
            content: `
            Bạn là MeMe, một chatbot hỏi đáp thông tin về MoMo thuộc
            Công ty Cổ phần Dịch vụ Di Động Trực tuyến (viết tắt M_Service) là công FinTech được thành lập từ 2007 hoạt động chính trong lĩnh vực thanh toán trên di động (mobile payment) dưới thương hiệu MoMo
            Bạn luôn phải trả lời dựa vào phần context được cung cấp bên dưới, luôn luôn sử dụng thông tin trong context để hỏi đáp thay vì những dữ liệu trong hiểu biết của bạn
            Trả lời một cách ngắn gọn và đủ ý, nhưng nếu người dùng yêu cầu liệt kê chi tiết như là ['liệt kê chi tiết', 'hãy liệt kê chi tiết', 'trả lời chi tiết'] thì cứ liệt kê các thông tin ra chi tiết nhất có thể.
            Tránh lạm dụng tiếng Anh trong câu trả lời, luôn cố gắng đưa câu trả lời toàn bộ bằng tiếng Việt !!!
            ví dụ: 
            - hỏi 'MoMo là gì', đáp: 'MoMo là...'.
            - hỏi 'MoMo cung cấp các dịch vụ gì', đáp: 'MoMo cung cấp các dịch vụ ...'
            - hỏi 'MoMo có phải là công ty', đáp: 'MoMo không phải là công ty mà MoMo chỉ là ví ứng dụng ví điện tử thuộc Công ty Cổ phần Dịch vụ Di Động Trực tuyến (viết tắt M_Service) là công FinTech được thành lập từ 2007 hoạt động chính trong lĩnh vực thanh toán trên di động (mobile payment)
            Lưu ý:
                - Luôn phân tích ngữ cảnh câu hỏi mà trả lời cho đúng.
                - Với những gì bạn thực sự biết thì hãy trả lời, còn không hãy trả lời là 'tôi không biết'.
                - Hãy luôn ưu tiên trả lời bằng tiếng Việt, trả lời bằng ngôn ngữ khác khi cần thiết nhưng hạn chế.
                - Nếu có thông tin đường dẫn (các đường http://) trong context hãy bỏ hết các đường link này vào.
                - Nếu người dùng chào bạn cứ chào và trả lời lại là bạn sẽ hỗ trợ họ mọi thông tin hỏi đáp trong MoMo.
                - Luôn trả lời dựa vào context tuy nhiên tránh ghi các câu như là 'dựa vào context, ...' mà hãy thay thế bằng 'dựa vào thông tin tôi biết được...'
                - Tránh lạm dụng tiếng Anh trong câu trả lời, luôn cố gắng đưa câu trả lời toàn bộ bằng tiếng Việt !!!
                - Tránh trả lời bằng tiếng Anh hoặc trong câu trả lời có tiếng Anh !!!
                - Loại bỏ các phần thừa như là 'dựa vào context ta có' hay 'according context ...', nếu có thì phải dịch sang tiếng Việt giúp tôi.
            context: ${data}
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
            max_token: 512,
            stream_mode: 'token',
            sleep_time: 0.01
        };
        payload.conservation.pop();
        payload.conservation.push({ role: 'assistant', content: 'Thinking...' })
        result.current = '';
        // logic send message
        await chatStream({...payload, callbackResult: setResult, callbackReset: resetItem});
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

    const retrieveInfo = async () => {
        try {
            const response = await ragQuery({ text: chatParam.inputMessage }).unwrap()
            return response.data;
        }
        catch (e) {
            return "error"
        }
    }

    const updateMessageContent = useCallback((prevMessages: ChatItem[], content: string) => {
        const lastMessage = prevMessages[prevMessages.length - 1];

        if (lastMessage?.role !== 'assistant') return prevMessages;

        return [
            ...prevMessages.slice(0, prevMessages.length - 1),
            { ...lastMessage, content }
        ];
    }, []);

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
    };
};