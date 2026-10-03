import prisma from "../config/database.js";

export const createConversation = async (userId, data) => {
  const conversation = await prisma.conversation.create({
    data: {
      userId,
      title: data.title || "New Chat",
      model: data.model || null,
    },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  return conversation;
};

export const getUserConversations = async (
  userId,
  page = 1,
  limit = 20
) => {
  const skip = (page - 1) * limit;

  const [conversations, total] = await prisma.$transaction([
    prisma.conversation.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
      },
    }),

    prisma.conversation.count({
      where: {
        userId,
      },
    }),
  ]);

  return {
    conversations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getConversationById = async (
  userId,
  conversationId
) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return conversation;
};

export const updateConversation = async (
  userId,
  conversationId,
  data
) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      ...(data.title !== undefined && {
        title: data.title,
      }),

      ...(data.model !== undefined && {
        model: data.model,
      }),
    },
  });
};

export const deleteConversation = async (
  userId,
  conversationId
) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  await prisma.conversation.delete({
    where: {
      id: conversationId,
    },
  });
};