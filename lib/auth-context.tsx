import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Volunteer {
  id: string;
  username: string;
  password: string;
  fullName: string;
}

export interface AuthContextType {
  currentVolunteer: Volunteer | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registerVolunteer: (username: string, password: string, fullName: string) => Promise<boolean>;
  volunteers: Volunteer[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default volunteers for testing
const DEFAULT_VOLUNTEERS: Volunteer[] = [
  {
    id: '1',
    username: 'ahmed',
    password: '123456',
    fullName: 'أحمد محمد'
  },
  {
    id: '2',
    username: 'fatima',
    password: '123456',
    fullName: 'فاطمة علي'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentVolunteer, setCurrentVolunteer] = useState<Volunteer | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(DEFAULT_VOLUNTEERS);
  const [isLoading, setIsLoading] = useState(true);

  // Load volunteers and current session from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedVolunteers = await AsyncStorage.getItem('volunteers');
        if (savedVolunteers) {
          setVolunteers(JSON.parse(savedVolunteers));
        } else {
          // Save default volunteers
          await AsyncStorage.setItem('volunteers', JSON.stringify(DEFAULT_VOLUNTEERS));
        }

        const savedSession = await AsyncStorage.getItem('currentVolunteer');
        if (savedSession) {
          setCurrentVolunteer(JSON.parse(savedSession));
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const volunteer = volunteers.find(
        v => v.username === username && v.password === password
      );

      if (volunteer) {
        setCurrentVolunteer(volunteer);
        await AsyncStorage.setItem('currentVolunteer', JSON.stringify(volunteer));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      setCurrentVolunteer(null);
      await AsyncStorage.removeItem('currentVolunteer');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const registerVolunteer = async (
    username: string,
    password: string,
    fullName: string
  ): Promise<boolean> => {
    try {
      // Check if username already exists
      if (volunteers.some(v => v.username === username)) {
        return false;
      }

      const newVolunteer: Volunteer = {
        id: Date.now().toString(),
        username,
        password,
        fullName
      };

      const updatedVolunteers = [...volunteers, newVolunteer];
      setVolunteers(updatedVolunteers);
      await AsyncStorage.setItem('volunteers', JSON.stringify(updatedVolunteers));
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentVolunteer,
        isLoading,
        login,
        logout,
        registerVolunteer,
        volunteers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
