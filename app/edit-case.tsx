import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { useCases } from "@/lib/cases-context";
import { useColors } from "@/hooks/use-colors";
import { Picker } from "@react-native-picker/picker";

export default function EditCaseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentVolunteer } = useAuth();
  const { getCaseById, updateCase } = useCases();
  const colors = useColors();

  const caseId = params.caseId as string;
  const caseData = getCaseById(caseId);

  const [formData, setFormData] = useState<any>({
    headName: "",
    headNationalId: "",
    headPhone: "",
    headAge: "",
    maritalStatus: "متزوج",
    spouseName: "",
    spouseNationalId: "",
    familyMembersCount: "",
    healthStatus: "",
    childrenEducation: "",
    monthlyIncome: "",
    familyNeeds: "",
    researcherNotes: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (caseData) {
      setFormData({
        headName: caseData.headName || "",
        headNationalId: caseData.headNationalId || "",
        headPhone: caseData.headPhone || "",
        headAge: caseData.headAge?.toString() || "",
        maritalStatus: caseData.maritalStatus || "متزوج",
        spouseName: caseData.spouseName || "",
        spouseNationalId: caseData.spouseNationalId || "",
        familyMembersCount: caseData.familyMembersCount?.toString() || "",
        healthStatus: caseData.healthStatus || "",
        childrenEducation: caseData.childrenEducation || "",
        monthlyIncome: caseData.monthlyIncome?.toString() || "",
        familyNeeds: caseData.familyNeeds || "",
        researcherNotes: caseData.researcherNotes || ""
      });
    }
  }, [caseData]);

  // استخدام useCallback لتجنب إعادة إنشاء الدوال
  const updateField = useCallback((field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const validateForm = (): boolean => {
    if (!formData.headName.trim()) {
      Alert.alert("خطأ", "يرجى إدخال اسم رب الأسرة");
      return false;
    }

    if (!formData.headNationalId.trim()) {
      Alert.alert("خطأ", "يرجى إدخال الرقم القومي");
      return false;
    }

    if (formData.headNationalId.length !== 14) {
      Alert.alert("خطأ", "الرقم القومي يجب أن يكون 14 رقم");
      return false;
    }

    if (formData.headPhone && formData.headPhone.length !== 11) {
      Alert.alert("خطأ", "رقم الهاتف يجب أن يكون 11 رقم");
      return false;
    }

    if (formData.maritalStatus === "متزوج") {
      if (!formData.spouseName.trim()) {
        Alert.alert("خطأ", "يرجى إدخال اسم الزوج/الزوجة");
        return false;
      }

      if (!formData.spouseNationalId.trim()) {
        Alert.alert("خطأ", "يرجى إدخال الرقم القومي للزوج/الزوجة");
        return false;
      }

      if (formData.spouseNationalId.length !== 14) {
        Alert.alert("خطأ", "الرقم القومي للزوج/الزوجة يجب أن يكون 14 رقم");
        return false;
      }
    }

    if (!formData.familyMembersCount.trim()) {
      Alert.alert("خطأ", "يرجى إدخال عدد أفراد الأسرة");
      return false;
    }

    const familyCount = parseInt(formData.familyMembersCount);
    if (isNaN(familyCount) || familyCount <= 0) {
      Alert.alert("خطأ", "عدد أفراد الأسرة يجب أن يكون رقم موجب");
      return false;
    }

    if (formData.monthlyIncome && isNaN(parseInt(formData.monthlyIncome))) {
      Alert.alert("خطأ", "الدخل الشهري يجب أن يكون رقم");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await updateCase(caseId, {
        headName: formData.headName,
        headNationalId: formData.headNationalId,
        headPhone: formData.headPhone || undefined,
        headAge: formData.headAge ? parseInt(formData.headAge) : undefined,
        maritalStatus: formData.maritalStatus,
        spouseName: formData.maritalStatus === "متزوج" ? formData.spouseName : undefined,
        spouseNationalId: formData.maritalStatus === "متزوج" ? formData.spouseNationalId : undefined,
        familyMembersCount: parseInt(formData.familyMembersCount),
        healthStatus: formData.healthStatus,
        childrenEducation: formData.childrenEducation,
        monthlyIncome: formData.monthlyIncome ? parseInt(formData.monthlyIncome) : undefined,
        familyNeeds: formData.familyNeeds,
        researcherNotes: formData.researcherNotes
      });

      Alert.alert("نجاح", "تم تحديث البيانات بنجاح");
      router.back();
    } catch (error) {
      Alert.alert("خطأ", "حدث خطأ أثناء تحديث البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = useMemo(() => ({
    label,
    value,
    field,
    placeholder,
    keyboardType = "default",
    multiline = false,
    editable = true
  }: {
    label: string;
    value: string;
    field: string;
    placeholder: string;
    keyboardType?: string;
    multiline?: boolean;
    editable?: boolean;
  }) => (
    <View className="mb-6">
      <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
        {label}
      </Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={(text) => updateField(field, text)}
        keyboardType={keyboardType as any}
        multiline={multiline}
        editable={editable && !isLoading}
        placeholderTextColor={colors.muted}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          fontSize: 16,
          color: colors.foreground,
          backgroundColor: colors.background,
          minHeight: multiline ? 100 : 48,
          textAlignVertical: multiline ? "top" : "center"
        }}
      />
    </View>
  ), [colors, isLoading, updateField]);

  if (!caseData) {
    return (
      <ScreenContainer className="bg-white">
        <View className="flex-1 justify-center items-center">
          <Text style={{ color: colors.muted }}>لم يتم العثور على الحالة</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* Header */}
          <View className="mb-8 flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
              <Text className="text-2xl" style={{ color: colors.primary }}>
                ←
              </Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold ml-4" style={{ color: colors.foreground }}>
              تعديل الحالة
            </Text>
          </View>

          {/* Section 1: رب الأسرة */}
          <View className="mb-8">
            <Text className="text-lg font-bold mb-4" style={{ color: colors.foreground }}>
              بيانات رب الأسرة
            </Text>
            <InputField
              label="الاسم بالكامل *"
              value={formData.headName}
              field="headName"
              placeholder="أدخل الاسم بالكامل"
            />
            <InputField
              label="الرقم القومي (14 رقم) *"
              value={formData.headNationalId}
              field="headNationalId"
              placeholder="أدخل الرقم القومي"
              keyboardType="numeric"
            />
            <InputField
              label="رقم الهاتف (11 رقم)"
              value={formData.headPhone}
              field="headPhone"
              placeholder="أدخل رقم الهاتف"
              keyboardType="numeric"
            />
            <InputField
              label="السن"
              value={formData.headAge}
              field="headAge"
              placeholder="أدخل السن"
              keyboardType="numeric"
            />
          </View>

          {/* Section 2: الحالة الاجتماعية */}
          <View className="mb-8">
            <Text className="text-lg font-bold mb-4" style={{ color: colors.foreground }}>
              الحالة الاجتماعية
            </Text>
            <View className="mb-6">
              <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
                الحالة الاجتماعية *
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  backgroundColor: colors.background,
                  overflow: "hidden"
                }}
              >
                <Picker
                  selectedValue={formData.maritalStatus}
                  onValueChange={(value: any) => updateField("maritalStatus", value)}
                  enabled={!isLoading}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="متزوج" value="متزوج" />
                  <Picker.Item label="مطلق" value="مطلق" />
                  <Picker.Item label="أرمل" value="أرمل" />
                </Picker>
              </View>
            </View>

            {formData.maritalStatus === "متزوج" && (
              <>
                <InputField
                  label="اسم الزوج/الزوجة *"
                  value={formData.spouseName}
                  field="spouseName"
                  placeholder="أدخل اسم الزوج/الزوجة"
                />
                <InputField
                  label="الرقم القومي للزوج/الزوجة (14 رقم) *"
                  value={formData.spouseNationalId}
                  field="spouseNationalId"
                  placeholder="أدخل الرقم القومي"
                  keyboardType="numeric"
                />
              </>
            )}
          </View>

          {/* Section 3: بيانات الأسرة */}
          <View className="mb-8">
            <Text className="text-lg font-bold mb-4" style={{ color: colors.foreground }}>
              بيانات الأسرة
            </Text>
            <InputField
              label="عدد أفراد الأسرة *"
              value={formData.familyMembersCount}
              field="familyMembersCount"
              placeholder="أدخل عدد الأفراد"
              keyboardType="numeric"
            />
            <InputField
              label="الحالة الصحية"
              value={formData.healthStatus}
              field="healthStatus"
              placeholder="وصف الحالة الصحية"
              multiline
            />
            <InputField
              label="حالة التعليم للأبناء"
              value={formData.childrenEducation}
              field="childrenEducation"
              placeholder="وصف مستويات التعليم"
              multiline
            />
          </View>

          {/* Section 4: الحالة الاقتصادية */}
          <View className="mb-8">
            <Text className="text-lg font-bold mb-4" style={{ color: colors.foreground }}>
              الحالة الاقتصادية
            </Text>
            <InputField
              label="الدخل الشهري"
              value={formData.monthlyIncome}
              field="monthlyIncome"
              placeholder="أدخل الدخل الشهري"
              keyboardType="numeric"
            />
            <InputField
              label="احتياجات الأسرة"
              value={formData.familyNeeds}
              field="familyNeeds"
              placeholder="وصف احتياجات الأسرة"
              multiline
            />
          </View>

          {/* Section 5: ملاحظات الباحث */}
          <View className="mb-8">
            <InputField
              label="رأي الباحث/المتطوع"
              value={formData.researcherNotes}
              field="researcherNotes"
              placeholder="أدخل ملاحظات عامة"
              multiline
            />
          </View>

          {/* Buttons */}
          <View className="flex-row gap-4 mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              disabled={isLoading}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
                opacity: isLoading ? 0.6 : 1
              }}
            >
              <Text className="font-semibold" style={{ color: colors.foreground }}>
                إلغاء
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: "center",
                opacity: isLoading ? 0.6 : 1
              }}
            >
              <Text className="font-semibold" style={{ color: "#000" }}>
                {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
