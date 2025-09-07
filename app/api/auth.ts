/**
 * Authentication API service
 * Handles communication with the backend authentication endpoints
 */

interface LoginResponse {
  code: number;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
    user: {
      id: number;
      username: string;
      name: string;
      role: string;
      avatar?: string;
      status: string;
      created_at: string;
    };
  };
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface User {
  id: number;
  username: string;
  name: string;
  phone?: string;
  email?: string;
  id_card?: string;
  address?: string;
  role: string;
  avatar?: string;
  status: string;
  created_at: string;
}

interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
  name: string;
  email: string;
  phone: string;
  idCard: string;
  address: string;
}

export class AuthService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  /**
   * Login user with phone/username and password
   */
  static async login(identifier: string, password: string): Promise<{
    success: boolean;
    user?: User;
    tokens?: AuthTokens;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: identifier, // Backend accepts both username and phone as username field
          password: password,
        }),
      });

      const data: LoginResponse = await response.json();

      if (data.code === 200 && data.data) {
        return {
          success: true,
          user: data.data.user,
          tokens: {
            access_token: data.data.access_token,
            refresh_token: data.data.refresh_token,
          },
        };
      } else {
        return {
          success: false,
          error: data.message || '登录失败',
        };
      }
    } catch (error) {
      console.error('Login API error:', error);
      return {
        success: false,
        error: '网络错误，请检查网络连接',
      };
    }
  }

  /**
   * Register a new user
   */
  static async register(registerData: RegisterData): Promise<{
    success: boolean;
    user?: User;
    tokens?: AuthTokens;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data: LoginResponse = await response.json();

      if (data.code === 200 && data.data) {
        return {
          success: true,
          user: data.data.user,
          tokens: {
            access_token: data.data.access_token,
            refresh_token: data.data.refresh_token,
          },
        };
      } else {
        return {
          success: false,
          error: data.message || '注册失败',
        };
      }
    } catch (error) {
      console.error('Register API error:', error);
      return {
        success: false,
        error: '网络错误，请检查网络连接',
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<{
    success: boolean;
    access_token?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      const data = await response.json();

      if (data.code === 200 && data.data) {
        return {
          success: true,
          access_token: data.data.access_token,
        };
      } else {
        return {
          success: false,
          error: data.message || '刷新令牌失败',
        };
      }
    } catch (error) {
      console.error('Refresh token API error:', error);
      return {
        success: false,
        error: '网络错误，请检查网络连接',
      };
    }
  }
}