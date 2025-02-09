import { getToken, getUserName, getUserId, addToken, checkAuth, clearToken, deCrypt } from "../helper";

type token = {
    userName: string;
    userId: number;
    userEmail: string;
    accessToken: string;
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