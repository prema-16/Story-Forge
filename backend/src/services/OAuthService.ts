import axios from 'axios';
import type { OAuthProvider } from '@storyforge/shared';
import { logger } from '../config/logger';
import { env } from '../config/env';

export interface OAuthUserProfile {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
}

export class OAuthService {
  /**
   * Exchange an authorization code for user profile data.
   */
  async exchangeCodeForProfile(provider: OAuthProvider, code: string, redirectUri?: string): Promise<OAuthUserProfile> {
    logger.info(`[OAuthService] Exchanging code for provider '${provider}'`);

    if (env.NODE_ENV === 'development' && code.startsWith('mock_code_')) {
      return {
        provider,
        providerId: `mock_${provider}_id_12345`,
        email: `mock.${provider}@storyforge.ai`,
        name: `Mock ${provider.toUpperCase()} User`,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${provider}`,
      };
    }

    switch (provider) {
      case 'google':
        return this.exchangeGoogleCode(code, redirectUri);
      case 'github':
        return this.exchangeGitHubCode(code);
      case 'microsoft':
        return this.exchangeMicrosoftCode(code, redirectUri);
      default:
        throw new Error(`Unsupported OAuth provider '${provider}'`);
    }
  }

  private async exchangeGoogleCode(code: string, redirectUri?: string): Promise<OAuthUserProfile> {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri || `${env.CLIENT_URL}/auth/callback?provider=google`,
      grant_type: 'authorization_code',
    });

    const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
    });

    return {
      provider: 'google',
      providerId: userRes.data.id,
      email: userRes.data.email,
      name: userRes.data.name || userRes.data.email.split('@')[0],
      avatar: userRes.data.picture,
    };
  }

  private async exchangeGitHubCode(code: string): Promise<OAuthUserProfile> {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
    });

    // GitHub emails may be private; fetch primary email
    let email = userRes.data.email;
    if (!email) {
      const emailRes = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
      });
      const primary = emailRes.data.find((e: { primary: boolean }) => e.primary);
      email = primary?.email ?? userRes.data.login + '@users.noreply.github.com';
    }

    return {
      provider: 'github',
      providerId: String(userRes.data.id),
      email,
      name: userRes.data.name || userRes.data.login,
      avatar: userRes.data.avatar_url,
    };
  }

  private async exchangeMicrosoftCode(code: string, redirectUri?: string): Promise<OAuthUserProfile> {
    const params = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID || '',
      client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
      code,
      redirect_uri: redirectUri || `${env.CLIENT_URL}/auth/callback?provider=microsoft`,
      grant_type: 'authorization_code',
    });

    const tokenRes = await axios.post(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const userRes = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
    });

    return {
      provider: 'microsoft',
      providerId: userRes.data.id,
      email: userRes.data.userPrincipalName || userRes.data.mail,
      name: userRes.data.displayName,
    };
  }
}

export const oauthService = new OAuthService();
