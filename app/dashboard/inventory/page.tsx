"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";

// ============================================================
// TYPES
// ============================================================

type SizeUnit =
  "ft" | "in" | "mm" | "cm" | "m" | "L" | "ml" | "kg" | "g" | "mixed";

type QuantityUnit =
  | "pcs"
  | "sheet"
  | "pair"
  | "set"
  | "box"
  | "roll"
  | "bottle"
  | "can"
  | "tube"
  | "kg"
  | "g"
  | "L"
  | "ml"
  | "sq.ft"
  | "bundle";

type MaterialCategory = {
  id: string;
  label: string;
  table: string;
  icon: string;
  accent: string;
  chip: string;
  defaultSize: string;
  defaultSizeUnit: SizeUnit;
  defaultQuantityUnit: QuantityUnit;
  sizeUnits: SizeUnit[];
  quantityUnits: QuantityUnit[];
  materials: string[];
};

type Supplier = {
  id: string;
  name: string;
  is_active: boolean;
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
  effective_date: string;
  is_active: boolean;
};

type PriceListWithSupplier = PriceListItem & {
  supplier?: Supplier | null;
};

type MaterialItem = {
  id: string;
  category: string;
  name: string;
  size: string;
  size_unit: SizeUnit;
  quantity: number;
  quantity_unit: QuantityUnit;
  minimum_stock: number;
  unit_cost: number;

  // Supplier actually used for this inventory item.
  supplier_id?: string | null;

  created_at?: string;
  updated_at?: string;
};

const MATERIALS_TABLE = "materials";

type DeleteConfirm = { type: "item"; itemId: string } | { type: "all" } | null;

// ============================================================
// CATEGORIES
// ============================================================

const categories: MaterialCategory[] = [
  {
    id: "plywood",
    label: "Plywood",
    table: MATERIALS_TABLE,
    icon: "🪵",
    accent: "from-amber-500 to-orange-500",
    chip: "High-grade panels",
    defaultSize: "4 X 8",
    defaultSizeUnit: "ft",
    defaultQuantityUnit: "sheet",
    sizeUnits: ["ft", "in"],
    quantityUnits: ["sheet", "pcs"],
    materials: ["Marine", "Santa Clara", "Uniply", "Century", "Hardwood"],
  },

  {
    id: "surface-materials",
    label: "Surface Materials",
    table: MATERIALS_TABLE,
    icon: "🧱",
    accent: "from-sky-500 to-cyan-500",
    chip: "Laminates, veneers, and edge bands",
    defaultSize: "4 X 8",
    defaultSizeUnit: "ft",
    defaultQuantityUnit: "sheet",
    sizeUnits: ["ft", "in", "mm", "cm"],
    quantityUnits: ["sheet", "roll", "pcs"],
    materials: [
      "White Melamine Board",
      "PVC Edge Band",
      "Laminate Sheet",
      "Acrylic Board",
    ],
  },

  {
    id: "good-lumber",
    label: "Good Lumber",
    table: MATERIALS_TABLE,
    icon: "🌲",
    accent: "from-emerald-500 to-green-500",
    chip: "Premium boards",
    defaultSize: "2 X 14 X 10",
    defaultSizeUnit: "mixed",
    defaultQuantityUnit: "pcs",
    sizeUnits: ["mixed", "ft", "in", "cm"],
    quantityUnits: ["pcs", "set", "bundle"],
    materials: [
      "Mahogany Board",
      "Narra Board",
      "Yakal Board",
      "Tanguile Board",
    ],
  },

  {
    id: "finishing-materials",
    label: "Finishing Materials",
    table: MATERIALS_TABLE,
    icon: "🎨",
    accent: "from-fuchsia-500 to-violet-500",
    chip: "Finishes and coatings",
    defaultSize: "1",
    defaultSizeUnit: "L",
    defaultQuantityUnit: "can",
    sizeUnits: ["L", "ml"],
    quantityUnits: ["can", "bottle", "tube"],
    materials: [
      "Acrylic Clear Varnish",
      "Wood Stain",
      "Wood Filler",
      "Polyurethane",
    ],
  },

  {
    id: "hardware-accessories",
    label: "Hardware & Accessories",
    table: MATERIALS_TABLE,
    icon: "🔧",
    accent: "from-rose-500 to-pink-500",
    chip: "Hinges, handles, and fittings",
    defaultSize: "1",
    defaultSizeUnit: "mm",
    defaultQuantityUnit: "pair",
    sizeUnits: ["mm", "in"],
    quantityUnits: ["pair", "set", "pcs"],
    materials: [
      "Cabinet Hinge",
      "Door Handle Set",
      "Drawer Slide",
      "Furniture Caster",
    ],
  },

  {
    id: "adhesives-sealants",
    label: "Adhesives & Sealants",
    table: MATERIALS_TABLE,
    icon: "🧴",
    accent: "from-indigo-500 to-purple-500",
    chip: "Adhesives and sealants",
    defaultSize: "1",
    defaultSizeUnit: "L",
    defaultQuantityUnit: "tube",
    sizeUnits: ["L", "ml"],
    quantityUnits: ["tube", "bottle", "can"],
    materials: [
      "Wood Glue",
      "Silicone Sealant",
      "Epoxy Adhesive",
      "Contact Cement",
    ],
  },

  {
    id: "fasteners",
    label: "Fasteners",
    table: MATERIALS_TABLE,
    icon: "🔩",
    accent: "from-yellow-500 to-amber-500",
    chip: "Nails, screws, and bolts",
    defaultSize: "1",
    defaultSizeUnit: "mm",
    defaultQuantityUnit: "box",
    sizeUnits: ["in", "mm"],
    quantityUnits: ["box", "set", "pcs"],
    materials: ["Wood Screws", "Brad Nails", "Bolt and Nut", "Rivet"],
  },

  {
    id: "glass-mirrors",
    label: "Glass & Mirrors",
    table: MATERIALS_TABLE,
    icon: "🪞",
    accent: "from-cyan-500 to-blue-500",
    chip: "Glass and mirror products",
    defaultSize: "5",
    defaultSizeUnit: "mm",
    defaultQuantityUnit: "sq.ft",
    sizeUnits: ["mm", "cm"],
    quantityUnits: ["sq.ft", "pcs"],
    materials: [
      "Tempered Glass",
      "Plain Mirror",
      "Glass Shelf",
      "Mirror Plate",
    ],
  },
];

// ============================================================
// HELPERS
// ============================================================

function toCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatNumberWithCommas(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");

  const [integerPart, decimalPart] = cleaned.split(".");

  const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decimalPart !== undefined
    ? `${formattedInt}.${decimalPart}`
    : formattedInt;
}

function parseNumberString(value: string) {
  const cleaned = value.replace(/,/g, "");

  return cleaned === "" ? 0 : Number(cleaned);
}

// ============================================================
// PAGE
// ============================================================

export default function MaterialsPage() {
  const [activeTab, setActiveTab] = useState(categories[0].id);

  const [items, setItems] = useState<Record<string, MaterialItem[]>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm>(null);

  const [loading, setLoading] = useState(false);

  const [isHydrating, setIsHydrating] = useState(true);

  // ============================================================
  // SUPPLIERS / PRICE LIST
  // ============================================================

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [priceListItems, setPriceListItems] = useState<PriceListWithSupplier[]>(
    [],
  );

  const [loadingPrices, setLoadingPrices] = useState(false);

  const [priceListMaterials, setPriceListMaterials] = useState<string[]>([]);

  const [loadingMaterials, setLoadingMaterials] = useState(false);

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");

  // ============================================================
  // FORM
  // ============================================================

  const [form, setForm] = useState({
    name: categories[0].materials[0],
    size: categories[0].defaultSize,
    size_unit: categories[0].defaultSizeUnit,
    quantity: "",
    quantity_unit: categories[0].defaultQuantityUnit,
    minimum_stock: "2",
    unit_cost: "",
    supplier_id: "",
  });

  const activeCategory =
    categories.find((category) => category.id === activeTab) ?? categories[0];

  const currentItems = items[activeTab] ?? [];

  // ============================================================
  // TOTALS
  // ============================================================

  const totalValue = currentItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_cost,
    0,
  );

  const allCategoriesTotal = categories.reduce((sum, category) => {
    const categoryItems = items[category.id] ?? [];

    return (
      sum +
      categoryItems.reduce(
        (categorySum, item) => categorySum + item.quantity * item.unit_cost,
        0,
      )
    );
  }, 0);

  const totalCost =
    parseNumberString(form.quantity) * parseNumberString(form.unit_cost);

  const totalCostDisplay = Number.isFinite(totalCost)
    ? toCurrency(totalCost)
    : toCurrency(0);

  // ============================================================
  // LOAD MATERIALS
  // ============================================================

  useEffect(() => {
    const loadMaterials = async () => {
      setIsHydrating(true);

      const { data, error } = await supabase
        .from(MATERIALS_TABLE)
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Supabase fetch error:", error);

        setIsHydrating(false);
        return;
      }

      const grouped: Record<string, MaterialItem[]> = {};

      for (const category of categories) {
        grouped[category.id] = [];
      }

      for (const item of data ?? []) {
        const material = item as MaterialItem;

        if (!grouped[material.category]) {
          grouped[material.category] = [];
        }

        grouped[material.category].push({
          ...material,
          quantity: Number(material.quantity),
          minimum_stock: Number(material.minimum_stock),
          unit_cost: Number(material.unit_cost),
        });
      }

      setItems(grouped);

      setIsHydrating(false);
    };

    void loadMaterials();
  }, []);

  // ============================================================
  // LOAD SUPPLIERS
  // ============================================================

  useEffect(() => {
    const loadSuppliers = async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, name, is_active")
        .eq("is_active", true)
        .order("name", {
          ascending: true,
        });

      if (error) {
        console.error("Supplier loading error:", error);

        return;
      }

      setSuppliers((data ?? []) as Supplier[]);
    };

    void loadSuppliers();
  }, []);

  // ============================================================
  // RESET FORM WHEN CATEGORY CHANGES
  // ============================================================

  useEffect(() => {
    setPriceListItems([]);

    setPriceListMaterials([]);

    setSelectedSupplierId("");

    setForm({
      name: "",

      size: activeCategory.defaultSize,

      size_unit: activeCategory.defaultSizeUnit,

      quantity: "",

      quantity_unit: activeCategory.defaultQuantityUnit,

      minimum_stock: "2",

      unit_cost: "",

      supplier_id: "",
    });
  }, [activeCategory]);

  // ============================================================
  // PRICE LIST MATCHING
  // ============================================================

  const isSameText = (
    a: string | null | undefined,
    b: string | null | undefined,
  ) => {
    return (a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase();
  };

  const isPriceMatch = (price: PriceListWithSupplier) => {
    /*
     * Category must match either:
     *
     * - category id
     * - category label
     *
     * This gives you flexibility in the Price List page.
     */

    const categoryMatches =
      isSameText(price.category, activeCategory.id) ||
      isSameText(price.category, activeCategory.label);

    if (!categoryMatches) {
      return false;
    }

    // Item name must match.
    if (!isSameText(price.item_name, form.name)) {
      return false;
    }

    // Quantity unit must match.
    if (!isSameText(price.quantity_unit, form.quantity_unit)) {
      return false;
    }

    /*
     * Size unit must match when a size unit
     * exists in the price list.
     */
    if (price.size_unit && !isSameText(price.size_unit, form.size_unit)) {
      return false;
    }

    /*
     * If Price List contains a size,
     * match it with the inventory size.
     *
     * If Price List size is NULL/empty,
     * treat it as a general price.
     */
    if (price.size && !isSameText(price.size, form.size)) {
      return false;
    }

    return true;
  };

  // ============================================================
  // LOAD MATERIAL NAMES FROM PRICE LIST
  // ============================================================

  const loadPriceListMaterials = async (category: MaterialCategory) => {
    setLoadingMaterials(true);

    try {
      /*
       * Your price_list_items.category can contain
       * either:
       *
       *   plywood
       *
       * or:
       *
       *   Plywood
       *
       * so we first retrieve the category.
       */

      const { data, error } = await supabase
        .from("price_list_items")
        .select("item_name, category")
        .eq("is_active", true);

      if (error) {
        console.error("Failed to load price list materials:", error);

        setPriceListMaterials([]);

        return;
      }

      const materialNames = [
        ...new Set(
          (data ?? [])
            .filter((item) => {
              const itemCategory = String(item.category ?? "")
                .trim()
                .toLowerCase();

              const selectedCategoryId = category.id.trim().toLowerCase();

              const selectedCategoryLabel = category.label.trim().toLowerCase();

              return (
                itemCategory === selectedCategoryId ||
                itemCategory === selectedCategoryLabel
              );
            })
            .map((item) => String(item.item_name ?? "").trim())
            .filter(Boolean),
        ),
      ];

      setPriceListMaterials(materialNames);

      /*
       * If the current material is not available
       * in the selected category's price list,
       * automatically use the first available
       * price-list material.
       */

      setForm((prev) => {
        const currentStillExists = materialNames.some(
          (name) => name.toLowerCase() === prev.name.trim().toLowerCase(),
        );

        return {
          ...prev,
          name: currentStillExists ? prev.name : (materialNames[0] ?? ""),
          unit_cost: "",
          supplier_id: "",
        };
      });

      setSelectedSupplierId("");

      setPriceListItems([]);
    } catch (error) {
      console.error("Unexpected error loading price list materials:", error);

      setPriceListMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  // ============================================================
  // LOAD PRICE LIST
  // ============================================================

  const loadPriceList = async (materialName: string) => {
    if (!materialName.trim()) {
      setPriceListItems([]);
      setSelectedSupplierId("");

      return;
    }

    setLoadingPrices(true);

    try {
      const { data, error } = await supabase
        .from("price_list_items")
        .select(
          `
          id,
          supplier_id,
          category,
          item_name,
          size,
          size_unit,
          quantity_unit,
          unit_price,
          effective_date,
          is_active
        `,
        )
        .eq("is_active", true)
        .ilike("item_name", materialName.trim())
        .order("unit_price", {
          ascending: true,
        });

      if (error) {
        console.error("Price list loading error:", error);

        setPriceListItems([]);

        return;
      }

      const rawPrices = (data ?? []) as PriceListItem[];

      const supplierIds = [
        ...new Set(rawPrices.map((price) => price.supplier_id)),
      ];

      let supplierMap = new Map<string, Supplier>();

      if (supplierIds.length > 0) {
        const { data: supplierData, error: supplierError } = await supabase
          .from("suppliers")
          .select("id, name, is_active")
          .in("id", supplierIds);

        if (supplierError) {
          console.error("Supplier lookup error:", supplierError);
        } else {
          supplierMap = new Map(
            (supplierData ?? []).map((supplier) => [
              supplier.id,
              supplier as Supplier,
            ]),
          );
        }
      }

      const normalized = rawPrices
        .map((price) => ({
          ...price,

          unit_price: Number(price.unit_price),

          supplier: supplierMap.get(price.supplier_id) ?? null,
        }))
        .filter(isPriceMatch);

      setPriceListItems(normalized);

      /*
       * IMPORTANT:
       *
       * Never automatically choose
       * the cheapest supplier.
       */
      setSelectedSupplierId("");

      setForm((prev) => ({
        ...prev,
        unit_cost: "",
        supplier_id: "",
      }));
    } catch (error) {
      console.error("Unexpected price list error:", error);

      setPriceListItems([]);

      setSelectedSupplierId("");
    } finally {
      setLoadingPrices(false);
    }
  };

  // ============================================================
  // WHEN FORM MATCHING FIELDS CHANGE,
  // REFRESH PRICE LIST
  // ============================================================

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    if (!form.name.trim()) {
      setPriceListItems([]);
      setSelectedSupplierId("");

      return;
    }

    const timer = window.setTimeout(() => {
      void loadPriceList(form.name);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [isModalOpen, form.name, form.size, form.size_unit, form.quantity_unit]);

  // ============================================================
  // RESET MODAL
  // ============================================================

  const resetModal = () => {
    setIsModalOpen(false);

    setIsEditMode(false);

    setEditingItemId(null);

    setPriceListItems([]);

    setSelectedSupplierId("");

    setForm({
      name: activeCategory.materials[0],
      size: activeCategory.defaultSize,
      size_unit: activeCategory.defaultSizeUnit,
      quantity: "",
      quantity_unit: activeCategory.defaultQuantityUnit,
      minimum_stock: "2",
      unit_cost: "",
      supplier_id: "",
    });

    setLoading(false);
  };

  // ============================================================
  // OPEN ADD MODAL
  // ============================================================

  const handleOpenModal = () => {
    setIsEditMode(false);

    setEditingItemId(null);

    setPriceListItems([]);

    setPriceListMaterials([]);

    setSelectedSupplierId("");

    setForm({
      /*
       * Start empty because the material names
       * will come from price_list_items.
       */
      name: "",

      size: activeCategory.defaultSize,

      size_unit: activeCategory.defaultSizeUnit,

      quantity: "",

      quantity_unit: activeCategory.defaultQuantityUnit,

      minimum_stock: "2",

      unit_cost: "",

      supplier_id: "",
    });

    setIsModalOpen(true);

    /*
     * Fetch materials belonging to the
     * currently selected category.
     */
    void loadPriceListMaterials(activeCategory);
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const handleOpenEditModal = (item: MaterialItem) => {
    setIsEditMode(true);

    setEditingItemId(item.id);

    setSelectedSupplierId(item.supplier_id ?? "");

    setForm({
      name: item.name,
      size: item.size,
      size_unit: item.size_unit,
      quantity: item.quantity.toString(),
      quantity_unit: item.quantity_unit,
      minimum_stock: item.minimum_stock.toString(),
      unit_cost: item.unit_cost.toString(),
      supplier_id: item.supplier_id ?? "",
    });

    setIsModalOpen(true);
  };

  // ============================================================
  // SUPABASE SAVE
  // ============================================================

  const saveToSupabase = async (
    action: "insert" | "update" | "deleteAll" | "deleteOne",
    payload?: Partial<MaterialItem> & {
      id?: string;
    },
  ) => {
    // ----------------------------------------------------------
    // INSERT
    // ----------------------------------------------------------

    if (action === "insert" && payload) {
      const { error } = await supabase.from(MATERIALS_TABLE).insert({
        category: payload.category,
        name: payload.name,
        size: payload.size,
        size_unit: payload.size_unit,
        quantity: payload.quantity,
        quantity_unit: payload.quantity_unit,
        minimum_stock: payload.minimum_stock ?? 2,
        unit_cost: payload.unit_cost,

        /*
         * The actual supplier chosen
         * when purchasing this inventory.
         */
        supplier_id: payload.supplier_id ?? null,
      });

      if (error) {
        console.error("Supabase INSERT error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        throw new Error(error.message);
      }

      return;
    }

    // ----------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------

    if (action === "update" && payload?.id) {
      const { error } = await supabase
        .from(MATERIALS_TABLE)
        .update({
          category: payload.category,
          name: payload.name,
          size: payload.size,
          size_unit: payload.size_unit,
          quantity: payload.quantity,
          quantity_unit: payload.quantity_unit,
          minimum_stock: payload.minimum_stock,
          unit_cost: payload.unit_cost,

          supplier_id: payload.supplier_id ?? null,

          updated_at: new Date().toISOString(),
        })
        .eq("id", payload.id);

      if (error) {
        console.error("Supabase UPDATE error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        throw new Error(error.message);
      }

      return;
    }

    // ----------------------------------------------------------
    // DELETE ALL
    // ----------------------------------------------------------

    if (action === "deleteAll") {
      const { error } = await supabase
        .from(MATERIALS_TABLE)
        .delete()
        .eq("category", activeTab);

      if (error) {
        console.error("Supabase DELETE ALL error:", error);

        throw new Error(error.message);
      }

      return;
    }

    // ----------------------------------------------------------
    // DELETE ONE
    // ----------------------------------------------------------

    if (action === "deleteOne" && payload?.id) {
      const { error } = await supabase
        .from(MATERIALS_TABLE)
        .delete()
        .eq("id", payload.id);

      if (error) {
        console.error("Supabase DELETE error:", error);

        throw new Error(error.message);
      }
    }
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    if (!form.quantity) {
      return;
    }

    if (!form.unit_cost) {
      return;
    }

    /*
     * If supplier prices exist, require the owner
     * to explicitly choose one.
     *
     * This prevents accidental selection.
     */

    if (priceListItems.length > 0 && !selectedSupplierId) {
      alert("Please select the supplier you want to purchase from.");

      return;
    }

    setLoading(true);

    try {
      const quantity = parseNumberString(form.quantity);

      const unitCost = parseNumberString(form.unit_cost);

      const minimumStock = parseNumberString(form.minimum_stock);

      if (quantity < 0 || unitCost < 0 || minimumStock < 0) {
        throw new Error(
          "Quantity, minimum stock, and unit cost cannot be negative.",
        );
      }

      // --------------------------------------------------------
      // EDIT
      // --------------------------------------------------------

      if (isEditMode && editingItemId) {
        const existingItem = currentItems.find(
          (item) => item.id === editingItemId,
        );

        const updatedItem: MaterialItem = {
          id: editingItemId,

          category: activeTab,

          name: form.name.trim(),

          size: form.size.trim() || activeCategory.defaultSize,

          size_unit: form.size_unit,

          quantity,

          quantity_unit: form.quantity_unit,

          minimum_stock: minimumStock,

          unit_cost: unitCost,

          supplier_id: selectedSupplierId || null,

          created_at: existingItem?.created_at,

          updated_at: new Date().toISOString(),
        };

        await saveToSupabase("update", updatedItem);

        setItems((prev) => ({
          ...prev,

          [activeTab]: (prev[activeTab] ?? []).map((item) =>
            item.id === editingItemId ? updatedItem : item,
          ),
        }));
      }

      // --------------------------------------------------------
      // INSERT
      // --------------------------------------------------------
      else {
        /*
         * Supabase creates the UUID.
         */

        const newItem: Omit<MaterialItem, "id"> = {
          category: activeTab,

          name: form.name.trim(),

          size: form.size.trim() || activeCategory.defaultSize,

          size_unit: form.size_unit,

          quantity,

          quantity_unit: form.quantity_unit,

          minimum_stock: minimumStock,

          unit_cost: unitCost,

          supplier_id: selectedSupplierId || null,
        };

        const { data, error } = await supabase
          .from(MATERIALS_TABLE)
          .insert(newItem)
          .select()
          .single();

        if (error) {
          console.error("Supabase INSERT error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });

          throw new Error(error.message);
        }

        const insertedItem = data as MaterialItem;

        setItems((prev) => ({
          ...prev,

          [activeTab]: [insertedItem, ...(prev[activeTab] ?? [])],
        }));
      }

      resetModal();
    } catch (error) {
      console.error("Failed to save material:", error);

      alert(
        error instanceof Error ? error.message : "Failed to save material.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const deleteItem = async (itemId: string) => {
    setItems((prev) => ({
      ...prev,

      [activeTab]: (prev[activeTab] ?? []).filter((item) => item.id !== itemId),
    }));

    await saveToSupabase("deleteOne", {
      id: itemId,
    });
  };

  const deleteAllConfirmed = async () => {
    setItems((prev) => ({
      ...prev,

      [activeTab]: [],
    }));

    await saveToSupabase("deleteAll");
  };

  const openDeleteItemConfirm = (itemId: string) => {
    setDeleteConfirm({
      type: "item",
      itemId,
    });
  };

  const openDeleteAllConfirm = () => {
    if (!currentItems.length) {
      return;
    }

    setDeleteConfirm({
      type: "all",
    });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm(null);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) {
      return;
    }

    if (deleteConfirm.type === "item") {
      await deleteItem(deleteConfirm.itemId);
    }

    if (deleteConfirm.type === "all") {
      await deleteAllConfirmed();
    }

    closeDeleteConfirm();
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,246,232,0.95),_rgba(245,233,211,1))] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <section className="rounded-3xl border border-amber-200 bg-[rgba(255,250,241,0.95)] p-6 shadow-[0_25px_80px_-30px_rgba(92,64,51,0.15)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
                Materials Module
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Inventory made elegant
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Add, manage, and organize plywood, surface materials, lumber,
                finishes, accessories, adhesives, fasteners, and glass in one
                place.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[auto_auto]">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-700">
                  {activeCategory.label}
                </p>

                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {currentItems.length} item
                  {currentItems.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-700">
                  All categories total
                </p>

                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {toCurrency(allCategoriesTotal)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            CATEGORY CARDS
        ====================================================== */}

        <section className="grid gap-4 md:grid-cols-4">
          {categories.map((category) => {
            const categoryItems = items[category.id] ?? [];

            const count = categoryItems.length;

            const value = categoryItems.reduce(
              (sum, item) => sum + item.quantity * item.unit_cost,
              0,
            );

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveTab(category.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  activeTab === category.id
                    ? "border-amber-500 bg-amber-100 text-amber-900 shadow-lg"
                    : "border-amber-200 bg-[rgba(255,248,239,0.95)] text-slate-800 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{category.icon}</span>

                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-900">
                    {category.chip}
                  </span>
                </div>

                <h2 className="mt-4 text-lg font-semibold">{category.label}</h2>

                <p className="mt-1 text-sm opacity-80">
                  {count} item
                  {count === 1 ? "" : "s"}
                </p>

                <p className="mt-3 text-sm font-medium text-amber-900">
                  {toCurrency(value)}
                </p>
              </button>
            );
          })}
        </section>

        {/* =====================================================
            INVENTORY
        ====================================================== */}

        <section className="rounded-3xl border border-amber-200 bg-[rgba(255,248,239,0.95)] p-5 shadow-[0_20px_60px_-30px_rgba(92,64,51,0.15)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div
                className={`inline-flex rounded-full bg-gradient-to-r ${activeCategory.accent} px-3 py-1 text-sm font-medium text-white`}
              >
                {activeCategory.label}
              </div>

              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                {activeCategory.label} Inventory
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Add new items and keep your stock values organized.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openDeleteAllConfirm}
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-900 transition hover:bg-amber-100"
              >
                Delete All
              </button>

              <button
                type="button"
                onClick={handleOpenModal}
                className="rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600"
              >
                + Add Item
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-700">Current stock items</p>

              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {currentItems.length}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-700">
                Estimated inventory value
              </p>

              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {toCurrency(totalValue)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            {isHydrating ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center text-sm text-slate-600">
                Loading materials from Supabase...
              </div>
            ) : currentItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-10 text-center">
                <p className="text-lg font-semibold text-slate-900">
                  No items in this category yet.
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  Start by adding a new item using the button above.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {currentItems.map((item) => {
                  const inventoryValue = item.quantity * item.unit_cost;

                  const supplierName = suppliers.find(
                    (supplier) => supplier.id === item.supplier_id,
                  )?.name;

                  return (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-amber-200 bg-[rgba(255,248,239,0.95)] p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-amber-700">
                            {activeCategory.label}
                          </p>

                          <h3 className="mt-1 text-lg font-semibold text-slate-900">
                            {item.name}
                          </h3>

                          {item.quantity === 0 ? (
                            <p className="mt-2 text-sm font-medium text-rose-600">
                              🔴 Out of Stock
                            </p>
                          ) : item.quantity <= item.minimum_stock ? (
                            <p className="mt-2 text-sm font-medium text-amber-700">
                              ⚠️ Low Stock
                            </p>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="rounded-full bg-amber-100 p-2 text-amber-900 transition hover:bg-amber-200"
                            title="Edit item"
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteItemConfirm(item.id)}
                            className="rounded-full bg-amber-100 p-2 text-amber-900 transition hover:bg-amber-200"
                            title="Delete item"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Size</span>

                          <span className="font-medium text-slate-900">
                            {item.size} {item.size_unit}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Quantity</span>

                          <span className="font-medium text-slate-900">
                            {item.quantity} {item.quantity_unit}
                          </span>
                        </div>

                        {supplierName && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Supplier</span>

                            <span className="font-medium text-slate-900">
                              {supplierName}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-amber-200 pt-3">
                          <span className="text-slate-500">Unit Cost</span>

                          <span className="font-semibold text-slate-900">
                            {toCurrency(item.unit_cost)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">
                            Inventory Value
                          </span>

                          <span className="font-semibold text-slate-900">
                            {toCurrency(inventoryValue)}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* =======================================================
          ADD / EDIT MODAL
      ======================================================== */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-amber-200 bg-[rgba(255,248,239,0.98)] p-6 shadow-2xl">
            {/* HEADER */}

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-amber-900">
                  {isEditMode ? "Edit item" : "Add new item"}
                </p>

                <h3 className="mt-1 text-2xl font-semibold text-slate-900">
                  {activeCategory.label}
                </h3>
              </div>

              <button
                type="button"
                onClick={resetModal}
                className="rounded-full bg-amber-100 p-2 text-amber-900 transition hover:bg-amber-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* =================================================
                  MATERIAL
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Material
                </label>

                <select
                  required
                  value={form.name}
                  disabled={loadingMaterials || priceListMaterials.length === 0}
                  onChange={(e) => {
                    const materialName = e.target.value;

                    /*
                     * Clear the previous supplier and
                     * price whenever material changes.
                     */

                    setSelectedSupplierId("");

                    setForm((prev) => ({
                      ...prev,
                      name: materialName,
                      unit_cost: "",
                      supplier_id: "",
                    }));

                    /*
                     * loadPriceList will be triggered
                     * automatically by the useEffect
                     * watching form.name.
                     */
                  }}
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-900 disabled:cursor-not-allowed disabled:bg-amber-50"
                >
                  {loadingMaterials ? (
                    <option value="">Loading materials...</option>
                  ) : priceListMaterials.length === 0 ? (
                    <option value="">No materials in Price List</option>
                  ) : (
                    <>
                      <option value="">Select material</option>

                      {priceListMaterials.map((material) => (
                        <option key={material} value={material}>
                          {material}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* =================================================
                  SIZE
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Size
                </label>

                <div className="grid grid-cols-[1fr_120px] gap-2">
                  <input
                    required
                    value={form.size}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        size: e.target.value,
                        unit_cost: "",
                        supplier_id: "",
                      }))
                    }
                    placeholder={
                      activeCategory.id === "good-lumber"
                        ? `e.g. 2" x 5" x 7'`
                        : `e.g. ${activeCategory.defaultSize}`
                    }
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 text-sm outline-none transition focus:border-amber-900"
                  />

                  <select
                    value={form.size_unit}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        size_unit: e.target.value as SizeUnit,
                        unit_cost: "",
                        supplier_id: "",
                      }))
                    }
                    className="w-full rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-amber-900"
                  >
                    {activeCategory.sizeUnits.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* =================================================
                  QUANTITY
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Quantity
                </label>

                <div className="grid grid-cols-[1fr_120px] gap-2">
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                    placeholder="e.g. 20"
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 text-sm outline-none transition focus:border-amber-900"
                  />

                  <select
                    value={form.quantity_unit}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        quantity_unit: e.target.value as QuantityUnit,
                        unit_cost: "",
                        supplier_id: "",
                      }))
                    }
                    className="w-full rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-amber-900"
                  >
                    {activeCategory.quantityUnits.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* =================================================
                  SUPPLIER PRICE COMPARISON
              ================================================== */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Supplier Prices
                  </label>

                  {loadingPrices && (
                    <span className="text-xs text-amber-700">
                      Checking prices...
                    </span>
                  )}
                </div>

                {loadingPrices ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-600">
                    Loading supplier prices...
                  </div>
                ) : priceListItems.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-slate-800">
                      No matching supplier price found.
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      You can still enter the unit cost manually.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {priceListItems.map((price) => {
                      const cheapestPrice = Math.min(
                        ...priceListItems.map((item) =>
                          Number(item.unit_price),
                        ),
                      );

                      const isCheapest =
                        Number(price.unit_price) === cheapestPrice;

                      const isSelected =
                        selectedSupplierId === price.supplier_id;

                      return (
                        <button
                          key={price.id}
                          type="button"
                          onClick={() => {
                            /*
                             * THIS is the
                             * important behavior:
                             *
                             * The owner
                             * explicitly
                             * chooses the
                             * supplier.
                             */

                            setSelectedSupplierId(price.supplier_id);

                            setForm((prev) => ({
                              ...prev,
                              supplier_id: price.supplier_id,
                              unit_cost: Number(price.unit_price).toString(),
                            }));
                          }}
                          className={`w-full rounded-xl border p-4 text-left transition ${
                            isSelected
                              ? "border-amber-500 bg-amber-100 ring-2 ring-amber-200"
                              : "border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-slate-900">
                                  {price.supplier?.name ?? "Unknown Supplier"}
                                </p>

                                {isCheapest && (
                                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                    🟢 Cheapest
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {price.quantity_unit}

                                {price.size
                                  ? ` • ${price.size} ${price.size_unit ?? ""}`
                                  : ""}
                              </p>

                              <p className="mt-1 text-[11px] text-slate-400">
                                Price date: {price.effective_date}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-bold text-slate-900">
                                {toCurrency(Number(price.unit_price))}
                              </p>

                              <p className="text-[11px] text-slate-500">
                                per {price.quantity_unit}
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="mt-3 rounded-lg bg-amber-200 px-3 py-2 text-xs font-semibold text-amber-900">
                              ✓ Selected supplier
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* =================================================
                  UNIT COST
              ================================================== */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Unit Cost (PHP)
                  </label>

                  {selectedSupplierId && (
                    <span className="text-xs font-medium text-emerald-700">
                      ✓ From selected supplier
                    </span>
                  )}
                </div>

                <input
                  required
                  type="text"
                  inputMode="decimal"
                  value={form.unit_cost}
                  onChange={(e) => {
                    const rawValue = e.target.value;

                    const cleaned = rawValue.replace(/[^0-9.]/g, "");

                    const formatted = formatNumberWithCommas(cleaned);

                    /*
                     * If owner manually
                     * changes price,
                     * remove supplier
                     * selection because
                     * the entered price
                     * is no longer the
                     * selected supplier
                     * price.
                     */

                    setSelectedSupplierId("");

                    setForm((prev) => ({
                      ...prev,
                      unit_cost: formatted,
                      supplier_id: "",
                    }));
                  }}
                  placeholder="e.g. 950"
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-900"
                />

                {priceListItems.length > 0 && !selectedSupplierId && (
                  <p className="mt-1 text-xs text-amber-700">
                    Select a supplier above, or enter your actual purchase price
                    manually.
                  </p>
                )}
              </div>

              {/* =================================================
                  TOTAL COST
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Total Cost
                </label>

                <input
                  type="text"
                  readOnly
                  value={totalCostDisplay}
                  className="w-full cursor-not-allowed rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Quantity × Unit Cost
                </p>
              </div>

              {/* =================================================
                  BUTTONS
              ================================================== */}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetModal}
                  className="rounded-xl border border-amber-200 px-4 py-2.5 text-sm font-medium text-amber-900 transition hover:bg-amber-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    (priceListItems.length > 0 && !selectedSupplierId)
                  }
                  className="rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading
                    ? "Saving..."
                    : isEditMode
                      ? "Update Item"
                      : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          DELETE CONFIRMATION
      ======================================================== */}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                Confirmation
              </p>

              <h3 className="mt-3 text-2xl font-semibold text-slate-900">
                {deleteConfirm.type === "all"
                  ? "Delete all items?"
                  : "Delete this item?"}
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                {deleteConfirm.type === "all"
                  ? "This will remove every item in the current category."
                  : "This action cannot be undone for the selected item."}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                className="rounded-xl border border-amber-200 px-4 py-2.5 text-sm font-medium text-amber-900 transition hover:bg-amber-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
