// app/store/chatStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Message = { id: string; text: string; senderId: string; time: string; };
export type ChatItem = { id: string; name: string; lastMsg: string; time: string; unread: number; };

class ChatStore {
  chats: ChatItem[] = [];
  messages: Record<string, Message[]> = {};

  constructor() {
    this.loadData(); // Load data otomatis saat aplikasi dibuka
  }

  // SIMPAN KE HP
  async saveData() {
    try {
      const data = JSON.stringify({ chats: this.chats, messages: this.messages });
      await AsyncStorage.setItem('@chat_data', data);
    } catch (e) {
      console.error("Gagal simpan ke storage", e);
    }
  }

  // AMBIL DARI HP
  async loadData() {
    try {
      const jsonValue = await AsyncStorage.getItem('@chat_data');
      if (jsonValue != null) {
        const parsed = JSON.parse(jsonValue);
        this.chats = parsed.chats || [];
        this.messages = parsed.messages || {};
      }
    } catch (e) {
      console.error("Gagal ambil dari storage", e);
    }
  }

  addMessage(userId: string, userName: string, text: string) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = { id: Date.now().toString(), text, senderId: 'me', time };

    if (!this.messages[userId]) this.messages[userId] = [];
    this.messages[userId].push(newMessage);

    const chatIndex = this.chats.findIndex((c) => c.id === userId);
    if (chatIndex !== -1) {
      const updatedChat = { ...this.chats[chatIndex], lastMsg: text, time };
      this.chats.splice(chatIndex, 1);
      this.chats.unshift(updatedChat);
    } else {
      this.chats.unshift({ id: userId, name: userName, lastMsg: text, time, unread: 0 });
    }

    this.saveData(); // Simpan setiap kali ada pesan baru
    return newMessage;
  }

  getMessages(userId: string) {
    return this.messages[userId] || [];
  }
}

export const chatStore = new ChatStore();

export default function Void() { return null; }