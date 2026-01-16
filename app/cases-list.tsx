import { ScrollView, Text, View, TouchableOpacity, Alert, FlatList, TextInput } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { useCases, type CaseData } from "@/lib/cases-context";
import { useColors } from "@/hooks/use-colors";

export default function CasesListScreen() {
  const router = useRouter();
  const { currentVolunteer } = useAuth();
  const { getCasesByVolunteer, deleteCase } = useCases();
  const colors = useColors();

  const [cases, setCases] = useState<CaseData[]>([]);
  const [searchText, setSearchText] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (currentVolunteer) {
        const volunteerCases = getCasesByVolunteer(currentVolunteer.id);
        setCases(volunteerCases);
      }
    }, [currentVolunteer, getCasesByVolunteer])
  );

  const filteredCases = cases.filter(
    (c) =>
      c.headName.includes(searchText) ||
      c.headNationalId.includes(searchText)
  );

  const handleDelete = (caseId: string) => {
    Alert.alert(
      "تأكيد الحذف",
      "هل أنت متأكد من حذف هذه الحالة؟",
      [
        { text: "إلغاء", onPress: () => {} },
        {
          text: "حذف",
          onPress: async () => {
            await deleteCase(caseId);
            if (currentVolunteer) {
              const updated = getCasesByVolunteer(currentVolunteer.id);
              setCases(updated);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const renderCaseItem = ({ item }: { item: CaseData }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/edit-case",
          params: { caseId: item.id }
        })
      }
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary
      }}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text
            className="text-base font-semibold mb-1"
            style={{ color: colors.foreground }}
          >
            {item.headName}
          </Text>
          <Text
            className="text-sm"
            style={{ color: colors.muted }}
          >
            الرقم القومي: {item.headNationalId}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={{ padding: 8 }}
        >
          <Text className="text-lg">🗑️</Text>
        </TouchableOpacity>
      </View>
      <Text
        className="text-xs"
        style={{ color: colors.muted }}
      >
        {new Date(item.createdAt).toLocaleDateString("ar-EG")}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-6 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-2xl" style={{ color: colors.primary }}>
              ←
            </Text>
          </TouchableOpacity>
          <Text
            className="text-2xl font-bold"
            style={{ color: colors.foreground }}
          >
            الحالات المسجلة
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-6">
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              backgroundColor: colors.background
            }}
          >
            <Text className="text-sm mb-1" style={{ color: colors.muted }}>
              🔍 بحث
            </Text>
            <TextInput
              placeholder="ابحث بالاسم أو الرقم القومي"
              value={searchText}
              onChangeText={setSearchText}
              style={{
                fontSize: 16,
                color: colors.foreground,
                paddingVertical: 8,
                paddingHorizontal: 0
              }}
            />
          </View>
        </View>

        {/* Cases List */}
        <View className="flex-1 px-6">
          {filteredCases.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text
                className="text-lg text-center"
                style={{ color: colors.muted }}
              >
                لا توجد حالات مسجلة
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredCases}
              renderItem={renderCaseItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>

        {/* Stats */}
        <View
          className="px-6 py-4 border-t"
          style={{ borderTopColor: colors.border }}
        >
          <Text
            className="text-sm text-center"
            style={{ color: colors.muted }}
          >
            إجمالي الحالات: {filteredCases.length}
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
