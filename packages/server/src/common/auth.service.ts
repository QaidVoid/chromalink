import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { randomBytes } from "node:crypto";
import * as jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "chromalink-secret-change-in-production";
const TOKEN_EXPIRY = "365d";

interface TokenPayload {
  userId: string;
  nickname: string;
}

@Injectable()
export class AuthService {
  private userSessions: Map<string, string> = new Map();

  constructor(private readonly databaseService: DatabaseService) {}

  generateUserId(): string {
    return randomBytes(16).toString("hex");
  }

  generateToken(userId: string, nickname: string): string {
    return jwt.sign({ userId, nickname } as TokenPayload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  async authenticateWithToken(
    token: string | null | undefined,
    nickname: string,
  ): Promise<{ userId: string; token: string } | null> {
    if (token) {
      const payload = this.verifyToken(token);
      if (payload) {
        const existingUser = await this.databaseService.getUser(payload.userId);
        if (existingUser) {
          if (existingUser.nickname !== nickname) {
            await this.databaseService.updateUser(payload.userId, {
              nickname,
              last_seen: new Date().toISOString(),
            });
          } else {
            await this.databaseService.updateUser(payload.userId, {
              last_seen: new Date().toISOString(),
            });
          }

          const newToken = this.generateToken(payload.userId, nickname);
          await this.databaseService.updateUser(payload.userId, {
            token: newToken,
          });

          return { userId: payload.userId, token: newToken };
        }
      }
    }

    const newUserId = this.generateUserId();
    const newToken = this.generateToken(newUserId, nickname);

    await this.databaseService.createUser({
      id: newUserId,
      nickname,
      token: newToken,
    });

    return { userId: newUserId, token: newToken };
  }

  setSocketSession(socketId: string, userId: string) {
    this.userSessions.set(socketId, userId);
  }

  getUserIdFromSocket(socketId: string): string | undefined {
    return this.userSessions.get(socketId);
  }

  getSocketIdFromUserId(userId: string): string | undefined {
    for (const [socketId, uid] of this.userSessions.entries()) {
      if (uid === userId) {
        return socketId;
      }
    }
    return undefined;
  }

  removeSocketSession(socketId: string) {
    this.userSessions.delete(socketId);
  }
}
