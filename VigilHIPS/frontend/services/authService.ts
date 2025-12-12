import { UserProfile } from '../types.ts';

let USERS: UserProfile[] = [];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const authService = {
  checkEmailExists: async (email: string): Promise<boolean> => {
    await delay(500);
    return USERS.some(u => u.email === email);
  },

  checkDeviceBound: async (deviceCode: string): Promise<boolean> => {
    await delay(800);
    return deviceCode.endsWith('999'); 
  },

  signUp: async (data: any): Promise<UserProfile> => {
    await delay(1500);
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      organization: data.organization || 'Private Fleet',
      mfaEnabled: true, 
      role: 'admin'
    };
    USERS.push(newUser);
    return newUser;
  },

  login: async (identifier: string, password: string): Promise<{ user: UserProfile | null, requireMFA: boolean }> => {
    await delay(1000);
    const user = USERS.find(u => u.email === identifier || u.username === identifier);
    
    if (user && (password === 'password' || password === 'admin')) {
      return { user, requireMFA: user.mfaEnabled };
    }
    return { user: null, requireMFA: false };
  },

  verifyMFA: async (code: string): Promise<boolean> => {
    await delay(800);
    return code.length === 6 && !isNaN(Number(code));
  },
  
  suggestUsername: (fullName: string): string => {
    const clean = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${clean}_ops`;
  }
};