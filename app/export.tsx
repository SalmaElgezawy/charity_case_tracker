import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { useCases } from "@/lib/cases-context";
import { useColors } from "@/hooks/use-colors";
import * as FileSystem from "expo-file-system/legacy";

export default function ExportScreen() {
  const router = useRouter();
  const { currentVolunteer } = useAuth();
  const { exportToExcel } = useCases();
  const colors = useColors();

  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    if (!currentVolunteer) {
      Alert.alert("خطأ", "لم يتم العثور على بيانات المتطوع");
      return;
    }

    setIsLoading(true);
    try {
      const csvContent = await exportToExcel(currentVolunteer.id);

      const fileName = `cases_${currentVolunteer.username}_${new Date().toISOString().split("T")[0]}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, csvContent, {
        encoding: "utf8"
      });

      Alert.alert("نجاح", `تم حفظ الملف بنجاح: ${fileName}\n\nيمكنك الآن رفع الملف على Google Drive`);
    } catch (error: any) {
      console.error("Export error:", error);
      Alert.alert("خطأ", error?.message || "حدث خطأ أثناء تصدير البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="mb-8 flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
              <Text className="text-2xl" style={{ color: colors.primary }}>
                ←
              </Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold ml-4" style={{ color: colors.foreground }}>
              تصدير البيانات
            </Text>
          </View>

          {/* Info Card */}
          <View
            className="rounded-2xl p-6 mb-8"
            style={{
              backgroundColor: colors.surface,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary
            }}
          >
            <Text className="text-sm mb-2" style={{ color: colors.muted }}>
              📊 معلومات التصدير
            </Text>
            <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
              سيتم تصدير جميع الحالات المسجلة من قبلك
            </Text>
            <Text className="text-sm mt-4" style={{ color: colors.muted }}>
              الملف سيكون بصيغة CSV يمكن فتحه في Excel أو Google Sheets
            </Text>
          </View>

          {/* Features List */}
          <View className="mb-8">
            <Text className="text-lg font-bold mb-4" style={{ color: colors.foreground }}>
              المعلومات المصدرة:
            </Text>
            <View className="gap-3">
              {[
                "اسم رب الأسرة والرقم القومي",
                "رقم الهاتف والسن",
                "الحالة الاجتماعية وبيانات الزوج",
                "عدد أفراد الأسرة والحالة الصحية",
                "حالة التعليم والدخل الشهري",
                "احتياجات الأسرة وملاحظات الباحث",
                "تاريخ التسجيل"
              ].map((feature, index) => (
                <View key={index} className="flex-row items-center">
                  <Text className="text-lg mr-3">✓</Text>
                  <Text style={{ color: colors.foreground }}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Export Button */}
          <TouchableOpacity
            onPress={handleExport}
            disabled={isLoading}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
              marginTop: "auto",
              marginBottom: 16,
              opacity: isLoading ? 0.6 : 1
            }}
          >
            <Text className="text-lg font-bold" style={{ color: "#000" }}>
              {isLoading ? "جاري التصدير..." : "📥 تصدير البيانات"}
            </Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={isLoading}
            style={{
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
              opacity: isLoading ? 0.6 : 1
            }}
          >
            <Text className="font-semibold" style={{ color: colors.foreground }}>
              العودة
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
