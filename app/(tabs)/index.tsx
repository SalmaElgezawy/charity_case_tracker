import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { useCases } from "@/lib/cases-context";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const router = useRouter();
  const { currentVolunteer, logout } = useAuth();
  const { getCasesByVolunteer } = useCases();
  const colors = useColors();

  const volunteerCases = currentVolunteer ? getCasesByVolunteer(currentVolunteer.id) : [];

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    {
      title: "إضافة حالة جديدة",
      icon: "➕",
      onPress: () => router.push("/add-case"),
      color: colors.primary
    },
    {
      title: "عرض الحالات المسجلة",
      icon: "📋",
      onPress: () => router.push("/cases-list"),
      color: "#4CAF50"
    },
    {
      title: "تصدير البيانات",
      icon: "📊",
      onPress: () => router.push("/export"),
      color: "#2196F3"
    },
    {
      title: "تسجيل الخروج",
      icon: "🚪",
      onPress: handleLogout,
      color: "#f44336"
    }
  ];

  return (
    <ScreenContainer className="bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text
              className="text-3xl font-bold mb-2"
              style={{ color: colors.foreground }}
            >
              مرحباً
            </Text>
            <Text
              className="text-xl font-semibold"
              style={{ color: colors.primary }}
            >
              {currentVolunteer?.fullName}
            </Text>
            <Text
              className="text-sm mt-2"
              style={{ color: colors.muted }}
            >
              جمعية نبع الحياة الخيرية
            </Text>
          </View>

          {/* Stats Card */}
          <View
            className="rounded-2xl p-6 mb-8"
            style={{
              backgroundColor: colors.surface,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary
            }}
          >
            <Text
              className="text-sm"
              style={{ color: colors.muted }}
            >
              عدد الحالات المسجلة
            </Text>
            <Text
              className="text-4xl font-bold mt-2"
              style={{ color: colors.primary }}
            >
              {volunteerCases.length}
            </Text>
          </View>

          {/* Menu Items */}
          <View className="gap-4">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  borderLeftWidth: 4,
                  borderLeftColor: item.color
                }}
              >
                <Text className="text-3xl mr-4">{item.icon}</Text>
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold"
                    style={{ color: colors.foreground }}
                  >
                    {item.title}
                  </Text>
                </View>
                <Text
                  className="text-xl"
                  style={{ color: colors.muted }}
                >
                  ←
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <View className="mt-12 pt-8 border-t" style={{ borderTopColor: colors.border }}>
            <Text
              className="text-xs text-center"
              style={{ color: colors.muted }}
            >
              تطبيق تسجيل بيانات الحالات
            </Text>
            <Text
              className="text-xs text-center mt-1"
              style={{ color: colors.muted }}
            >
              نسخة 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
