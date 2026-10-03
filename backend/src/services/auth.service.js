import prisma from "../config/database.js";
import { generateAccessToken } from "../utils/jwt.js";
import {
  createRefreshSession,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
} from "./session.service.js";
import {
  hashPassword,
  comparePassword,
} from "../utils/password.js";

const sanitizeUser = (user) => {
  const { passwordHash, ...safeUser } = user;

  return safeUser;
};

export const registerUser = async (data) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        { username: data.username },
      ],
    },
  });

  if (existingUser) {
    if (existingUser.email === data.email) {
      throw new Error("Email is already registered");
    }

    if (existingUser.username === data.username) {
      throw new Error("Username is already taken");
    }
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      passwordHash,
    },
  });

  const accessToken = generateAccessToken(user);

  const refreshToken = await createRefreshSession(
    user.id
  );

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (data) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordValid = await comparePassword(
    data.password,
    user.passwordHash
  );

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user);

  const refreshToken = await createRefreshSession(
    user.id
  );

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return sanitizeUser(user);
};

export const refreshAccessToken = async (refreshToken) => {
  const result = await rotateRefreshToken(refreshToken);

  const accessToken = generateAccessToken(
    result.user
  );

  return {
    user: sanitizeUser(result.user),
    accessToken,
    refreshToken: result.refreshToken,
  };
};


export const logoutUser = async (refreshToken) => {
  await revokeRefreshToken(refreshToken);
};

export const logoutAllDevices = async (userId) => {
  await revokeAllUserRefreshTokens(userId);
};
