import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CaseData {
  id: string;
  volunteerId: string;
  createdAt: string;
  updatedAt: string;
  
  // رب الأسرة
  headName: string;
  headNationalId: string;
  headPhone?: string;
  headAge?: number;
  
  // الحالة الاجتماعية
  maritalStatus: 'متزوج' | 'مطلق' | 'أرمل';
  spouseName?: string;
  spouseNationalId?: string;
  
  // بيانات الأسرة
  familyMembersCount: number;
  healthStatus: string;
  childrenEducation: string;
  
  // الحالة الاقتصادية
  monthlyIncome?: number;
  familyNeeds: string;
  
  // ملاحظات الباحث
  researcherNotes: string;
}

export interface CasesContextType {
  cases: CaseData[];
  addCase: (caseData: Omit<CaseData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCase: (id: string, caseData: Partial<CaseData>) => Promise<boolean>;
  deleteCase: (id: string) => Promise<boolean>;
  getCasesByVolunteer: (volunteerId: string) => CaseData[];
  getCaseById: (id: string) => CaseData | undefined;
  exportToExcel: (volunteerId: string) => Promise<string>;
}

const CasesContext = createContext<CasesContextType | undefined>(undefined);

export function CasesProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<CaseData[]>([]);

  // Load cases from storage
  useEffect(() => {
    const loadCases = async () => {
      try {
        const savedCases = await AsyncStorage.getItem('cases');
        if (savedCases) {
          setCases(JSON.parse(savedCases));
        }
      } catch (error) {
        console.error('Error loading cases:', error);
      }
    };

    loadCases();
  }, []);

  const saveCases = async (newCases: CaseData[]) => {
    try {
      setCases(newCases);
      await AsyncStorage.setItem('cases', JSON.stringify(newCases));
    } catch (error) {
      console.error('Error saving cases:', error);
    }
  };

  const addCase = async (caseData: Omit<CaseData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const newCase: CaseData = {
        ...caseData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedCases = [...cases, newCase];
      await saveCases(updatedCases);
      return newCase.id;
    } catch (error) {
      console.error('Error adding case:', error);
      throw error;
    }
  };

  const updateCase = async (id: string, caseData: Partial<CaseData>): Promise<boolean> => {
    try {
      const updatedCases = cases.map(c =>
        c.id === id
          ? { ...c, ...caseData, updatedAt: new Date().toISOString() }
          : c
      );

      if (updatedCases.length === cases.length) {
        await saveCases(updatedCases);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating case:', error);
      return false;
    }
  };

  const deleteCase = async (id: string): Promise<boolean> => {
    try {
      const updatedCases = cases.filter(c => c.id !== id);
      await saveCases(updatedCases);
      return true;
    } catch (error) {
      console.error('Error deleting case:', error);
      return false;
    }
  };

  const getCasesByVolunteer = (volunteerId: string): CaseData[] => {
    return cases.filter(c => c.volunteerId === volunteerId);
  };

  const getCaseById = (id: string): CaseData | undefined => {
    return cases.find(c => c.id === id);
  };

  const exportToExcel = async (volunteerId: string): Promise<string> => {
    try {
      const volunteerCases = getCasesByVolunteer(volunteerId);
      
      // Create CSV content
      const headers = [
        'الرقم',
        'اسم رب الأسرة',
        'الرقم القومي',
        'رقم الهاتف',
        'السن',
        'الحالة الاجتماعية',
        'اسم الزوج/الزوجة',
        'رقم القومي للزوج/الزوجة',
        'عدد أفراد الأسرة',
        'الحالة الصحية',
        'حالة التعليم',
        'الدخل الشهري',
        'احتياجات الأسرة',
        'ملاحظات الباحث',
        'تاريخ التسجيل'
      ];

      const rows = volunteerCases.map((c, index) => [
        (index + 1).toString(),
        c.headName,
        c.headNationalId,
        c.headPhone || '',
        c.headAge?.toString() || '',
        c.maritalStatus,
        c.spouseName || '',
        c.spouseNationalId || '',
        c.familyMembersCount.toString(),
        c.healthStatus,
        c.childrenEducation,
        c.monthlyIncome?.toString() || '',
        c.familyNeeds,
        c.researcherNotes,
        new Date(c.createdAt).toLocaleDateString('ar-EG')
      ]);

      // Convert to CSV format
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  };

  return (
    <CasesContext.Provider
      value={{
        cases,
        addCase,
        updateCase,
        deleteCase,
        getCasesByVolunteer,
        getCaseById,
        exportToExcel
      }}
    >
      {children}
    </CasesContext.Provider>
  );
}

export function useCases() {
  const context = useContext(CasesContext);
  if (context === undefined) {
    throw new Error('useCases must be used within a CasesProvider');
  }
  return context;
}
