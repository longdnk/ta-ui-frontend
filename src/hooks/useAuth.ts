import { getToken, getUserName, getUserId, addToken, checkAuth, clearToken, deCrypt } from "../helper";

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

export const useAuth = () => {
    return {
        userName: deCrypt(getUserName()),
        token: getToken(),
        getUserId: getUserId(),
        addToken: (info: token) => addToken(info),
        clearToken: () => clearToken(),
        isAuthenticated: checkAuth(),
    }
}