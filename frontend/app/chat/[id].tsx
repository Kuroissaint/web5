import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import { ChatService, IMAGE_URL } from '../../services/api';

// Sesuaikan dengan IP Laptop Anda
const socket = io('http://192.168.1.3:3000');

const ChatDetail = () => {
  const { id, name } = useLocalSearchParams(); // 'id' adalah id_percakapan
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setupChat();

    // Listener untuk pesan masuk real-time
    socket.on('receive_message', (newMessage) => {
      // Hanya tambahkan jika pesan milik percakapan ini
      if (newMessage.id_percakapan == id) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [id]);

  const setupChat = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setMyId(user.id);

        // 1. Ambil riwayat pesan dari database
        const response = await ChatService.getMessages(id as string);
        setMessages(response.data);

        // 2. Tandai pesan sebagai dibaca (Mark as Read)
        await ChatService.markAsRead(id as string);

        // 3. Bergabung ke room socket berdasarkan id_percakapan
        socket.emit('join_chat', id);
      }
    } catch (error) {
      console.error('Gagal memuat chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '' || !myId) return;

    const messageData = {
      id_percakapan: id,
      pengirim_id: myId,
      pesan: inputText,
      waktu: new Date().toISOString(),
      is_read: 0
    };

    try {
      // 1. Kirim via Socket agar lawan bicara langsung menerima
      socket.emit('send_message', messageData);

      // 2. Simpan ke database via API
      await ChatService.saveMessage(messageData);

      setInputText('');
    } catch (error) {
      console.error('Gagal mengirim pesan:', error);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isMine = item.pengirim_id === myId;
    return (
      <View style={[styles.messageWrapper, isMine ? styles.myWrapper : styles.theirWrapper]}>
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.messageText, isMine ? styles.myText : styles.theirText]}>
            {item.pesan}
          </Text>
          <Text style={styles.timeText}>
            {new Date(item.waktu).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9e7363" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header Custom */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#313957" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name || 'Percakapan'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatDetail;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    height: 60,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginTop: 40,
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#313957' },
  listContent: { padding: 15, paddingBottom: 20 },
  messageWrapper: { marginBottom: 10, maxWidth: '80%' },
  myWrapper: { alignSelf: 'flex-end' },
  theirWrapper: { alignSelf: 'flex-start' },
  bubble: { padding: 12, borderRadius: 18 },
  myBubble: { backgroundColor: '#9e7363', borderBottomRightRadius: 2 },
  theirBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: '#EEE' },
  messageText: { fontSize: 14 },
  myText: { color: '#FFF' },
  theirText: { color: '#313957' },
  timeText: { fontSize: 10, color: '#AAA', alignSelf: 'flex-end', marginTop: 4 },
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F3F4',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#9e7363',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});