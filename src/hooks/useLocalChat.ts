import { useState, useEffect, useCallback, useMemo } from "react";
import { ChatItem } from "../types";
import { useAuth } from "./useAuth";

export const useLocalChat = () => {
    const { userName } = useAuth();

    const defaultItemChat: ChatItem[] = useMemo(() => [{
        role: 'assistant',
        content: `Chào **${userName.toUpperCase()}**, tôi tên là **MeMe** trợ lý của bạn, tôi có thể hỏi đáp các thắc mắc về dịch vụ tài chính, tiền tệ hoặc ví trả trước trả sau và các vấn đề liên quan tới MoMo !!!`,
    }], [userName]);

    const [localChat, setLocalChat] = useState<ChatItem[]>(() => {
        const stored = localStorage.getItem("local_chat");
        return stored ? JSON.parse(stored) : [];
    });

    const updateLocalChat = useCallback((messages: ChatItem[]) => {
        localStorage.setItem("local_chat", JSON.stringify(messages));
        setLocalChat(messages);
    }, []);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "local_chat") {
                setLocalChat(e.newValue ? JSON.parse(e.newValue) : []);
            }
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    return {
        localChat,
        defaultItemChat,
        updateLocalChat,
    };
};