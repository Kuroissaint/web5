import React, { useCallback, useState } from "react";
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';

import { ChatService, IMAGE_URL } from "../../services/api"; 
import Navbar from "../../components/Navbar";
import SearchBar from "../../components/SearchBar";
import { Colors } from "../../constants/Colors";
import { Layout } from "../../constants/Layout";

const Chats = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInbox = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (!userString) return;
      const user = JSON.parse(userString);
      const response: any = await ChatService.getConversations(user.id);
      setConversations(response.data.data || []);
    } catch (error) {
      console.error("Gagal memuat inbox:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInbox();
    }, [])
  );

  const filteredConversations = conversations.filter((c: any) => 
    c.nama_lawan_bicara?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Navbar />
      
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Pesan 💬</Text>
          <TouchableOpacity style={styles.btnAction} onPress={() => router.push('/profile')}>
            <Ionicons name="settings-outline" size={14} color={Colors.primary} />
            <Text style={styles.btnActionText}>Profil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <SearchBar 
            value={searchQuery} 
            onChangeText={setSearchQuery} 
            placeholder="Cari percakapan..." 
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item: any) => item.id_percakapan.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.cardMessage}
              onPress={() => router.push({
                pathname: `/chat/${item.id_percakapan}`,
                params: { name: item.nama_lawan_bicara }
              })}
            >
              <View style={styles.avatarWrapper}>
                <Image 
                  style={styles.avatar} 
                  source={{ uri: item.avatar_url ? `${IMAGE_URL}${item.avatar_url}` : 'https://via.placeholder.com/100' }} 
                />
              </View>
              <View style={styles.content}>
                <Text style={styles.userName}>{item.nama_lawan_bicara}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>{item.pesan_terakhir}</Text>
              </View>
              <View style={styles.meta}>
                <Text style={styles.timeText}>
                  {item.waktu ? new Date(item.waktu).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                </Text>
                {item.unread_count > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unread_count}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  headerContainer: { 
    paddingHorizontal: 16, 
    paddingBottom: 16, 
    backgroundColor: Colors.white, 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20, 
    ...Layout.shadow,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: Colors.primary },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF0E6',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 4,
  },
  btnActionText: { color: Colors.primary, fontWeight: '700', fontSize: 10 },
  searchRow: { marginTop: 4 },
  listContainer: { padding: 16, paddingBottom: 100 },
  cardMessage: { flexDirection: 'row', backgroundColor: Colors.white, padding: 12, borderRadius: 15, marginBottom: 12, alignItems: 'center' },
  avatarWrapper: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', backgroundColor: '#eee' },
  avatar: { width: '100%', height: '100%' },
  content: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  lastMessage: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  meta: { alignItems: 'flex-end' },
  timeText: { fontSize: 10, color: Colors.textMuted, marginBottom: 4 },
  badge: { backgroundColor: Colors.primary, minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' }
});

export default Chats;