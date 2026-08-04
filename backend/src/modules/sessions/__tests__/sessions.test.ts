import { SessionsService } from '../sessions.service';
import { auditRepository } from '../../audit/audit.repository';

jest.mock('../../audit/audit.repository', () => ({
  auditRepository: {
    logEvent: jest.fn().mockResolvedValue({}),
  },
}));

describe('SessionsService — Session Management Tests', () => {
  let sessionsService: SessionsService;
  let mockSessionsRepo: any;

  beforeEach(() => {
    mockSessionsRepo = {
      findActiveByUserId: jest.fn(),
      revokeSession: jest.fn(),
      revokeAllUserSessions: jest.fn(),
    };
    sessionsService = new SessionsService(mockSessionsRepo);
  });

  it('should list active user sessions with current session flag', async () => {
    const validUserId = '507f1f77bcf86cd799439011';
    mockSessionsRepo.findActiveByUserId.mockResolvedValue([
      {
        tokenId: 'token_1',
        userId: validUserId,
        userAgent: 'Chrome on macOS',
        browser: 'Chrome',
        os: 'macOS',
        device: 'Desktop',
        ip: '192.168.1.1',
        createdAt: new Date(),
        lastActiveAt: new Date(),
      },
    ]);

    const sessions = await sessionsService.getUserSessions(validUserId, 'token_1');
    expect(sessions.length).toBe(1);
    expect(sessions[0].isCurrentSession).toBe(true);
    expect(sessions[0].browser).toBe('Chrome');
  });

  it('should revoke individual session by tokenId', async () => {
    mockSessionsRepo.revokeSession.mockResolvedValue(true);
    const validUserId = '507f1f77bcf86cd799439011';
    const result = await sessionsService.revokeSession(validUserId, 'token_1');
    expect(result).toBe(true);
    expect(mockSessionsRepo.revokeSession).toHaveBeenCalledWith('token_1');
  });

  it('should revoke all other user sessions', async () => {
    mockSessionsRepo.revokeAllUserSessions.mockResolvedValue(3);
    const validUserId = '507f1f77bcf86cd799439011';
    const count = await sessionsService.revokeAllSessions(validUserId, 'token_current');
    expect(count).toBe(3);
    expect(mockSessionsRepo.revokeAllUserSessions).toHaveBeenCalledWith(validUserId, 'token_current');
  });
});
