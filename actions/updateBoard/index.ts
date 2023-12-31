"use server";

import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { UpdateBoard } from "./schema";
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

  const { title, id } = data;

  let board;

  try {
    const exists = await prismadb.board.findUnique({
      where: {
        id,
        orgId,
      },
    });

    if (!exists) {
      return { error: "Board does not exists" };
    }

    board = await prismadb.board.update({
      where: {
        id,
        orgId,
      },
      data: {
        title,
      },
    });

    await createActivityLog({
      action: ACTION.UPDATE,
      entityId: board.id,
      entityType: ENTITY_TYPE.BOARD,
      entityTitle: board.title,
    });
  } catch (err) {
    return { error: "Failed to update board." };
  }

  revalidatePath(`/board/${board.id}`);

  return { data: board };
};

export const updateBoard = createSafeAction(UpdateBoard, handler);
