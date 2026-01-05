import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { BASE_URL } from '../services/api'; // Gunakan BASE_URL saja

const { width } = Dimensions.get('window');
const cardWidth = (width - 45) / 2; 

interface SearchCardProps {
  item: any;
  onPress: () => void;
}

const SearchCard = ({ item, onPress }: SearchCardProps) => {
  // Logic untuk parsing tags (tetap sama)
  const tags = Array.isArray(item.tags) ? item.tags : (item.tags?.split(',') || []);

  // PERBAIKAN GAMBAR: Backend biasanya mengirim '/uploads/namafile.jpg'
  // Jadi kita gabungkan langsung dengan BASE_URL (http://ip:3000)
  const imageUrl = item.foto ? `${BASE_URL}${item.foto}` : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageWrapper}>
        <Image 
          source={imageUrl ? { uri: imageUrl } : require('../assets/logo.png')} 
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.rasBadge}>
          <Text style={styles.rasText}>{item.jenis_kucing || 'Kampung'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{item.nama_kucing || "Anabul"}</Text>
        
        <View style={styles.locationRow}>
          <Ionicons name="location" size={12} color={Colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {/* PERBAIKAN: Gunakan lokasi_display (sesuai Backend) */}
            {item.lokasi_display || 'Lokasi tidak diketahui'}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.tagsRow}>
            {tags.slice(0, 1).map((tag: string, index: number) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag.trim()}</Text>
              </View>
            ))}
          </View>
          
          {/* TOMBOL DETAIL: Biar user tahu bisa diklik */}
          <View style={styles.btnDetail}>
             <Text style={styles.btnDetailText}>Detail</Text>
             <Ionicons name="arrow-forward" size={10} color={Colors.white} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: Colors.white,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    ...Layout.shadow,
  },
  imageWrapper: { width: '100%', height: 120, backgroundColor: '#f5f5f5' },
  image: { width: '100%', height: '100%' },
  rasBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  rasText: { fontSize: 8, color: '#fff', fontWeight: 'bold' },
  content: { padding: 10 },
  name: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 8 },
  locationText: { fontSize: 10, color: '#777', flex: 1 },
  footerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 5 
  },
  tagsRow: { flexDirection: 'row', gap: 4 },
  tagChip: { backgroundColor: '#f0f0f0', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 8, color: '#666' },
  btnDetail: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.primary, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6,
    gap: 2
  },
  btnDetailText: { color: '#fff', fontSize: 9, fontWeight: 'bold' }
});

export default SearchCard;