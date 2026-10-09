import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  searchProducts,
  getProductsByCategory,
  getCategories,
  deleteProduct,
  addProduct,
  updateProduct,
} from "../features/products/productsApi";
import type { Product } from "../features/products/products.types";
import toast from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";


import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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

const Products = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const page = Number(searchParams.get("page")) || 1;

  const [searchInput, setSearchInput] = useState(search);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);


  const [formData, setFormData] = useState({
    title: "",
    price: 0,
    description: "",
    category: "",
  });



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


  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);

      if (searchInput !== search) {
        updateParams({ search: searchInput, page: 1 });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);



  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });



  const fetchProductsData = async () => {
    const skip = (page - 1) * LIMIT;
    if (debouncedSearch) {
      return searchProducts({
        q: debouncedSearch,
        limit: LIMIT,
        skip,
        sortBy,
        order: "desc",
      });
    }

    if (category) {
      return getProductsByCategory(category, {
        limit: LIMIT,
        skip,
        sortBy,
        order: "desc",
      });
    }


    return getProducts({ limit: LIMIT, skip, sortBy, order: "desc" });
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", debouncedSearch, category, sortBy, page],
    queryFn: fetchProductsData,
  });


  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Mahsulot muvaffaqiyatli o'chirildi!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteConfirmId(null);
    },
    onError: () => toast.error("O'chirishda xatolik yuz berdi"),
  });


  const addMutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      toast.success("Yangi mahsulot qo'shildi!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsModalOpen(false);
    },
    onError: () => toast.error("Qo'shishda xatolik yuz berdi"),
  });


  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateProduct(id, data),
    onSuccess: () => {
      toast.success("Mahsulot yangilandi!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsModalOpen(false);
    },
    onError: () => toast.error("Yangilashda xatolik yuz berdi"),
  });

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ title: "", price: 0, description: "", category: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

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

  if (isError) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-sm text-center shadow-xs">
          <p className="font-bold text-lg mb-1">Xatolik yuz berdi</p>
          <p className="text-sm">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col relative pb-8">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1d2d5b] mb-1">
            Mahsulotlar ro'yxati
          </h1>
          <p className="text-slate-500 text-sm">
            Barcha mahsulotlarni boshqarish
          </p>
        </div>

        <Button onClick={openAddModal}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Yangi Qo'shish
        </Button>
      </div>

      <div className="flex gap-3 my-3 ">
        <div className="flex-1 min-w-[200px] relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Mahsulot qidirish..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>


        <Select
          value={category || "all"}
          onValueChange={(val) => {

            updateParams({ category: val === "all" ? null : val, page: 1 });
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Barcha Kategoriyalar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha Kategoriyalar</SelectItem>
            {categories?.map((cat: any) => (
              <SelectItem key={cat.slug || cat} value={cat.slug || cat}>
                {cat.name || cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>


        <Select
          value={sortBy || "none"}
          onValueChange={(val) => {

            updateParams({ sortBy: val === "none" ? null : val, page: 1 });
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Barchasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Barchasi</SelectItem>
            <SelectItem value="price">Narx bo'yicha</SelectItem>
            <SelectItem value="title">Nomi bo'yicha</SelectItem>
            <SelectItem value="rating">Reyting bo'yicha</SelectItem>
          </SelectContent>
        </Select>
      </div>


      {isLoading ? (
        <div className="flex-1 flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d2d5b]"></div>
        </div>
      ) : (
        <>
          {data?.products.length === 0 ? (
            <div className="flex-1 flex justify-center items-center text-slate-500 text-sm">
              Hech narsa topilmadi!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {data?.products.map((product: Product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-sm border border-slate-200 hover:shadow-md transition-all duration-300 flex flex-col relative overflow-hidden"
                >

                  <div className="absolute top-2 left-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 rounded-sm shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(product);
                      }}
                    >
                      <PencilIcon className="w-3.5 h-3.5 text-slate-600 hover:text-[#1d2d5b]" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7 rounded-sm shadow-sm"
                      onClick={(e) => handleDelete(e, product.id)}
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="aspect-[4/3] bg-slate-100 relative border-b border-slate-100 overflow-hidden">
                    <img
                      src={
                        product.thumbnail ||
                        "https://via.placeholder.com/300x200"
                      }
                      alt={product.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-white px-2 py-0.5 rounded-sm text-[10px] font-bold text-[#1d2d5b] border border-slate-200 shadow-xs flex items-center gap-1">
                      ⭐ {product.rating ? product.rating.toFixed(1) : "0"}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                      {product.category || "Noma'lum"}
                    </div>
                    <h3
                      className="font-bold text-slate-900 text-sm mb-1 line-clamp-1"
                      title={product.title}
                    >
                      {product.title}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-2 mb-3 flex-1">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                      <span className="text-lg font-bold text-[#1d2d5b]">
                        ${product.price}
                      </span>
                    </div>
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
              {editingProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleFormSubmit}
            className="flex flex-col gap-4 mt-2"
          >
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Nomi
              </label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Narxi ($)
              </label>
              <Input
                required
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Kategoriya
              </label>
              <Select
                required
                value={formData.category || undefined}
                onValueChange={(val) =>
                  setFormData({ ...formData, category: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategoriyani tanlang" />
                </SelectTrigger>
                <SelectContent side="bottom" avoidCollisions={false}>
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat.slug || cat} value={cat.slug || cat}>
                      {cat.name || cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Ta'rif
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full flex rounded-sm border border-slate-300 bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none focus:border-[#1d2d5b] focus:ring-1 focus:ring-[#1d2d5b]/20 resize-none"
              ></textarea>
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
              Rostdan ham bu mahsulotni o'chirmoqchimisiz? Bu amalni ortga
              qaytarib bo'lmaydi.
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

export default Products;
