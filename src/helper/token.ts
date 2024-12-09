import { cryptItem, deCrypt, enCrypt, enCryptName, hash } from "helper/enCode";

type token = {
    userName: string;
    userId: string;
    userEmail: string;
    accessToken: string;
}

export const addToken = (infoToken: token) => {
    localStorage.setItem(enCryptName('userName'), enCrypt(infoToken.userName));
    localStorage.setItem(enCryptName('accessToken'), enCrypt(infoToken.accessToken));
    localStorage.setItem(enCryptName('userEmail'), enCrypt(infoToken.userEmail));

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