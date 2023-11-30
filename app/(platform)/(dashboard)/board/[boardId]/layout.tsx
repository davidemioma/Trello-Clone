import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import BoardNavbar from "./_components/BoardNavbar";
import { notFound, redirect } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { boardId: string };
}) {
  const { orgId } = auth();

  if (!orgId) {
    return {
      title: "Board",
    };
  }

  const board = await prismadb.board.findUnique({
    where: {
      id: params.boardId,
      orgId,
    },
  });

  return {
    title: board?.title || "Board",
  };
}

export default async function BoardIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { boardId: string };
}) {
  const { orgId } = auth();

  const { boardId } = params;

  if (!orgId) {
    return redirect("/select-org");
  }

  const board = await prismadb.board.findUnique({
    where: {
      id: boardId,
      orgId,
    },
  });

  if (!board) {
    notFound();
  }

  return (
    <div
      className="relative h-full bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${board.imageFullUrl})` }}
    >
      <BoardNavbar board={board} />

      <div className="absolute inset-0 bg-black/10" />

      <main className="relative h-full pt-28">{children}</main>
    </div>
  );
}
