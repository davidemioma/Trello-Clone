"use server";

import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { UpdateCard } from "./schema";
import { revalidatePath } from "next/cache";
import { InputType, ReturnType } from "./types";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { createSafeAction } from "@/lib/create-safe-action";
import { createActivityLog } from "@/lib/create-activity-log";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return { error: "Unauthorized" };
  }

  const { id, boardId, ...values } = data;

  let card;

  try {
    const exists = await prismadb.card.findUnique({
      where: {
        id,
        list: {
          board: {
            orgId,
          },
          boardId,
        },
      },
    });

    if (!exists) {
      return { error: "Card does not exists" };
    }

    card = await prismadb.card.update({
      where: {
        id,
        list: {
          board: {
            orgId,
          },
          boardId,
        },
      },
      data: {
        ...values,
      },
    });

    await createActivityLog({
      action: ACTION.UPDATE,
      entityId: card.id,
      entityType: ENTITY_TYPE.CARD,
      entityTitle: card.title,
    });
  } catch (err) {
    return { error: "Failed to update Card." };
  }

  revalidatePath(`/board/${boardId}`);

  return { data: card };
};

export const updateCard = createSafeAction(UpdateCard, handler);
