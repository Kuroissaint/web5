// app/(tabs)/index.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import RescuePage from "../RescuePage"; // naik satu level ke app/

export default function Index() {
  return (
    <View style={styles.container}>
      <RescuePage />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
