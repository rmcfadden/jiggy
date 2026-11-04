import { greet } from '@jiggy/shared';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import './global.css';

export default function App() {
  const { message } = greet('mobile');

  return (
    <View className="flex-1 items-center justify-center bg-slate-900">
      <Text className="text-4xl font-bold text-white">{message}</Text>
      <StatusBar style="light" />
    </View>
  );
}
