import prisma from "../config/database.js";
import {
  generateRefreshTokenValue,
  hashRefreshToken,
} from "../utils/refreshToken.js";

const REFRESH_TOKEN_DAYS = 7;

const getRefreshTokenExpiry = () => {
  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + REFRESH_TOKEN_DAYS
  );

  return expiresAt;
};

export const createRefreshSession = async (userId) => {
  const refreshToken = generateRefreshTokenValue();

  const tokenHash = hashRefreshToken(refreshToken);

  const expiresAt = getRefreshTokenExpiry();

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return refreshToken;
};

export const rotateRefreshToken = async (refreshToken) => {
  const tokenHash = hashRefreshToken(refreshToken);

  const existingToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!existingToken) {
    throw new Error("Invalid refresh token");
  }

  if (existingToken.revokedAt) {
    throw new Error("Refresh token has been revoked");
  }

  if (existingToken.expiresAt <= new Date()) {
    throw new Error("Refresh token has expired");
  }

  // Revoke old token
  await prisma.refreshToken.update({
    where: {
      id: existingToken.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  // Create new token
  const newRefreshToken =
    await createRefreshSession(existingToken.userId);

  return {
    user: existingToken.user,
    refreshToken: newRefreshToken,
  };
};

export const revokeRefreshToken = async (refreshToken) => {
  const tokenHash = hashRefreshToken(refreshToken);

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

export const revokeAllUserRefreshTokens = async (userId) => {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};