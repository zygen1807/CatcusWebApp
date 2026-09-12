"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Supplier = {
  id: string;
  name: string;
  contact: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type PriceListItem = {
  id: string;
  supplier_id: string;
  category: string;
  item_name: string;
  size: string | null;
  size_unit: string | null;
  quantity_unit: string;
  unit_price: number;
  price_basis: "standard" | "board-foot" | null;
  price_per_board_foot: number | null;
  calculated_board_feet: number | null;
  notes: string | null;
  is_active: boolean;
  effective_date: string;
  created_at: string;
  updated_at: string;
};

type PriceForm = {
  supplier_id: string;
  category: string;
  item_name: string;
  size: string;
  size_unit: string;
  quantity_unit: string;
  unit_price: string;
  price_basis: "standard" | "board-foot";
  price_per_board_foot: string;
  calculated_board_feet: number;
  effective_date: string;
  notes: string;
};

type SupplierForm = {
  name: string;
  contact: string;
  address: string;
  notes: string;
};

const CATEGORIES = [
  "Plywood",
  "Surface Materials",
  "Good Lumber",
  "Finishing Materials",
  "Hardware & Accessories",
  "Adhesives & Sealants",
  "Fasteners",
  "Glass & Mirrors",
  "Upholstery",
  "Other",
] as const;

type CategoryConfig = {
  sizeUnits: string[];
  quantityUnits: string[];
  pricingMode: "standard" | "board-foot";
};

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Plywood: {
    sizeUnits: ["ft", "in", "cm", "mm"],
    quantityUnits: ["sheet", "pcs"],
    pricingMode: "standard",
  },
  "Surface Materials": {
    sizeUnits: ["ft", "in", "cm", "mm"],
    quantityUnits: ["sheet", "roll", "pcs"],
    pricingMode: "standard",
  },
  "Good Lumber": {
    // Lumber uses a compound dimension such as 2" x 5" x 7'.
    // The size itself contains the mixed units, so the selector uses "mixed".
    sizeUnits: ["mixed"],
    quantityUnits: ["pcs", "set", "bundle"],
    pricingMode: "board-foot",
  },
  "Finishing Materials": {
    sizeUnits: ["L", "ml", "kg", "g"],
    quantityUnits: ["bottle", "can", "tube", "L", "ml", "kg", "g", "pcs"],
    pricingMode: "standard",
  },
  "Hardware & Accessories": {
    sizeUnits: ["mm", "cm", "in"],
    quantityUnits: ["pair", "set", "pcs", "box"],
    pricingMode: "standard",
  },
  "Adhesives & Sealants": {
    sizeUnits: ["L", "ml", "kg", "g"],
    quantityUnits: ["tube", "bottle", "can", "L", "ml", "kg", "g"],
    pricingMode: "standard",
  },
  Fasteners: {
    sizeUnits: ["mm", "cm", "in"],
    quantityUnits: ["box", "set", "pcs", "kg"],
    pricingMode: "standard",
  },
  "Glass & Mirrors": {
    sizeUnits: ["mm", "cm", "in", "ft"],
    quantityUnits: ["sq.ft", "sheet", "pcs"],
    pricingMode: "standard",
  },
  Upholstery: {
    sizeUnits: ["m", "cm", "ft"],
    quantityUnits: ["m", "roll", "pcs"],
    pricingMode: "standard",
  },
  Other: {
    sizeUnits: ["pcs", "mm", "cm", "in", "ft", "L", "ml", "kg", "g"],
    quantityUnits: [
      "pcs",
      "sheet",
      "pair",
      "set",
      "box",
      "roll",
      "bottle",
      "can",
      "tube",
      "kg",
      "g",
      "L",
      "ml",
      "sq.ft",
      "bundle",
    ],
    pricingMode: "standard",
  },
};

function today() {
  return new Date().toISOString().split("T")[0];
}

function toCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatNumberWithCommas(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");

  const parts = cleaned.split(".");
  const integerPart = parts[0] ?? "";
  const decimalPart = parts[1];

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart.slice(0, 2)}`;
  }

  return formattedInteger;
}

function parseMoney(value: string) {
  const cleaned = value.replace(/,/g, "");
  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

function getInitialPriceForm(supplierId = ""): PriceForm {
  const category = CATEGORIES[0];
  const config = CATEGORY_CONFIG[category];

  return {
    supplier_id: supplierId,
    category,
    item_name: "",
    size: "",
    size_unit: config.sizeUnits[0] ?? "mm",
    quantity_unit: config.quantityUnits[0] ?? "pcs",
    unit_price: "",
    price_basis: config.pricingMode,
    price_per_board_foot: "",
    calculated_board_feet: 0,
    effective_date: today(),
    notes: "",
  };
}

function calculateBoardFeet(size: string): number {
  // Expected format: 2 x 5 x 7, 2" x 5" x 7', or 2 X 5 X 7.
  // Formula: thickness(in) × width(in) × length(ft) ÷ 12.
  const normalized = size
    .replace(/[×✕]/g, "x")
    .replace(/"/g, "")
    .replace(/'/g, "")
    .trim();

  const parts = normalized
    .split(/x/i)
    .map((part) => Number(part.trim().replace(/[^0-9.]/g, "")));

  if (
    parts.length !== 3 ||
    parts.some((value) => !Number.isFinite(value) || value <= 0)
  ) {
    return 0;
  }

  const [thicknessInches, widthInches, lengthFeet] = parts;
  return (thicknessInches * widthInches * lengthFeet) / 12;
}

const initialSupplierForm: SupplierForm = {
  name: "",
  contact: "",
  address: "",
  notes: "",
};

export default function PriceListPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [priceItems, setPriceItems] = useState<PriceListItem[]>([]);

  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);

  const [priceForm, setPriceForm] = useState<PriceForm>(getInitialPriceForm());

  const [supplierForm, setSupplierForm] =
    useState<SupplierForm>(initialSupplierForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [supplierResult, priceResult] = await Promise.all([
      supabase
        .from("suppliers")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true }),

      supabase
        .from("price_list_items")
        .select("*")
        .eq("is_active", true)
        .order("item_name", { ascending: true }),
    ]);

    if (supplierResult.error) {
      console.error("Supplier loading error:", supplierResult.error);
      alert(supplierResult.error.message);
    }

    if (priceResult.error) {
      console.error("Price list loading error:", priceResult.error);
      alert(priceResult.error.message);
    }

    setSuppliers((supplierResult.data ?? []) as Supplier[]);

    setPriceItems(
      ((priceResult.data ?? []) as PriceListItem[]).map((item) => ({
        ...item,
        unit_price: Number(item.unit_price),
        price_per_board_foot:
          item.price_per_board_foot == null
            ? null
            : Number(item.price_per_board_foot),
        calculated_board_feet:
          item.calculated_board_feet == null
            ? null
            : Number(item.calculated_board_feet),
      })),
    );

    setLoading(false);
  }

  const supplierMap = useMemo(() => {
    const map = new Map<string, Supplier>();

    for (const supplier of suppliers) {
      map.set(supplier.id, supplier);
    }

    return map;
  }, [suppliers]);

  const activePriceConfig = useMemo((): CategoryConfig => {
    return (CATEGORY_CONFIG[priceForm.category] ??
      CATEGORY_CONFIG.Other) as CategoryConfig;
  }, [priceForm.category]);

  const filteredItems = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return priceItems.filter((item) => {
      const matchesSupplier =
        selectedSupplier === "all" || item.supplier_id === selectedSupplier;

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      const supplierName =
        supplierMap.get(item.supplier_id)?.name?.toLowerCase() ?? "";

      const matchesSearch =
        !searchText ||
        item.item_name.toLowerCase().includes(searchText) ||
        item.category.toLowerCase().includes(searchText) ||
        supplierName.includes(searchText) ||
        (item.size ?? "").toLowerCase().includes(searchText);

      return matchesSupplier && matchesCategory && matchesSearch;
    });
  }, [priceItems, selectedSupplier, selectedCategory, search, supplierMap]);

  const totalPriceEntries = filteredItems.length;

  const averagePrice = useMemo(() => {
    if (!filteredItems.length) return 0;

    return (
      filteredItems.reduce((sum, item) => sum + Number(item.unit_price), 0) /
      filteredItems.length
    );
  }, [filteredItems]);

  const cheapestEntries = useMemo(() => {
    const grouped = new Map<string, PriceListItem[]>();

    for (const item of priceItems) {
      const key = [
        item.category,
        item.item_name.toLowerCase(),
        item.size?.toLowerCase() ?? "",
        item.size_unit ?? "",
        item.quantity_unit,
      ].join("|");

      const current = grouped.get(key) ?? [];
      current.push(item);
      grouped.set(key, current);
    }

    const cheapestIds = new Set<string>();

    for (const entries of grouped.values()) {
      if (!entries.length) continue;

      const cheapest = entries.reduce((lowest, current) =>
        Number(current.unit_price) < Number(lowest.unit_price)
          ? current
          : lowest,
      );

      cheapestIds.add(cheapest.id);
    }

    return cheapestIds;
  }, [priceItems]);

  function openAddPriceModal() {
    setEditingPriceId(null);

    setPriceForm(
      getInitialPriceForm(
        selectedSupplier !== "all"
          ? selectedSupplier
          : (suppliers[0]?.id ?? ""),
      ),
    );

    setIsPriceModalOpen(true);
  }

  function openEditPriceModal(item: PriceListItem) {
    setEditingPriceId(item.id);

    const categoryConfig =
      CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.Other;

    setPriceForm({
      supplier_id: item.supplier_id,
      category: item.category,
      item_name: item.item_name,
      size: item.size ?? "",
      size_unit: item.size_unit ?? categoryConfig.sizeUnits[0] ?? "mm",
      quantity_unit: categoryConfig.quantityUnits.includes(item.quantity_unit)
        ? item.quantity_unit
        : (categoryConfig.quantityUnits[0] ?? "pcs"),
      unit_price: item.unit_price.toString(),
      price_basis:
        item.price_basis === "board-foot"
          ? "board-foot"
          : categoryConfig.pricingMode,
      price_per_board_foot:
        item.price_per_board_foot != null
          ? Number(item.price_per_board_foot).toFixed(2)
          : "",
      calculated_board_feet:
        item.calculated_board_feet != null
          ? Number(item.calculated_board_feet)
          : calculateBoardFeet(item.size ?? ""),
      effective_date: item.effective_date,
      notes: item.notes ?? "",
    });

    setIsPriceModalOpen(true);
  }

  function closePriceModal() {
    if (saving) return;

    setIsPriceModalOpen(false);
    setEditingPriceId(null);
    setPriceForm(
      getInitialPriceForm(selectedSupplier !== "all" ? selectedSupplier : ""),
    );
  }

  async function savePrice() {
    if (!priceForm.supplier_id) {
      alert("Please select a supplier.");
      return;
    }

    if (!priceForm.item_name.trim()) {
      alert("Please enter the item name.");
      return;
    }

    let unitPrice = parseMoney(priceForm.unit_price);
    let calculatedBoardFeet: number | null = null;
    let pricePerBoardFoot: number | null = null;
    const priceBasis =
      priceForm.category === "Good Lumber" ? "board-foot" : "standard";

    if (priceForm.category === "Good Lumber") {
      calculatedBoardFeet = calculateBoardFeet(priceForm.size);
      pricePerBoardFoot = parseMoney(priceForm.price_per_board_foot);

      if (calculatedBoardFeet <= 0) {
        alert(
          'For Good Lumber, enter size as thickness x width x length, for example 2" x 5" x 7\'.',
        );
        return;
      }

      if (pricePerBoardFoot <= 0) {
        alert("Please enter a valid price per board foot.");
        return;
      }

      unitPrice = calculatedBoardFeet * pricePerBoardFoot;
    }

    if (unitPrice <= 0) {
      alert("Unit price must be greater than zero.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        supplier_id: priceForm.supplier_id,
        category: priceForm.category,
        item_name: priceForm.item_name.trim(),
        size: priceForm.size.trim() || null,
        size_unit: priceForm.size.trim() ? priceForm.size_unit : null,
        quantity_unit: priceForm.quantity_unit,
        unit_price: unitPrice,
        price_basis: priceBasis,
        price_per_board_foot: pricePerBoardFoot,
        calculated_board_feet: calculatedBoardFeet,
        effective_date: priceForm.effective_date || today(),
        notes: priceForm.notes.trim() || null,
        is_active: true,
      };

      if (editingPriceId) {
        const { data, error } = await supabase
          .from("price_list_items")
          .update(payload)
          .eq("id", editingPriceId)
          .select()
          .single();

        if (error) throw error;

        const updated = {
          ...(data as PriceListItem),
          unit_price: Number(data.unit_price),
          price_per_board_foot:
            data.price_per_board_foot == null
              ? null
              : Number(data.price_per_board_foot),
          calculated_board_feet:
            data.calculated_board_feet == null
              ? null
              : Number(data.calculated_board_feet),
        };

        setPriceItems((prev) =>
          prev.map((item) => (item.id === editingPriceId ? updated : item)),
        );
      } else {
        const { data, error } = await supabase
          .from("price_list_items")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;

        const inserted = {
          ...(data as PriceListItem),
          unit_price: Number(data.unit_price),
          price_per_board_foot:
            data.price_per_board_foot == null
              ? null
              : Number(data.price_per_board_foot),
          calculated_board_feet:
            data.calculated_board_feet == null
              ? null
              : Number(data.calculated_board_feet),
        };

        setPriceItems((prev) => [inserted, ...prev]);
      }

      closePriceModal();
    } catch (error) {
      console.error("Failed to save price:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save price list item.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deletePrice(item: PriceListItem) {
    const supplierName =
      supplierMap.get(item.supplier_id)?.name ?? "Unknown supplier";

    const confirmed = window.confirm(
      `Delete ${item.item_name} from ${supplierName}'s price list?`,
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("price_list_items")
      .delete()
      .eq("id", item.id);

    if (error) {
      console.error("Delete price error:", error);
      alert(error.message);
      return;
    }

    setPriceItems((prev) => prev.filter((existing) => existing.id !== item.id));
  }

  function openSupplierModal() {
    setSupplierForm(initialSupplierForm);
    setIsSupplierModalOpen(true);
  }

  async function saveSupplier() {
    if (!supplierForm.name.trim()) {
      alert("Please enter the supplier name.");
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("suppliers")
        .insert({
          name: supplierForm.name.trim(),
          contact: supplierForm.contact.trim() || null,
          address: supplierForm.address.trim() || null,
          notes: supplierForm.notes.trim() || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newSupplier = data as Supplier;

      setSuppliers((prev) =>
        [...prev, newSupplier].sort((a, b) => a.name.localeCompare(b.name)),
      );

      setSelectedSupplier(newSupplier.id);
      setPriceForm((prev) => ({
        ...prev,
        supplier_id: newSupplier.id,
      }));

      setIsSupplierModalOpen(false);
      setSupplierForm(initialSupplierForm);
    } catch (error) {
      console.error("Failed to save supplier:", error);

      alert(
        error instanceof Error ? error.message : "Failed to save supplier.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="price-list-theme min-h-screen bg-[#f6ead8] p-4 text-[#2b1b14] md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <section className="rounded-3xl border border-[#dfc7ab] bg-[#fffaf2] p-6 shadow-[0_25px_80px_-30px_rgba(75,47,32,0.18)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 inline-flex rounded-full bg-[#f3cf95] px-3 py-1 text-sm font-medium text-[#4b2f20]">
                Purchasing Price Database
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-[#4b2f20]">
                Supplier Price List
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#806650]">
                Store supplier prices for materials and hardware that you can
                purchase for your furniture projects. This is separate from your
                physical inventory.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openSupplierModal}
                className="rounded-xl border border-[#c9a77f] bg-[#fff4df] px-4 py-2.5 text-sm font-medium text-[#4b2f20] transition hover:bg-[#f3cf95]"
              >
                + Supplier
              </button>

              <button
                type="button"
                onClick={openAddPriceModal}
                disabled={!suppliers.length}
                className="rounded-xl bg-[#4b2f20] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#6e4932] disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Add Price
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================
            SUMMARY
        ====================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#dfc7ab] bg-[#fffaf2] p-5">
            <p className="text-sm text-[#806650]">Suppliers</p>

            <p className="mt-2 text-3xl font-semibold text-[#4b2f20]">
              {suppliers.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfc7ab] bg-[#fffaf2] p-5">
            <p className="text-sm text-[#806650]">Price Entries</p>

            <p className="mt-2 text-3xl font-semibold text-[#4b2f20]">
              {totalPriceEntries}
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfc7ab] bg-[#fffaf2] p-5">
            <p className="text-sm text-[#806650]">Average Listed Price</p>

            <p className="mt-2 text-2xl font-semibold text-[#4b2f20]">
              {toCurrency(averagePrice)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#a9dfbd] bg-[#eafff1] p-5">
            <p className="text-sm text-[#08783d]">Cheapest Entries</p>

            <p className="mt-2 text-3xl font-semibold text-[#285d3c]">
              {cheapestEntries.size}
            </p>
          </div>
        </section>

        {/* ======================================================
            FILTERS
        ====================================================== */}

        <section className="rounded-3xl border border-[#dfc7ab] bg-[#fffaf2] p-5 shadow-[0_20px_60px_-30px_rgba(75,47,32,0.14)]">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search item, supplier, size..."
                className="w-full rounded-xl border border-[#dfc7ab] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a06a3e]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Supplier
              </label>

              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full rounded-xl border border-[#dfc7ab] bg-white px-4 py-3 text-sm outline-none focus:border-[#a06a3e]"
              >
                <option value="all">All Suppliers</option>

                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category
              </label>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-[#dfc7ab] bg-white px-4 py-3 text-sm outline-none focus:border-[#a06a3e]"
              >
                <option value="all">All Categories</option>

                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedSupplier("all");
                  setSelectedCategory("all");
                }}
                className="w-full rounded-xl border border-[#dfc7ab] bg-[#fff4df] px-4 py-3 text-sm font-medium text-[#4b2f20] hover:bg-[#f3cf95]"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================
            SUPPLIER OVERVIEW
        ====================================================== */}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Suppliers
              </h2>

              <p className="text-sm text-slate-600">
                Your available purchasing sources.
              </p>
            </div>
          </div>

          {suppliers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#c9a77f] bg-[#fff4df] p-8 text-center">
              <p className="font-semibold text-slate-900">No suppliers yet</p>

              <p className="mt-2 text-sm text-slate-600">
                Add City Hardware, OXY Hardware, JinMao, or another supplier.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {suppliers.map((supplier) => {
                const supplierCount = priceItems.filter(
                  (item) => item.supplier_id === supplier.id,
                ).length;

                return (
                  <button
                    key={supplier.id}
                    type="button"
                    onClick={() => setSelectedSupplier(supplier.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selectedSupplier === supplier.id
                        ? "border-amber-500 bg-amber-100 shadow-md"
                        : "border-amber-200 bg-[rgba(255,248,239,0.95)] hover:border-amber-300 hover:bg-amber-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {supplier.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {supplierCount} price entr
                          {supplierCount === 1 ? "y" : "ies"}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#f3cf95] px-2.5 py-1 text-xs font-medium text-[#4b2f20]">
                        Supplier
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ======================================================
            PRICE TABLE
        ====================================================== */}

        <section className="rounded-3xl border border-[#dfc7ab] bg-[#fffaf2] p-5 shadow-[0_20px_60px_-30px_rgba(75,47,32,0.14)]">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Price Entries
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {filteredItems.length} matching price
                {filteredItems.length === 1 ? "" : "s"}.
              </p>
            </div>

            <div className="rounded-xl bg-[#f3cf95] px-4 py-2 text-sm font-medium text-[#4b2f20]">
              Prices are purchasing references
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[#dfc7ab] bg-[#fff4df] p-10 text-center text-sm text-[#806650]">
              Loading price list...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#c9a77f] bg-[#fff4df] p-10 text-center">
              <p className="text-lg font-semibold text-slate-900">
                No price entries found.
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Add a supplier price or change your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#dfc7ab]">
              <table className="w-full min-w-[950px] text-sm">
                <thead className="bg-[#4b2f20] text-[#fffaf2]">
                  <tr className="border-b border-[#6e4932] text-left">
                    <th className="px-4 py-3 font-semibold text-white">
                      Supplier
                    </th>

                    <th className="px-4 py-3 font-semibold text-white">Item</th>

                    <th className="px-4 py-3 font-semibold text-white">
                      Category
                    </th>

                    <th className="px-4 py-3 font-semibold text-white">Size</th>

                    <th className="px-4 py-3 font-semibold text-white">Unit</th>

                    <th className="px-4 py-3 font-semibold text-white">
                      Unit Price
                    </th>

                    <th className="px-4 py-3 font-semibold text-white">
                      Effective
                    </th>

                    <th className="px-4 py-3 text-right font-semibold text-white">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item) => {
                    const supplier = supplierMap.get(item.supplier_id);

                    const isCheapest = cheapestEntries.has(item.id);

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-[#ead8c1] last:border-b-0 hover:bg-[#fff4df]"
                      >
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-900">
                            {supplier?.name ?? "Unknown"}
                          </div>

                          {isCheapest && (
                            <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Cheapest
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-900">
                            {item.item_name}
                          </p>

                          {item.notes && (
                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {item.notes}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {item.category}
                        </td>

                        <td className="px-4 py-4 text-slate-700">
                          {item.size
                            ? `${item.size} ${item.size_unit ?? ""}`
                            : "—"}
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {item.quantity_unit}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-base font-bold text-slate-900">
                            {toCurrency(item.unit_price)}
                          </span>
                          {item.price_basis === "board-foot" && (
                            <p className="mt-1 text-xs text-emerald-700">
                              {item.calculated_board_feet != null
                                ? `${Number(item.calculated_board_feet).toFixed(3)} bd.ft × ${toCurrency(Number(item.price_per_board_foot ?? 0))}`
                                : "Board-foot price"}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {item.effective_date}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditPriceModal(item)}
                              className="rounded-lg bg-[#f3cf95] px-3 py-2 text-xs font-medium text-[#4b2f20] hover:bg-[#eac17e]"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => void deletePrice(item)}
                              className="rounded-lg bg-[#fff0ec] px-3 py-2 text-xs font-medium text-[#9a382c] hover:bg-[#ffd9d6]"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ========================================================
          ADD / EDIT PRICE MODAL
      ======================================================== */}

      {isPriceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#2b1b14]/65 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-[#dfc7ab] bg-[#fffaf2] p-6 text-[#2b1b14] shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#a06a3e]">
                  {editingPriceId
                    ? "Edit supplier price"
                    : "Add supplier price"}
                </p>

                <h3 className="mt-1 text-2xl font-semibold text-[#4b2f20]">
                  Price List
                </h3>

                <p className="mt-1 text-sm text-[#806650]">
                  This price represents the expected purchasing cost.
                </p>
              </div>

              <button
                type="button"
                onClick={closePriceModal}
                className="rounded-full bg-[#f3cf95] px-3 py-2 text-[#4b2f20] hover:bg-[#eac17e]"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {/* Supplier */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#6e4932]">
                  Supplier
                </label>

                <select
                  value={priceForm.supplier_id}
                  onChange={(e) =>
                    setPriceForm((prev) => ({
                      ...prev,
                      supplier_id: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#dfc7ab] bg-white px-4 py-3 text-sm outline-none focus:border-[#a06a3e]"
                >
                  <option value="">Select supplier</option>

                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category
                </label>

                <select
                  value={priceForm.category}
                  onChange={(e) => {
                    const category = e.target.value;
                    const config =
                      CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.Other;

                    setPriceForm((prev) => ({
                      ...prev,
                      category,
                      size: "",
                      size_unit: config.sizeUnits[0] ?? "mm",
                      quantity_unit: config.quantityUnits[0] ?? "pcs",
                      unit_price: "",
                      price_basis: config.pricingMode,
                      price_per_board_foot: "",
                      calculated_board_feet: 0,
                    }));
                  }}
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-700"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Item */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Item Name
                </label>

                <input
                  type="text"
                  value={priceForm.item_name}
                  onChange={(e) =>
                    setPriceForm((prev) => ({
                      ...prev,
                      item_name: e.target.value,
                    }))
                  }
                  placeholder="e.g. Cabinet Hinge"
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-700"
                />
              </div>

              {/* Size */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Size
                </label>

                <div className="grid grid-cols-[1fr_100px] gap-2">
                  <input
                    type="text"
                    value={priceForm.size}
                    onChange={(e) => {
                      const size = e.target.value;
                      const boardFeet =
                        priceForm.category === "Good Lumber"
                          ? calculateBoardFeet(size)
                          : 0;
                      const pricePerBoardFoot = parseMoney(
                        priceForm.price_per_board_foot,
                      );

                      setPriceForm((prev) => ({
                        ...prev,
                        size,
                        calculated_board_feet: boardFeet,
                        unit_price:
                          priceForm.category === "Good Lumber" &&
                          boardFeet > 0 &&
                          pricePerBoardFoot > 0
                            ? (boardFeet * pricePerBoardFoot).toFixed(2)
                            : priceForm.category === "Good Lumber"
                              ? ""
                              : prev.unit_price,
                      }));
                    }}
                    placeholder={
                      priceForm.category === "Good Lumber"
                        ? `e.g. 2" x 5" x 7'`
                        : "e.g. 4 x 8"
                    }
                    className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-700"
                  />

                  <select
                    value={priceForm.size_unit}
                    onChange={(e) =>
                      setPriceForm((prev) => ({
                        ...prev,
                        size_unit: e.target.value,
                      }))
                    }
                    className="rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm outline-none focus:border-amber-700"
                  >
                    {(
                      CATEGORY_CONFIG[priceForm.category] ??
                      CATEGORY_CONFIG.Other
                    ).sizeUnits.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity Unit */}

              {/* Purchasing Unit */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Purchasing Unit
                </label>

                <select
                  value={priceForm.quantity_unit}
                  onChange={(e) =>
                    setPriceForm((prev) => ({
                      ...prev,
                      quantity_unit: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-700"
                >
                  {activePriceConfig.quantityUnits.map((unit: string) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing */}

              {priceForm.category === "Good Lumber" ? (
                <div className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="mb-4">
                    <p className="font-semibold text-emerald-900">
                      Good Lumber Board-Foot Pricing
                    </p>
                    <p className="mt-1 text-xs text-emerald-700">
                      Example: 2" × 5" × 7' = 5.833 board feet.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Price per Board Foot (PHP)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={priceForm.price_per_board_foot}
                        onChange={(e) => {
                          const formatted = formatNumberWithCommas(
                            e.target.value,
                          );
                          const price = parseMoney(formatted);
                          const boardFeet = calculateBoardFeet(priceForm.size);

                          setPriceForm((prev) => ({
                            ...prev,
                            price_per_board_foot: formatted,
                            calculated_board_feet: boardFeet,
                            unit_price:
                              boardFeet > 0 && price > 0
                                ? (boardFeet * price).toFixed(2)
                                : "",
                          }));
                        }}
                        placeholder="e.g. 70"
                        className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Calculated Board Feet
                      </label>
                      <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3">
                        <span className="text-xl font-bold text-emerald-700">
                          {priceForm.calculated_board_feet > 0
                            ? priceForm.calculated_board_feet.toFixed(3)
                            : "0.000"}{" "}
                          bd.ft
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-emerald-300 bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-500">
                          Calculated Unit Price
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Board feet × price per board foot
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        {toCurrency(parseMoney(priceForm.unit_price))}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Unit Price (PHP)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={priceForm.unit_price}
                    onChange={(e) => {
                      const formatted = formatNumberWithCommas(e.target.value);
                      setPriceForm((prev) => ({
                        ...prev,
                        unit_price: formatted,
                      }));
                    }}
                    placeholder="e.g. 450"
                    className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-700"
                  />
                </div>
              )}

              {/* Effective Date */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Price Date
                </label>

                <input
                  type="date"
                  value={priceForm.effective_date}
                  onChange={(e) =>
                    setPriceForm((prev) => ({
                      ...prev,
                      effective_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-700"
                />
              </div>

              {/* Notes */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  value={priceForm.notes}
                  onChange={(e) =>
                    setPriceForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Optional notes about this price..."
                  className="w-full resize-none rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-700"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closePriceModal}
                disabled={saving}
                className="rounded-xl border border-[#c9a77f] px-4 py-2.5 text-sm font-medium text-[#4b2f20] hover:bg-[#fff4df] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void savePrice()}
                disabled={saving}
                className="rounded-xl bg-[#4b2f20] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#6e4932] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingPriceId
                    ? "Update Price"
                    : "Save Price"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUPPLIER MODAL
      ======================================================== */}

      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#2b1b14]/65 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-[#dfc7ab] bg-[#fffaf2] p-6 text-[#2b1b14] shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#a06a3e]">
                  Supplier Management
                </p>

                <h3 className="mt-1 text-2xl font-semibold text-[#4b2f20]">
                  Add Supplier
                </h3>
              </div>

              <button
                type="button"
                onClick={() => !saving && setIsSupplierModalOpen(false)}
                className="rounded-full bg-[#f3cf95] px-3 py-2 text-[#4b2f20] hover:bg-[#eac17e]"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Supplier Name
                </label>

                <input
                  type="text"
                  value={supplierForm.name}
                  onChange={(e) =>
                    setSupplierForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g. City Hardware"
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Contact
                </label>

                <input
                  type="text"
                  value={supplierForm.contact}
                  onChange={(e) =>
                    setSupplierForm((prev) => ({
                      ...prev,
                      contact: e.target.value,
                    }))
                  }
                  placeholder="Phone / contact person"
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Address
                </label>

                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={(e) =>
                    setSupplierForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Supplier address"
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  value={supplierForm.notes}
                  onChange={(e) =>
                    setSupplierForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Optional notes..."
                  className="w-full resize-none rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-700"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => !saving && setIsSupplierModalOpen(false)}
                disabled={saving}
                className="rounded-xl border border-[#c9a77f] px-4 py-2.5 text-sm font-medium text-[#4b2f20] hover:bg-[#fff4df]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void saveSupplier()}
                disabled={saving}
                className="rounded-xl bg-[#4b2f20] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#6e4932] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
