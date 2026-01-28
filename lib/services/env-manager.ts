/**
 * Environment Variable Manager
 * Handles updating .env.local file with new session credentials
 */

import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import type { InstagramSession } from './instagram-session';

export class EnvManager {
  private envFilePath: string;

  constructor() {
    // Use .env.local in project root
    this.envFilePath = path.join(process.cwd(), '.env.local');
  }

  /**
   * Updates environment variables in .env.local file
   */
  async updateEnvironment(session: InstagramSession): Promise<void> {
    try {
      let envContent = '';
      
      // Read existing .env.local if it exists
      if (existsSync(this.envFilePath)) {
        envContent = await readFile(this.envFilePath, 'utf-8');
      }

      // URL-encode sessionid (as expected by existing code)
      const encodedSessionId = encodeURIComponent(session.sessionid);

      // Update or add INSTAGRAM_SESSION_ID
      envContent = this.updateEnvVar(envContent, 'INSTAGRAM_SESSION_ID', encodedSessionId);
      
      // Update or add INSTAGRAM_CSRF_TOKEN
      if (session.csrftoken) {
        envContent = this.updateEnvVar(envContent, 'INSTAGRAM_CSRF_TOKEN', session.csrftoken);
      }
      
      // Update or add INSTAGRAM_DS_USER_ID
      if (session.ds_user_id) {
        envContent = this.updateEnvVar(envContent, 'INSTAGRAM_DS_USER_ID', session.ds_user_id);
      }

      // Write back to file
      await writeFile(this.envFilePath, envContent, 'utf-8');
      console.log('[ENV] Environment variables updated successfully');
    } catch (error) {
      console.error('[ENV] Error updating environment file:', error);
      throw new Error(`Failed to update environment file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates or adds an environment variable in the content string
   */
  private updateEnvVar(content: string, key: string, value: string): string {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const newLine = `${key}=${value}`;

    if (regex.test(content)) {
      // Update existing variable
      return content.replace(regex, newLine);
    } else {
      // Add new variable (append to end)
      const trimmed = content.trim();
      return trimmed ? `${trimmed}\n${newLine}\n` : `${newLine}\n`;
    }
  }

  /**
   * Gets current environment variable value
   */
  getEnvVar(key: string): string | undefined {
    return process.env[key];
  }
}
