import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const colors = useColors();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('خطأ', 'اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-white" className="">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center items-center px-6 py-8">
          {/* Logo */}
          <View className="mb-8">
            <Image
              source={require('@/assets/images/icon.png')}
              style={{ width: 120, height: 120 }}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text className="text-3xl font-bold text-center mb-2" style={{ color: colors.foreground }}>
            نبع الحياة
          </Text>
          <Text className="text-base text-center mb-8" style={{ color: colors.muted }}>
            جمعية نبع الحياة الخيرية
          </Text>

          {/* Form */}
          <View className="w-full max-w-sm">
            {/* Username Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
                اسم المستخدم
              </Text>
              <TextInput
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChangeText={setUsername}
                editable={!isLoading}
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.foreground,
                  backgroundColor: colors.background
                }}
              />
            </View>

            {/* Password Input */}
            <View className="mb-8">
              <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
                كلمة المرور
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  backgroundColor: colors.background
                }}
              >
                <TextInput
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  placeholderTextColor={colors.muted}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: colors.foreground
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
                    {showPassword ? 'إخفاء' : 'عرض'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: 'center',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              <Text className="text-base font-bold" style={{ color: '#000' }}>
                {isLoading ? 'جاري التحميل...' : 'دخول'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo Credentials */}
          <View className="mt-12 w-full max-w-sm">
            <Text className="text-xs text-center mb-3" style={{ color: colors.muted }}>
              بيانات تجريبية للاختبار:
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 8,
                padding: 12,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary
              }}
            >
              <Text className="text-xs mb-1" style={{ color: colors.foreground }}>
                <Text className="font-semibold">المستخدم 1:</Text> ahmed / 123456
              </Text>
              <Text className="text-xs" style={{ color: colors.foreground }}>
                <Text className="font-semibold">المستخدم 2:</Text> fatima / 123456
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
