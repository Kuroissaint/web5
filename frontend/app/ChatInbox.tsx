import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chatStore } from './store/chatStore';

type ChatItem = {
  id: string;
  name: string;
  lastMsg: string;
  time: string;
  unread: number;
};

const ChatInbox = () => {
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 REFRESH SETIAP HALAMAN DIFOKUSKAN
  useFocusEffect(
    React.useCallback(() => {
      const refresh = async () => {
        await chatStore.loadData(); // Tunggu data dibaca dari HP
        setChats([...chatStore.chats]);
        setLoading(false);
      };
      refresh();
    }, [])
  );

  const renderItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() =>
        router.push({
          pathname: '/ChatRoom',
          params: {
            userId: item.id,
            userName: item.name,
          },
        })
      }
    >
      <Ionicons name="person-circle" size={50} color="#9E7363" />

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <View style={styles.chatFooter}>
          <Text style={styles.lastMsg} numberOfLines={1}>
            {item.lastMsg}
          </Text>

          {item.unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER DENGAN TOMBOL KEMBALI */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#9E7363" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Pesan</Text>
        
        {/* Spacer View agar teks tetap di tengah */}
        <View style={{ width: 40 }} /> 
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#9E7363" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Belum ada pesan.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ChatInbox;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f3e0d2' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff', // Bisa diganti ke #fdf8f5 jika ingin sedikit krem
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D2B24',
  },
  listContent: {
    paddingBottom: 20,
  },
  chatCard: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 1, // Memberi efek garis pemisah tipis
  },
  chatInfo: { 
    flex: 1, 
    marginLeft: 10 
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#3D2B24' 
  },
  time: { 
    fontSize: 12, 
    color: '#999' 
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMsg: { 
    fontSize: 14, 
    color: '#666', 
    flex: 1,
    marginRight: 10 
  },
  badge: {
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 100,
    color: '#9E7363',
    fontWeight: '500',
  },
});