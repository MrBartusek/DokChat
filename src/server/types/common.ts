export interface InternalChatParticipant {
    id: string,
    userId: string,
    username: string,
    tag: string,
    avatar: string,
    lastRead: string | null,
    isHidden: boolean
}
