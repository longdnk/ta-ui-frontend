import { getToken, getUserName, getUserId, addToken, enCryptName, checkAuth } from "../helper";

type token = {
    userName: string;
    userId: string;
    userEmail: string;
    accessToken: string;
}

const useAuth = () => {
    return {
        userName: getUserName(),
        token: getToken(),
        getUserId: getUserId(),
        addToken: (info: token) => addToken(info),
        isAuthenticated: checkAuth(),
    }
}

export default useAuth;