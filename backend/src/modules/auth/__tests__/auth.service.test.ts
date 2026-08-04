import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../auth.service';

describe('AuthService — Unit Tests', () => {
  let authService: AuthService;
  let mockAuthRepo: any;
  let mockSessionRepo: any;

  beforeEach(() => {
    mockAuthRepo = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      incrementFailedLogins: vi.fn(),
      lockAccount: vi.fn(),
      resetLockout: vi.fn(),
    };

    mockSessionRepo = {
      create: vi.fn().mockResolvedValue({}),
      findByTokenId: vi.fn(),
      revokeSession: vi.fn().mockResolvedValue(true),
    };

    authService = new AuthService(mockAuthRepo, mockSessionRepo);
  });

  it('should register a new user successfully', async () => {
    mockAuthRepo.findByEmail.mockResolvedValue(null);
    mockAuthRepo.create.mockResolvedValue({
      _id: 'user_123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      plan: 'free',
      credits: 100,
      save: vi.fn(),
    });

    const result = await authService.register(
      { name: 'John Doe', email: 'john@example.com', password: 'Password123!' },
      { ip: '127.0.0.1', userAgent: 'Jest' }
    );

    expect(result.user.email).toBe('john@example.com');
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
  });

  it('should throw conflict error if email is already registered', async () => {
    mockAuthRepo.findByEmail.mockResolvedValue({ _id: 'existing_id' });

    await expect(
      authService.register(
        { name: 'John Doe', email: 'john@example.com', password: 'Password123!' },
        { ip: '127.0.0.1', userAgent: 'Jest' }
      )
    ).rejects.toThrow('An account with this email address already exists');
  });

  it('should lock account after 5 failed login attempts', async () => {
    const mockUser = {
      _id: 'user_123',
      email: 'john@example.com',
      isActive: true,
      comparePassword: vi.fn().mockResolvedValue(false),
    };

    mockAuthRepo.findByEmail.mockResolvedValue(mockUser);
    mockAuthRepo.incrementFailedLogins.mockResolvedValue({ failedLoginAttempts: 5 });

    await expect(
      authService.login(
        { email: 'john@example.com', password: 'wrong', rememberMe: false },
        { ip: '127.0.0.1', userAgent: 'Jest' }
      )
    ).rejects.toThrow('Invalid email or password');

    expect(mockAuthRepo.lockAccount).toHaveBeenCalled();
  });
});
