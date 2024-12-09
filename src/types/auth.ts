export type LoginInfo = {
    info: string
    password: string
}

export type LoginResponse = {
    user: {
        id: string;
        user_name: string;
        email: string;
        image: string;
        token: string;
        chat_ids: string[];
        prompt_ids: string[];
        default_prompt: string;
        role: {
            name: string;
            permission_ids: string[];
            created_at: string;
            is_deleted: boolean;
            id: string;
            updated_at: string;
        };
    };
};