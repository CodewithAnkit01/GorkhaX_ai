import prisma from "../config/database.js";

const verifyConversationOwnership = async (
  userId,
  conversationId
) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return conversation;
};

export const createMessage = async (
  userId,
  conversationId,
  data
) => {
  await verifyConversationOwnership(
    userId,
    conversationId
  );

  const message = await prisma.message.create({
    data: {
      conversationId,
      role: "USER",
      content: data.content,
    },
  });

  // Update conversation's updatedAt
  await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      updatedAt: new Date(),
    },
  });

  return message;
};

export const getConversationMessages = async (
  userId,
  conversationId,
  page = 1,
  limit = 50
) => {
  await verifyConversationOwnership(
    userId,
    conversationId
  );

  const skip = (page - 1) * limit;

  const [messages, total] = await prisma.$transaction([
    prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      skip,
      take: limit,
    }),

    prisma.message.count({
      where: {
        conversationId,
      },
    }),
  ]);

  return {
    messages,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateMessage = async (
  userId,
  messageId,
  data
) => {
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      conversation: {
        userId,
      },
    },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  // User should only edit their own messages.
  if (message.role !== "USER") {
    throw new Error(
      "Only user messages can be edited"
    );
  }

  return prisma.message.update({
    where: {
      id: messageId,
    },
    data: {
      content: data.content,
    },
  });
};

export const deleteMessage = async (
  userId,
  messageId
) => {
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      conversation: {
        userId,
      },
    },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  await prisma.message.delete({
    where: {
      id: messageId,
    },
  });
};