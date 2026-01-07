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
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import { ChatService, getUserData } from '../../services/api';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const socket = io('http://192.168.1.3:3000'); // Sesuaikan IP Laptop

const ChatDetail = () => {
  const { id, name } = useLocalSearchParams(); 
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<number | null>(null);
  
  // State untuk melacak ID Ruangan (Percakapan) yang asli
  const [idPercakapan, setIdPercakapan] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setupChat();

    socket.on('receive_message', (newMessage) => {
      // Terima pesan jika ID Ruangannya cocok
      if (newMessage.id_percakapan == idPercakapan || newMessage.id_percakapan == id) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => { socket.off('receive_message'); };
  }, [id, idPercakapan]);

  const setupChat = async () => {
    try {
      const user = await getUserData();
      if (user) {
        setMyId(user.id);
        
        // Coba ambil pesan (id bisa berupa ID Percakapan atau ID User Lawan)
        const response: any = await ChatService.getMessages(id as string);
        
        if (response.data.success) {
          setMessages(response.data.data || []);
          setIdPercakapan(id as string);
          socket.emit('join_chat', id);
        }
      }
    } catch (error: any) {
      // Jika gagal, berarti ini chat baru (id adalah ID User lawan)
      console.log('Chat baru dengan User ID:', id);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '' || !myId) return;

    const messageData = {
      id_percakapan: idPercakapan, // null jika chat pertama
      pengirim_id: myId,
      penerima_id: id,            // ID lawan bicara
      pesan: inputText,
      waktu: new Date().toISOString()
    };

    try {
      // Simpan ke DB (Backend akan otomatis create percakapan jika belum ada)
      const res = await ChatService.saveMessage(messageData);

      if (res.data.success) {
        const newIdPercakapan = res.data.id_percakapan || idPercakapan;

        // Jika baru dibuat, join socket room-nya
        if (!idPercakapan) {
          setIdPercakapan(newIdPercakapan);
          socket.emit('join_chat', newIdPercakapan);
        }

        // Kirim via Socket
        socket.emit('send_message', {
          ...messageData,
          id_percakapan: newIdPercakapan
        });

        // Update UI Lokal
        setMessages((prev) => [...prev, { ...messageData, pengirim_id: myId }]);
        setInputText('');
      }
    } catch (error) {
      console.error('Gagal kirim pesan:', error);
      Alert.alert("Gagal", "Pesan tidak terkirim. Pastikan backend sudah diupdate.");
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
            {new Date(item.waktu || item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
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
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={[styles.inputArea, { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }]}>
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
    </SafeAreaView>
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