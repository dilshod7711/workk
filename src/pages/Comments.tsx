import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComments,
  deleteComment,
  addComment,
  updateComment,
} from "../features/comments/commentsApi";
import type { Comment } from "../features/comments/comments.types";
import toast from "react-hot-toast";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";


import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
} from "../components/ui/pagination";

const LIMIT = 12;

const Comments = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;

  const updateParams = (updates: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || (key === "page" && value === 1)) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    setSearchParams(newParams);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [formData, setFormData] = useState({ body: "", postId: 1, userId: 5 });

  const fetchCommentsData = async () => {
    const skip = (page - 1) * LIMIT;
    return getComments({ limit: LIMIT, skip });
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["comments", page],
    queryFn: fetchCommentsData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success("Izoh muvaffaqiyatli o'chirildi!");
      setDeleteConfirmId(null);
    },
    onError: () => toast.error("O'chirishda xatolik yuz berdi!"),
  });

  const addMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success("Izoh qo'shildi!");
      setIsModalOpen(false);
    },
    onError: () => toast.error("Qo'shishda xatolik yuz berdi!"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: string }) =>
      updateComment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success("Izoh yangilandi!");
      setIsModalOpen(false);
    },
    onError: () => toast.error("Yangilashda xatolik yuz berdi!"),
  });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const openAddModal = () => {
    setEditingComment(null);
    setFormData({ body: "", postId: 1, userId: 5 });
    setIsModalOpen(true);
  };

  const openEditModal = (comment: Comment) => {
    setEditingComment(comment);
    setFormData({
      body: comment.body,
      postId: comment.postId,
      userId: comment.user.id,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingComment) {
      updateMutation.mutate({ id: editingComment.id, data: formData.body });
    } else {
      addMutation.mutate(formData);
    }
  };

  if (isError)
    return (
      <div className="p-8 text-center text-red-500">
        Xatolik: {error.message}
      </div>
    );

  return (
    <div className="pb-8">
      <div className="flex justify-end mb-8 gap-4">
        <Button
          onClick={openAddModal}
          className="bg-[#1d2d5b] hover:bg-[#152042] text-white rounded-sm shadow-sm"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Yangi izoh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d2d5b]"></div>
        </div>
      ) : (
        <>
          {data?.comments.length === 0 ? (
            <div className="flex justify-center items-center text-slate-500 text-sm min-h-[300px]">
              Izohlar topilmadi!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {data?.comments.map((comment: Comment) => (
                <div
                  key={comment.id}
                  className="bg-white p-5 rounded-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 relative group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#1d2d5b]">
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          {comment.user.username}
                        </h3>
                        <p className="text-[10px] text-slate-500">
                          Foydalanuvchi ID: {comment.user.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-[#1d2d5b]"
                        onClick={() => openEditModal(comment)}
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-600"
                        onClick={(e) => handleDelete(e, comment.id)}
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm italic mb-4 flex-1">
                    "{comment.body}"
                  </p>

                  <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-3">
                    <span>Post ID: {comment.postId}</span>
                    <span className="flex items-center gap-1 font-medium text-amber-500">
                      👍 {comment.likes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      updateParams({ page: Math.max(1, page - 1) })
                    }
                    disabled={page === 1}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((p, index) => (
                  <PaginationItem key={index}>
                    {p === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={page === p}
                        onClick={() => updateParams({ page: Number(p) })}
                      >
                        {p}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      updateParams({ page: Math.min(totalPages, page + 1) })
                    }
                    disabled={page === totalPages}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingComment ? "Izohni tahrirlash" : "Yangi izoh yozish"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleFormSubmit}
            className="flex flex-col gap-4 mt-2"
          >
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Izoh matni
              </label>
              <textarea
                required
                rows={4}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1d2d5b] transition-all resize-none"
                placeholder="Bu yerga izoh yozing..."
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
              />
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={addMutation.isPending || updateMutation.isPending}
              >
                {addMutation.isPending || updateMutation.isPending
                  ? "Saqlanmoqda..."
                  : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tasdiqlash</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 text-sm">
              Rostdan ham bu izohni o'chirmoqchimisiz? Bu amalni ortga qaytarib
              bo'lmaydi.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirmId !== null &&
                deleteMutation.mutate(deleteConfirmId)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "O'chirilmoqda..." : "Ha, o'chirish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Comments;
