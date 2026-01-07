import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatService, IMAGE_URL } from "../../services/api"; //

const Chats = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInbox = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (!userString) return;
      const user = JSON.parse(userString);
      
      const response: any = await ChatService.getConversations(user.id); //
      
      // Ambil array data dari hasil response axios & backend
      const dataInbox = response.data.data || []; 
      setConversations(dataInbox);
    } catch (error) {
      console.error("Gagal memuat inbox:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.cardMessage, styles.titleFlexBox]}
      // Tambahkan params agar nama muncul di header chat detail
      onPress={() => router.push({
        pathname: `/chat/${item.id_percakapan}`,
        params: { name: item.nama_lawan_bicara }
      })}
    >
      <View style={[styles.avatar, styles.avatarLayout]}>
        <Image 
          style={[styles.avatarIcon, styles.viewLayout]} 
          // Gabungkan dengan IMAGE_URL agar gambar muncul
          source={{ 
            uri: item.avatar_url 
              ? `${IMAGE_URL}${item.avatar_url}` 
              : 'https://via.placeholder.com/100' 
          }} 
          resizeMode="cover" 
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.davidWayne}>{item.nama_lawan_bicara || "User"}</Text>
        <Text style={[styles.thanksABunch, styles.hoorayTypo]} numberOfLines={1}>
          {item.pesan_terakhir || "Belum ada pesan"}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.timeText}>
          {item.waktu ? new Date(item.waktu).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "10:00"}
        </Text>
        {item.unread_count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.text2}>{item.unread_count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.viewBg}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#f6c590" />
        </View>
      ) : conversations.length === 0 ? (
        // Tampilan jika tidak ada chat sama sekali
        <View style={styles.emptyContainer}>
          <Text style={{ color: '#9a9bb1' }}>Belum ada percakapan</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item: any) => item.id_percakapan.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  viewBg: { flex: 1, backgroundColor: "#fffff0" },
  header: { padding: 24, paddingTop: 10, backgroundColor: "#f6c590", borderBottomRightRadius: 30 },
  headerTitle: { fontSize: 32, fontWeight: "600", color: "#0c1421" },
  listContainer: { padding: 24 },
  cardMessage: { flexDirection: "row", marginBottom: 24, alignItems: 'center' },
  avatar: { overflow: "hidden", backgroundColor: '#eee' },
  avatarLayout: { width: 50, height: 50, borderRadius: 25 },
  avatarIcon: { width: "100%", height: "100%" },
  content: { flex: 1, marginLeft: 16 },
  davidWayne: { fontSize: 16, fontWeight: "700", color: "#2c2d3a" },
  thanksABunch: { textAlign: "left", marginTop: 4 },
  hoorayTypo: { color: "#9a9bb1", fontSize: 13 },
  timeText: { fontSize: 11, color: "#686a8a", marginBottom: 5 },
  badge: { backgroundColor: "#9e7363", minWidth: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  text2: { color: "#fff", fontSize: 10, fontWeight: "700" },
  viewLayout: { width: "100%" },
  titleFlexBox: { flexDirection: "row" },
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default Chats;