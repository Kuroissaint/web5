import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { IMAGE_URL } from '../services/api';

const { width } = Dimensions.get('window');
const cardWidth = (width - 50) / 2; // Hitung lebar kartu biar pas 2 kolom

interface SearchCardProps {
  item: any;
  onPress: () => void;
}

const SearchCard = ({ item, onPress }: SearchCardProps) => {
  const getTags = () => {
    if (!item.tags) return [];
    if (Array.isArray(item.tags)) return item.tags;
    if (typeof item.tags === 'string') {
      if (item.tags.startsWith('[')) {
        try { return JSON.parse(item.tags); } catch (e) { return []; }
      }
      return item.tags.split(',').map(t => t.trim());
    }
    return [];
  };

  const tags = getTags();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Gambar Kucing Gede di Atas */}
      <View style={styles.imageWrapper}>
        <Image 
          source={item.foto ? { uri: `${IMAGE_URL}${item.foto}` } : require('../assets/logo.png')} 
          style={styles.image}
          resizeMode="cover"
        />
        {/* Badge Ras Melayang di Gambar */}
        <View style={styles.rasBadge}>
          <Text style={styles.rasText}>{item.ras || 'Kampung'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{item.nama_kucing || "Anabul"}</Text>
        
        <View style={styles.locationRow}>
          <Ionicons name="location" size={10} color={Colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.lokasi_detail || 'Lokasi...'}
          </Text>
        </View>

        {/* Tags dibatasi cuma 2 biar gak berantakan */}
        <View style={styles.tagsRow}>
          {tags.slice(0, 2).map((tag: string, index: number) => (
            <View key={index} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 15,
    overflow: 'hidden', // Biar gambar ikut melengkung di atas
    ...Layout.shadow,
  },
  imageWrapper: {
    width: '100%',
    height: 140, // Foto jadi jauh lebih gede sekarang!
    backgroundColor: '#F0F0F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  rasBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(158, 115, 99, 0.9)', // Warna primary transparan
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rasText: { fontSize: 9, color: Colors.white, fontWeight: '700' },
  content: {
    padding: 12,
  },
  name: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: Colors.textPrimary,
    marginBottom: 4 
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 3, 
    marginBottom: 8 
  },
  locationText: { fontSize: 10, color: Colors.textMuted },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tagChip: { 
    backgroundColor: Colors.inputBg, 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: Colors.border
  },
  tagText: { fontSize: 8, color: Colors.textSecondary, fontWeight: '600' },
});

export default SearchCard;