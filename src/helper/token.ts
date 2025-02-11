import { cryptItem, deCrypt, enCrypt, enCryptName, hash } from "helper/enCode";
import { ChatItem } from "../types";

type token = {
    userName: string;
    userId: number;
    userEmail: string;
    accessToken: string;
    prompt: any[];
    models: any[];
    default_prompt: object;
    default_model: object;
    local_chat?: any[];
}

export const addToken = (infoToken: token) => {

    const defaultItemChat: ChatItem [] = [{
        role: 'assistant',
        content: `Chào **${infoToken.userName.toUpperCase()}**, tôi tên là **MeMe** trợ lý của bạn, tôi có thể hỏi đáp các thắc mắc về dịch vụ tài chính, tiền tệ hoặc ví trả trước trả sau và các vấn đề liên quan tới MoMo !!!`,
    }]

    localStorage.setItem(enCryptName('userName'), enCrypt(infoToken.userName))
    localStorage.setItem(enCryptName('accessToken'), enCrypt(infoToken.accessToken))
    localStorage.setItem(enCryptName('userEmail'), enCrypt(infoToken.userEmail))
    localStorage.setItem('userId', infoToken.userId.toString())
    localStorage.setItem('prompts', JSON.stringify(infoToken.prompt));
    localStorage.setItem('default_prompt', JSON.stringify(infoToken.default_prompt));
    localStorage.setItem('models', JSON.stringify(infoToken.models));
    localStorage.setItem('default_model', JSON.stringify(infoToken.default_model));
    localStorage.setItem('local_chat', JSON.stringify(defaultItemChat));

    const userIndex = hash(infoToken.userId.toString());
    const userIdentify = cryptItem(infoToken.userId.toString());
    const userId = userIndex + userIdentify;
    localStorage.setItem(enCryptName('userId'), userId.toString());

    type ObjectRouter = {
        [key: string]: string;
    }

    let appRouter: ObjectRouter = {};

    localStorage.setItem(enCryptName('permissions'), enCrypt(JSON.stringify(appRouter)));
}

export const clearToken = () => {
    localStorage.removeItem(enCryptName('accessToken'))
    localStorage.removeItem(enCryptName('userId'));
    localStorage.removeItem(enCryptName('userName'));
    localStorage.removeItem(enCryptName('userEmail'));
    localStorage.removeItem(enCryptName('permissions'));
    localStorage.removeItem('default_model');
    localStorage.removeItem('default_prompt');
    localStorage.removeItem('prompts');
    localStorage.removeItem('models');
    localStorage.removeItem('local_chat');
    window.location.reload();
}

export const getToken = () => {
    return localStorage.getItem(enCryptName('accessToken'));
}

export const getUserId = () => {
    return localStorage.getItem(enCryptName('userId'));
}

export const getUserName = () => {
    return localStorage.getItem(enCryptName('userName'));
}

export const getRawPermission = () => {
    return localStorage.getItem(enCryptName('permissions'));
}


export const getRouterToken = () => {
    const item = localStorage.getItem(enCryptName('permissions'));
    if (item) {
        const unHashed = deCrypt(item);
        return JSON.parse(unHashed);
    }
    return;
}

export const applyToken = () => {
    let config = {
        headers: {
            'Content-type': 'application/json',
            Accept: 'application/json',
            Authorization: '',
        }
    };
    const item = getToken();

    if (item !== null) {
        config = {
            ...config,
            headers: {
                ...config.headers,
                Authorization: `Bearer ${deCrypt(item)}`,
            }
        }
    }

    return config;
}