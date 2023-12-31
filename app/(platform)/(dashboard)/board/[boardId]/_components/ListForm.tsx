"use client";

import React, { ElementRef, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import ListWrapper from "./ListWrapper";
import { useAction } from "@/hooks/use-action";
import { Button } from "@/components/ui/button";
import { createList } from "@/actions/createList";
import FormSubmit from "@/components/form/FormSubmit";
import { useParams, useRouter } from "next/navigation";
import { FormInput } from "@/components/form/FormInput";
import { useEventListener, useOnClickOutside } from "usehooks-ts";

const ListForm = () => {
  const router = useRouter();

  const params = useParams();

  const [isEditing, setIsEditing] = useState(false);

  const formRef = useRef<ElementRef<"form">>(null);

  const inputRef = useRef<ElementRef<"input">>(null);

  const enableEditing = () => {
    setIsEditing(true);

    setTimeout(() => {
      inputRef.current?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };

  useEventListener("keydown", onKeyDown);

  useOnClickOutside(formRef, disableEditing);

  const { execute, fieldErrors } = useAction(createList, {
    onSuccess: (data) => {
      toast.success(`List "${data.title}" created`);

      disableEditing();

      router.refresh();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;

    const boardId = formData.get("boardId") as string;

    execute({
      title,
      boardId,
    });
  };

  if (isEditing) {
    return (
      <ListWrapper>
        <form
          className="bg-white w-full p-3 space-y-4 rounded-md shadow-sm"
          ref={formRef}
          action={onSubmit}
        >
          <FormInput
            className="h-7 px-2 py-1 text-sm font-medium border-transparent hover:border-input focus:border-input transition"
            ref={inputRef}
            id="title"
            placeholder="Enter list title..."
            errors={fieldErrors}
          />

          <input hidden value={params.boardId} name="boardId" />

          <div className="flex items-center gap-1">
            <FormSubmit>Add list</FormSubmit>

            <Button onClick={disableEditing} size="sm" variant="ghost">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </ListWrapper>
    );
  }

  return (
    <ListWrapper>
      <button
        className="bg-white/80 w-full flex items-center p-3 text-sm font-medium rounded-md hover:bg-white/50 transition"
        onClick={enableEditing}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add a list
      </button>
    </ListWrapper>
  );
};

export default ListForm;
