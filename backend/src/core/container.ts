/**
 * Core Dependency Injection Container
 *
 * Provides type-safe service registration and resolution for StoryForge AI.
 * Supports Singleton and Transient lifetimes.
 * Eliminates direct inter-service instantiation and enables seamless testing mocks.
 */

import { authRepository } from '../modules/auth/auth.repository';
import { usersRepository } from '../modules/users/users.repository';
import { organizationsRepository } from '../modules/organizations/organizations.repository';
import { teamsRepository } from '../modules/teams/teams.repository';
import { sessionsRepository } from '../modules/sessions/sessions.repository';
import { auditRepository } from '../modules/audit/audit.repository';
import { projectsRepository } from '../modules/projects/projects.repository';

import { authService } from '../modules/auth/auth.service';
import { usersService } from '../modules/users/users.service';
import { organizationsService } from '../modules/organizations/organizations.service';
import { teamsService } from '../modules/teams/teams.service';
import { sessionsService } from '../modules/sessions/sessions.service';
import { auditService } from '../modules/audit/audit.service';
import { permissionsService } from '../modules/permissions/permissions.service';
import { emailService } from '../services/EmailService';
import { oauthService } from '../services/OAuthService';
import { twoFactorService } from '../services/TwoFactorService';

export type Lifetime = 'singleton' | 'transient';

export interface ServiceDescriptor<T = unknown> {
  factory: (container: Container) => T;
  lifetime: Lifetime;
  instance?: T;
}

export class Container {
  private services = new Map<string, ServiceDescriptor>();

  /**
   * Register a factory function for a service token.
   */
  register<T>(token: string, factory: (container: Container) => T, lifetime: Lifetime = 'singleton'): this {
    this.services.set(token, { factory, lifetime });
    return this;
  }

  /**
   * Register a pre-constructed instance as a singleton.
   */
  registerInstance<T>(token: string, instance: T): this {
    this.services.set(token, {
      factory: () => instance,
      lifetime: 'singleton',
      instance,
    });
    return this;
  }

  /**
   * Resolve a service instance by token.
   */
  resolve<T>(token: string): T {
    const descriptor = this.services.get(token);

    if (!descriptor) {
      throw new Error(`[DI Container] Service '${token}' is not registered.`);
    }

    if (descriptor.lifetime === 'singleton') {
      if (!descriptor.instance) {
        descriptor.instance = descriptor.factory(this);
      }
      return descriptor.instance as T;
    }

    return descriptor.factory(this) as T;
  }

  /**
   * Check if a token is registered.
   */
  has(token: string): boolean {
    return this.services.has(token);
  }

  /**
   * Clear all registered services (useful for test setup/teardown).
   */
  reset(): void {
    this.services.clear();
  }
}

/** Global application container singleton instance */
export const container = new Container();

// ─── Service Tokens ───────────────────────────────────────────────────────────

export const TOKENS = {
  // Repositories
  AuthRepository: 'AuthRepository',
  UsersRepository: 'UsersRepository',
  OrganizationsRepository: 'OrganizationsRepository',
  TeamsRepository: 'TeamsRepository',
  SessionsRepository: 'SessionsRepository',
  AuditRepository: 'AuditRepository',
  ProjectsRepository: 'ProjectsRepository',

  // Services
  AuthService: 'AuthService',
  UsersService: 'UsersService',
  OrganizationsService: 'OrganizationsService',
  TeamsService: 'TeamsService',
  SessionsService: 'SessionsService',
  AuditService: 'AuditService',
  EmailService: 'EmailService',
  OAuthService: 'OAuthService',
  TwoFactorService: 'TwoFactorService',
  PermissionsService: 'PermissionsService',
} as const;

/**
 * Bootstrap default container registrations.
 */
export function setupContainer(): Container {
  // Repositories
  container.registerInstance(TOKENS.AuthRepository, authRepository);
  container.registerInstance(TOKENS.UsersRepository, usersRepository);
  container.registerInstance(TOKENS.OrganizationsRepository, organizationsRepository);
  container.registerInstance(TOKENS.TeamsRepository, teamsRepository);
  container.registerInstance(TOKENS.SessionsRepository, sessionsRepository);
  container.registerInstance(TOKENS.AuditRepository, auditRepository);
  container.registerInstance(TOKENS.ProjectsRepository, projectsRepository);

  // Core Services
  container.registerInstance(TOKENS.EmailService, emailService);
  container.registerInstance(TOKENS.OAuthService, oauthService);
  container.registerInstance(TOKENS.TwoFactorService, twoFactorService);
  container.registerInstance(TOKENS.PermissionsService, permissionsService);

  // Feature Services
  container.registerInstance(TOKENS.AuthService, authService);
  container.registerInstance(TOKENS.UsersService, usersService);
  container.registerInstance(TOKENS.OrganizationsService, organizationsService);
  container.registerInstance(TOKENS.TeamsService, teamsService);
  container.registerInstance(TOKENS.SessionsService, sessionsService);
  container.registerInstance(TOKENS.AuditService, auditService);

  return container;
}

// Auto-run setup for application runtime
setupContainer();
