import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screen/ProfileScreen';
import AktivitasSaya from '../screen/AktivitasSaya';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      {/* Halaman utama Profil */}
      <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Profil' }} />
      {/* Halaman Aktivitas (dua tab) */}
      <Stack.Screen name="AktivitasSaya" component={AktivitasSaya} options={{ title: 'Aktivitas Saya' }} />
    </Stack.Navigator>
  );
}