import prisma from "../config/database.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";
import {
  hashPassword,
  comparePassword,
} from "../utils/password.js";

const sanitizeUser = (user) => {
  const { passwordHash, ...safeUser } = user;

  return safeUser;
};

export const registerUser = async ({
  name,
  username,
  email,
  password,
}) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username },
      ],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error("Email is already registered");
    }

    if (existingUser.username === username) {
      throw new Error("Username is already taken");
    }
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      passwordHash,
    },
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

export const loginUser = async ({
  email,
  password,
}) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordValid = await comparePassword(
    password,
    user.passwordHash
  );

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

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