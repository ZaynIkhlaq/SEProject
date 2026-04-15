import { Message, MessageThread } from '../shared/types';
export declare class MessageService {
    static sendMessage(campaignId: string, senderId: string, receiverId: string, text: string): Promise<Message>;
    static getInbox(userId: string): Promise<MessageThread[]>;
    static getMessageThread(campaignId: string, userId: string, otherUserId: string): Promise<Message[]>;
    static getUnreadCount(userId: string): Promise<number>;
}
//# sourceMappingURL=message.service.d.ts.map