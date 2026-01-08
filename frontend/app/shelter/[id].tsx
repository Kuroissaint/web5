import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { shelterAPI, BASE_URL } from '../../services/api';
import { Colors } from '../../constants/Colors';

const ShelterProfile = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [shelter, setShelter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await shelterAPI.getShelterDetail(id as string);
        setShelter(res.data.data);
      } catch (err) {
        console.error("Gagal ambil detail shelter:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <ActivityIndicator size="large" color={Colors.primary} style={{flex:1}} />;

  return (
    <ScrollView style={styles.container}>
      {/* Header Image */}
      <View style={styles.header}>
        <Image 
          source={{ uri: shelter?.foto_profil ? `${BASE_URL}${shelter.foto_profil}` : 'https://via.placeholder.com/150' }} 
          style={styles.coverImage} 
        />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{shelter?.username}</Text>
        
        {/* STATS SECTION (YANG BIKIN USER TERTARIK) */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="checkmark-circle" size={28} color="#2ecc71" />
            <Text style={styles.statNumber}>{shelter?.stats?.rescue_count || 0}</Text>
            <Text style={styles.statLabel}>Diselamatkan</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#EEE' }]}>
            <Ionicons name="heart" size={28} color="#e74c3c" />
            <Text style={styles.statNumber}>{shelter?.stats?.adopt_count || 0}</Text>
            <Text style={styles.statLabel}>Berhasil Diadopsi</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="star" size={28} color="#f1c40f" />
            <Text style={styles.statNumber}>Verified</Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tentang Shelter</Text>
        <Text style={styles.description}>
          {shelter?.deskripsi_shelter || "Shelter ini belum memberikan deskripsi profil."}
        </Text>

        {/* TOMBOL AKSI */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.btnChat} 
            onPress={() => router.push({ pathname: `/chat/${shelter.id}`, params: { name: shelter.username } })}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.primary} />
            <Text style={styles.btnChatText}>Tanya Shelter</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnDonate} 
            onPress={() => router.push(`/donate/${id}`)}
          >
            <Text style={styles.btnDonateText}>Donasi Sekarang</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { height: 250, position: 'relative' },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 20 },
  content: { padding: 20, marginTop: -30, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  statsContainer: { flexDirection: 'row', backgroundColor: '#F9F9F9', borderRadius: 20, padding: 15, marginBottom: 25, elevation: 2 },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 16, fontWeight: 'bold', marginVertical: 4 },
  statLabel: { fontSize: 10, color: '#888' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  description: { lineHeight: 22, color: '#666', marginBottom: 100 },
  footer: { flexDirection: 'row', position: 'absolute', bottom: 30, left: 20, right: 20, gap: 10 },
  btnChat: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.primary, borderRadius: 15, padding: 15 },
  btnChatText: { color: Colors.primary, fontWeight: 'bold', marginLeft: 8 },
  btnDonate: { flex: 2, backgroundColor: Colors.primary, borderRadius: 15, padding: 15, alignItems: 'center', justifyContent: 'center' },
  btnDonateText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default ShelterProfile;