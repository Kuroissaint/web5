import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chatStore } from './store/chatStore';

const ChatRoom = () => {
  const router = useRouter();
  const { userId, userName } = useLocalSearchParams();
  const [messages, setMessages] = useState(chatStore.getMessages(String(userId)));
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      await chatStore.loadData();
      const history = chatStore.getMessages(String(userId));
      setMessages(history);
    };
    loadInitialData();
  }, [userId]);
  
  const sendMessage = () => {
    if (!inputText.trim()) return;

    // Simpan ke Store
    chatStore.addMessage(String(userId), String(userName), inputText);

    // Update State lokal agar UI refresh
    setMessages([...chatStore.getMessages(String(userId))]);
    setInputText('');
    

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderItem = ({ item }: any) => {
    const isMe = item.senderId === 'me';
    return (
      <View style={[styles.messageWrapper, isMe ? styles.myWrapper : styles.otherWrapper]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={isMe ? styles.myText : styles.otherText}>{item.text}</Text>
          <Text style={[styles.timeText, isMe ? { color: '#eee' } : { color: '#999' }]}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#f3e0d2' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#3D2B24" />
        </TouchableOpacity>
        <Text style={styles.headerName}>{userName || "User"}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', elevation: 2, paddingTop: Platform.OS === 'ios' ? 50 : 15 },
  headerName: { fontSize: 16, fontWeight: 'bold', marginLeft: 10, color: '#3D2B24' },
  messageWrapper: { marginBottom: 12 },
  myWrapper: { alignItems: 'flex-end' },
  otherWrapper: { alignItems: 'flex-start' },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 15 },
  myBubble: { backgroundColor: '#9E7363', borderBottomRightRadius: 2 },
  otherBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 2 },
  myText: { color: '#fff', fontSize: 15 },
  otherText: { color: '#333', fontSize: 15 },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  inputBar: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#f1f1f1', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, maxHeight: 100 },
  sendBtn: { backgroundColor: '#9E7363', marginLeft: 8, borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
});