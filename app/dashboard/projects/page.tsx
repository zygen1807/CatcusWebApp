"use client";

<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaEye,
  FaCouch,
  FaArrowLeft,
  FaCalendarAlt,
  FaImage,
  FaSpinner,
  FaCube,
  FaCheck,
  FaFilter,
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";

type Material = {
  id: string;
  name: string;
  category: string;
  size: string;
  size_unit: string;
  quantity: number;
  quantity_unit: string;
  unit_cost: number;
  minimum_stock?: number;
  supplier_id?: string | null;
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
  price_basis?: string | null;
  price_per_board_foot?: number | null;
  calculated_board_feet?: number | null;
};

type FinishedProject = {
  id: string;
  title: string;
  category: string;
  customer_name: string;
  price: number;
  finish_date: string;
  dimension_unit: "ft" | "cm" | "inch";
  dimensions: Dimensions;
  material_ids: string[];
  image_url: string | null;
  created_at: string;
};

const MATERIALS_TABLE = "materials";
const PRICE_TABLE = "price_list_items";
const SUPPLIERS_TABLE = "suppliers";
const FINISHED_TABLE = "finished_projects";
const PROJECT_DESIGN_BUCKET = "project-designs";

type Dimensions = {
  overall_width: string;
  overall_height: string;
  overall_depth: string;

  partition_width: string;
  partition_height: string;
  partition_thickness: string;

  shelf_width: string;
  shelf_height: string;
  shelf_depth: string;
  shelf_thickness: string;
  number_of_shelves: string;

  door_width: string;
  door_height: string;
  door_depth: string;
  door_thickness: string;
  number_of_doors: string;

  drawer_width: string;
  drawer_height: string;
  drawer_depth: string;
  number_of_drawers: string;

  tabletop_width: string;
  tabletop_height: string;
  tabletop_depth: string;
  tabletop_thickness: string;

  leg_width: string;
  leg_height: string;
  leg_depth: string;
  number_of_legs: string;

  seat_width: string;
  seat_height: string;
  seat_depth: string;

  back_width: string;
  back_height: string;
  back_depth: string;

  headboard_width: string;
  headboard_height: string;
  headboard_depth: string;

  back_panel_thickness: string;
  toe_kick_height: string;

  project?: {
    material_requirements?: MaterialRequirement[];
    labor?: number;
    material_cost?: number;
    shortage_cost?: number;
    total_cost?: number;
    furniture_type?: string;
  };
};

type MaterialRequirement = {
  material_id: string;
  quantity: number;
  quantity_unit: string;
  purchase_price_item_id?: string | null;
  material_name?: string | null;
  material_category?: string | null;
  material_size?: string | null;
  material_size_unit?: string | null;
};

type Toast = {
  tone: "success" | "error" | "info";
  message: string;
};

const furnitureTypes: Record<string, string[]> = {
  Cabinet: [
    "Clothes Cabinet",
    "Kitchen Cabinet",
    "TV Cabinet",
    "Shoe Cabinet",
    "Storage Cabinet",
    "Wall Cabinet",
  ],
  Door: [
    "Panel Door",
    "Flush Door",
    "Double Door",
    "Sliding Door",
    "Cabinet Door",
  ],
  Bed: ["Single Bed", "Double Bed", "Queen Bed", "King Bed", "Bunk Bed"],
  Table: [
    "Dining Table",
    "Office Table",
    "Study Table",
    "Center Table",
    "Work Table",
  ],
  Chair: ["Dining Chair", "Office Chair", "Lounge Chair", "Bench"],
  Desk: ["Office Desk", "Computer Desk", "Study Desk", "Reception Desk"],
  Shelf: ["Bookshelf", "Display Shelf", "Wall Shelf", "Storage Shelf"],
  Counter: ["Kitchen Counter", "Reception Counter", "Bar Counter"],
  Dresser: ["Bedroom Dresser", "Drawer Dresser", "Vanity Dresser"],
  Other: ["Custom Furniture"],
};

const furnitureCategories = Object.keys(furnitureTypes);

const materialCategories = [
  "Plywood",
  "Surface Materials",
  "Good Lumber",
  "Finishing Materials",
  "Hardware & Accessories",
  "Adhesives & Sealants",
  "Fasteners",
  "Glass & Mirrors",
  "Upholstery",
] as const;

const defaultDimensions: Dimensions = {
  overall_width: "",
  overall_height: "",
  overall_depth: "",
  partition_width: "",
  partition_height: "",
  partition_thickness: "",
  shelf_width: "",
  shelf_height: "",
  shelf_depth: "",
  shelf_thickness: "",
  number_of_shelves: "",
  door_width: "",
  door_height: "",
  door_depth: "",
  door_thickness: "",
  number_of_doors: "",
  drawer_width: "",
  drawer_height: "",
  drawer_depth: "",
  number_of_drawers: "",
  tabletop_width: "",
  tabletop_height: "",
  tabletop_depth: "",
  tabletop_thickness: "",
  leg_width: "",
  leg_height: "",
  leg_depth: "",
  number_of_legs: "",
  seat_width: "",
  seat_height: "",
  seat_depth: "",
  back_width: "",
  back_height: "",
  back_depth: "",
  headboard_width: "",
  headboard_height: "",
  headboard_depth: "",
  back_panel_thickness: "",
  toe_kick_height: "",
};

const money = (value: number) =>
  `₱${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const num = (value: string | number | null | undefined) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

function normalizeCategory(value: string | null | undefined) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getProjectMeta(dimensions?: Dimensions) {
  return dimensions?.project ?? {};
}

function formatMoneyInput(value: string | number): string {
  const raw = String(value ?? "")
    .replace(/,/g, "")
    .replace(/^0+(?=\d)/, "");
  if (!raw) return "";
  const [whole, decimal] = raw.split(".");
  const formattedWhole = Number(whole || "0").toLocaleString("en-PH");
  return decimal !== undefined
    ? `${formattedWhole}.${decimal}`
    : formattedWhole;
}

function parseMoneyInput(value: string): number {
  return num(String(value ?? "").replace(/,/g, ""));
}

export default function Page() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [materials, setMaterials] = useState<Material[]>([]);
  const [priceItems, setPriceItems] = useState<PriceListItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [finishedProjects, setFinishedProjects] = useState<FinishedProject[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<FinishedProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FinishedProject | null>(
    null,
  );
  const [selectedCategoryCard, setSelectedCategoryCard] = useState("All");

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [materialFilter, setMaterialFilter] = useState<string>(
    materialCategories[0],
  );

  const [form, setForm] = useState({
    customerName: "",
    title: "Clothes Cabinet",
    category: "Cabinet",
    material_requirements: [] as MaterialRequirement[],
    image: null as File | null,
    dimensions: { ...defaultDimensions },
    dimensionUnit: "inch" as "ft" | "cm" | "inch",
    finishDate: "",
    labor: 0,
  });

  function showToast(nextToast: Toast) {
    setToast(nextToast);
  }

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    try {
      const [
        materialsResponse,
        priceResponse,
        supplierResponse,
        finishedResponse,
      ] = await Promise.all([
        supabase
          .from(MATERIALS_TABLE)
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from(PRICE_TABLE)
          .select("*")
          .eq("is_active", true)
          .order("effective_date", { ascending: false }),

        supabase
          .from(SUPPLIERS_TABLE)
          .select("*")
          .order("name", { ascending: true }),

        supabase
          .from(FINISHED_TABLE)
          .select("*")
          .order("finish_date", { ascending: false }),
      ]);

      if (materialsResponse.error) {
        console.error("Materials fetch error:", materialsResponse.error);
      } else {
        setMaterials((materialsResponse.data ?? []) as Material[]);
      }

      if (priceResponse.error) {
        console.error("Price list fetch error:", priceResponse.error);
      } else {
        setPriceItems(
          (priceResponse.data ?? []).map((item) => ({
            ...(item as PriceListItem),
            unit_price: Number(item.unit_price),
          })),
        );
      }

      if (supplierResponse.error) {
        console.error("Supplier fetch error:", supplierResponse.error);
      } else {
        setSuppliers((supplierResponse.data ?? []) as Supplier[]);
      }

      if (finishedResponse.error) {
        console.error("Finished projects fetch error:", finishedResponse.error);
      } else {
        setFinishedProjects(
          (finishedResponse.data ?? []).map((item) => ({
            ...(item as FinishedProject),
            price: Number(item.price),
          })),
        );
      }
    } catch (error) {
      console.error("Load projects error:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredFinishedProjects = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return finishedProjects.filter((project) => {
      const matchesSearch =
        !searchValue ||
        `${project.title} ${project.category} ${project.customer_name}`
          .toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        categoryFilter === "All" ||
        normalizeCategory(project.category) ===
          normalizeCategory(categoryFilter);

      return matchesSearch && matchesCategory;
    });
  }, [finishedProjects, search, categoryFilter]);

  const categoryCardProjects = useMemo(() => {
    if (selectedCategoryCard === "All") return filteredFinishedProjects;

    return filteredFinishedProjects.filter(
      (project) =>
        normalizeCategory(project.category) ===
        normalizeCategory(selectedCategoryCard),
    );
  }, [filteredFinishedProjects, selectedCategoryCard]);

  const categoryCounts = useMemo(() => {
    return furnitureCategories.reduce<Record<string, number>>(
      (counts, category) => {
        counts[category] = finishedProjects.filter(
          (project) =>
            normalizeCategory(project.category) === normalizeCategory(category),
        ).length;
        return counts;
      },
      {},
    );
  }, [finishedProjects]);

  const filteredPriceItems = useMemo(
    () =>
      priceItems.filter(
        (item) =>
          normalizeCategory(item.category) ===
          normalizeCategory(materialFilter),
      ),
    [priceItems, materialFilter],
  );

  const selectedRequirements = form.material_requirements;

  const materialCost = useMemo(() => {
    return selectedRequirements.reduce((total, requirement) => {
      const priceItem = priceItems.find(
        (item) => item.id === requirement.material_id,
      );

      if (!priceItem) return total;

      return total + num(priceItem.unit_price) * num(requirement.quantity);
    }, 0);
  }, [selectedRequirements, priceItems]);

  const totalCost = materialCost + num(form.labor);

  function resetForm() {
    setForm({
      customerName: "",
      title: "Clothes Cabinet",
      category: "Cabinet",
      material_requirements: [],
      image: null,
      dimensions: { ...defaultDimensions },
      dimensionUnit: "inch",
      finishDate: "",
      labor: 0,
    });

    setPreviewImage(null);
    setMaterialFilter(materialCategories[0]);
  }

  function closeAddModal() {
    if (saving) return;

    setIsAddModalOpen(false);
    resetForm();
  }

  function updateDimension(field: keyof Dimensions, value: string) {
    setForm((previous) => ({
      ...previous,
      dimensions: {
        ...previous.dimensions,
        [field]: value,
      },
    }));
  }

  function applyFurniturePreset(category: string, title: string) {
    setForm((previous) => ({
      ...previous,
      category,
      title,
      material_requirements: [],
      dimensions: { ...defaultDimensions },
    }));
  }

  function addMaterialRequirement(
    materialId: string,
    preferredQuantity?: number,
    preferredUnit?: string,
  ) {
    if (!materialId) return;

    const priceItem = priceItems.find((item) => item.id === materialId);
    if (!priceItem) return;

    setForm((previous) => {
      const existing = previous.material_requirements.find(
        (item) => item.material_id === materialId,
      );

      if (existing) {
        return {
          ...previous,
          material_requirements: previous.material_requirements.map((item) =>
            item.material_id === materialId
              ? { ...item, quantity: preferredQuantity ?? item.quantity }
              : item,
          ),
        };
      }

      return {
        ...previous,
        material_requirements: [
          ...previous.material_requirements,
          {
            material_id: materialId,
            quantity: preferredQuantity ?? 1,
            quantity_unit: preferredUnit ?? priceItem.quantity_unit ?? "pcs",
            purchase_price_item_id: null,
            material_name: priceItem.item_name,
            material_category: priceItem.category,
            material_size: priceItem.size,
            material_size_unit: priceItem.size_unit,
          },
        ],
      };
    });
  }

  function updateRequirement(
    materialId: string,
    field: keyof MaterialRequirement,
    value: string | number | null,
  ) {
    setForm((previous) => ({
      ...previous,
      material_requirements: previous.material_requirements.map((item) =>
        item.material_id === materialId ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function removeRequirement(materialId: string) {
    setForm((previous) => ({
      ...previous,
      material_requirements: previous.material_requirements.filter(
        (item) => item.material_id !== materialId,
      ),
    }));
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setForm((previous) => ({
      ...previous,
      image: file,
    }));

    setPreviewImage(URL.createObjectURL(file));
  }

  async function handleSaveFinishedProject(event: React.FormEvent) {
    event.preventDefault();

    if (!form.customerName.trim()) {
      showToast({ tone: "error", message: "Please enter the customer name." });
      return;
    }

    if (!form.title.trim()) {
      showToast({ tone: "error", message: "Please enter the furniture name." });
      return;
    }

    if (!form.category) {
      showToast({
        tone: "error",
        message: "Please select a furniture category.",
      });
      return;
    }

    if (!form.finishDate) {
      showToast({
        tone: "error",
        message: "Please select the date of finished.",
      });
      return;
    }

    setSaving(true);

    try {
      let imageUrl: string | null = null;

      if (form.image) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("You must be signed in to save a project image.");
        }

        const extension = form.image.name.split(".").pop() || "jpg";
        const fileName = `${crypto.randomUUID()}.${extension}`;
        const filePath = `${user.id}/projects/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(PROJECT_DESIGN_BUCKET)
          .upload(filePath, form.image, {
            cacheControl: "3600",
            contentType: form.image.type,
            upsert: false,
          });

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from(PROJECT_DESIGN_BUCKET)
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const projectDimensions: Dimensions = {
        ...form.dimensions,
        project: {
          material_requirements: form.material_requirements,
          labor: num(form.labor),
          material_cost: materialCost,
          shortage_cost: 0,
          total_cost: totalCost,
          furniture_type: form.title,
        },
      };

      const { data, error } = await supabase
        .from(FINISHED_TABLE)
        .insert({
          title: form.title.trim(),
          category: form.category,
          customer_name: form.customerName.trim(),
          price: totalCost,
          finish_date: form.finishDate,
          dimension_unit: form.dimensionUnit,
          dimensions: projectDimensions,
          material_ids: form.material_requirements.map(
            (item) => item.material_id,
          ),
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      setFinishedProjects((previous) => [
        {
          ...(data as FinishedProject),
          price: Number(data.price),
        },
        ...previous,
      ]);

      setSelectedCategoryCard(form.category);
      setCategoryFilter(form.category);
      closeAddModal();

      showToast({
        tone: "success",
        message: "Finished project saved successfully.",
      });
    } catch (error) {
      console.error("Save finished project error:", error);

      showToast({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while saving.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFinishedProject(project: FinishedProject) {
    setDeleteTarget(project);
  }

  async function confirmDeleteFinishedProject(project: FinishedProject) {
    setDeleteTarget(null);

    const { error } = await supabase
      .from(FINISHED_TABLE)
      .delete()
      .eq("id", project.id);

    if (error) {
      showToast({ tone: "error", message: error.message });
      return;
    }

    setFinishedProjects((previous) =>
      previous.filter((item) => item.id !== project.id),
    );

    if (selectedProject?.id === project.id) {
      setSelectedProject(null);
    }

    showToast({
      tone: "success",
      message: `"${project.title}" was deleted successfully.`,
    });
  }

  function getMaterialNames(ids: string[]) {
    return ids
      .map(
        (id) =>
          priceItems.find((item) => item.id === id)?.item_name ??
          materials.find((material) => material.id === id)?.name,
      )
      .filter(Boolean) as string[];
  }

  const totalProjects = finishedProjects.length;

  return (
    <div className="min-h-screen bg-[#f6ead8] p-6 space-y-8 text-[#2b1b14]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#211c1d]">
            Furniture Projects
          </h1>
          <p className="text-[#806650] mt-1">
            Manage your completed furniture projects and finished work records.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#4b2f20] px-5 py-3 text-white shadow-sm transition hover:bg-[#6e4932]"
        >
          <FaPlus />
          Add Finished Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard label="Total Projects" value={totalProjects} />
        <StatCard
          label="Furniture Categories"
          value={furnitureCategories.length}
          className="text-amber-700"
        />
        <StatCard
          label="Completed Projects"
          value={finishedProjects.length}
          className="text-emerald-600"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-4 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search furniture, customer, or category..."
            className="w-full rounded-xl border border-[#dfc7ab] bg-[#fffaf2] py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#a06a3e]"
          />
        </div>

        <div className="relative lg:w-64">
          <FaFilter className="absolute left-4 top-4 text-gray-400 pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              setSelectedCategoryCard(event.target.value);
            }}
            className="w-full rounded-xl border border-[#dfc7ab] bg-[#fffaf2] py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#a06a3e] appearance-none"
          >
            <option value="All">All Furniture Categories</option>
            {furnitureCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-[#4b2f20]">
            Finished Projects by Category
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Click a category card to view the finished projects under that
            category.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <FaSpinner className="animate-spin text-[#a06a3e] text-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <CategoryCard
              category="All"
              count={finishedProjects.length}
              selected={selectedCategoryCard === "All"}
              onClick={() => {
                setSelectedCategoryCard("All");
                setCategoryFilter("All");
              }}
            />

            {furnitureCategories.map((category) => (
              <CategoryCard
                key={category}
                category={category}
                count={categoryCounts[category] ?? 0}
                selected={selectedCategoryCard === category}
                onClick={() => {
                  setSelectedCategoryCard(category);
                  setCategoryFilter(category);
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-[#4b2f20]">
              {selectedCategoryCard === "All"
                ? "Finished Projects"
                : `${selectedCategoryCard} Projects`}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {categoryCardProjects.length} finished project
              {categoryCardProjects.length === 1 ? "" : "s"} found.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <FaSpinner className="animate-spin text-[#a06a3e] text-2xl" />
          </div>
        ) : categoryCardProjects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#dfc7ab] bg-[#fffaf2] shadow-[0_10px_30px_rgba(75,47,32,0.12)]">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-[#4b2f20] text-[#fffaf2]">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">
                    Project
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">
                    Category
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">
                    Dimensions
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">
                    Project Info
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">
                    Price
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">
                    Finished
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ead8c1]">
                {categoryCardProjects.map((project) => (
                  <ProjectTableRow
                    key={project.id}
                    project={project}
                    onView={() => setSelectedProject(project)}
                    onDelete={() => handleDeleteFinishedProject(project)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {toast && (
        <div
          role="status"
          className={`fixed right-5 top-5 z-[70] flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_16px_40px_rgba(33,28,29,0.16)] ${
            toast.tone === "success"
              ? "border-[#a9dfbd] bg-[#eafff1] text-[#08783d]"
              : toast.tone === "error"
                ? "border-[#e4b7ab] bg-[#fff0ec] text-[#9a382c]"
                : "border-[#dfc7ab] bg-[#fff4df] text-[#754522]"
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80">
            {toast.tone === "success" ? (
              <FaCheck />
            ) : toast.tone === "error" ? (
              <FaArrowLeft />
            ) : (
              <FaTrash />
            )}
          </span>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmationModal
          project={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void confirmDeleteFinishedProject(deleteTarget)}
        />
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2b1b14]/65">
          <div className="project-modal-theme w-full h-full overflow-hidden flex flex-col bg-[#fffaf2] text-[#2b1b14]">
            <div className="shrink-0 border-b border-[#dfc7ab] px-4 md:px-7 py-4 flex items-center gap-3 bg-[#fffaf2]">
              <button
                type="button"
                onClick={closeAddModal}
                disabled={saving}
                aria-label="Close"
                className="rounded-xl p-2 text-[#806650] hover:bg-[#f6ead8] hover:text-[#4b2f20] disabled:opacity-50"
              >
                <FaArrowLeft />
              </button>

              <div>
                <h2 className="text-2xl font-bold text-[#4b2f20]">
                  Add Finished Furniture Project
                </h2>
                <p className="text-[#806650] text-sm">
                  Save a completed furniture project to Finished Projects.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSaveFinishedProject}
              className="flex-1 min-h-0 overflow-hidden"
            >
              <div className="h-full overflow-y-auto">
                <div className="mx-auto w-full max-w-5xl p-4 md:p-7 space-y-7">
                  <section>
                    <SectionTitle
                      title="Custom Info"
                      subtitle="Enter the customer information for this finished project."
                    />

                    <Field label="Customer Name">
                      <input
                        value={form.customerName}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            customerName: event.target.value,
                          }))
                        }
                        placeholder="Enter customer name"
                        className={inputClass}
                        required
                      />
                    </Field>
                  </section>

                  <section>
                    <SectionTitle
                      title="Project Information"
                      subtitle="Choose the furniture category and name for this project."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Furniture Category">
                        <select
                          value={form.category}
                          onChange={(event) => {
                            const category = event.target.value;
                            const firstName =
                              furnitureTypes[category]?.[0] ||
                              "Custom Furniture";

                            applyFurniturePreset(category, firstName);
                          }}
                          className={inputClass}
                        >
                          {furnitureCategories.map((category) => (
                            <option key={category}>{category}</option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Furniture Name">
                        {form.category === "Other" ? (
                          <input
                            value={form.title}
                            onChange={(event) =>
                              setForm((previous) => ({
                                ...previous,
                                title: event.target.value,
                              }))
                            }
                            placeholder="Type furniture name"
                            className={inputClass}
                            required
                          />
                        ) : (
                          <select
                            value={form.title}
                            onChange={(event) =>
                              applyFurniturePreset(
                                form.category,
                                event.target.value,
                              )
                            }
                            className={inputClass}
                          >
                            {(furnitureTypes[form.category] ?? []).map(
                              (name) => (
                                <option key={name}>{name}</option>
                              ),
                            )}
                          </select>
                        )}
                      </Field>
                    </div>
                  </section>

                  <section>
                    <SectionTitle
                      title="Dimension Plan"
                      subtitle="Only the dimensions that belong to the selected furniture type are shown."
                    />

                    <div className="mb-5 max-w-xs">
                      <Field label="Select Unit">
                        <select
                          value={form.dimensionUnit}
                          onChange={(event) =>
                            setForm((previous) => ({
                              ...previous,
                              dimensionUnit: event.target.value as
                                "ft" | "cm" | "inch",
                            }))
                          }
                          className={inputClass}
                        >
                          <option value="ft">Feet (ft)</option>
                          <option value="cm">Centimeters (cm)</option>
                          <option value="inch">Inches (inch)</option>
                        </select>
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <DimensionInput
                        label={`Overall Width (${form.dimensionUnit})`}
                        value={form.dimensions.overall_width}
                        onChange={(value) =>
                          updateDimension("overall_width", value)
                        }
                        placeholder={`Enter width in ${form.dimensionUnit}`}
                      />

                      <DimensionInput
                        label={`Overall Height (${form.dimensionUnit})`}
                        value={form.dimensions.overall_height}
                        onChange={(value) =>
                          updateDimension("overall_height", value)
                        }
                        placeholder={`Enter height in ${form.dimensionUnit}`}
                      />

                      <DimensionInput
                        label={`Overall Depth (${form.dimensionUnit})`}
                        value={form.dimensions.overall_depth}
                        onChange={(value) =>
                          updateDimension("overall_depth", value)
                        }
                        placeholder={`Enter depth in ${form.dimensionUnit}`}
                      />

                      {form.category === "Cabinet" && (
                        <>
                          <DimensionInput
                            label="Shelves"
                            value={form.dimensions.number_of_shelves}
                            onChange={(value) =>
                              updateDimension("number_of_shelves", value)
                            }
                            placeholder="0"
                          />

                          <DimensionInput
                            label="Doors"
                            value={form.dimensions.number_of_doors}
                            onChange={(value) =>
                              updateDimension("number_of_doors", value)
                            }
                            placeholder="0"
                          />

                          <DimensionInput
                            label="Drawers"
                            value={form.dimensions.number_of_drawers}
                            onChange={(value) =>
                              updateDimension("number_of_drawers", value)
                            }
                            placeholder="0"
                          />

                          <DimensionInput
                            label="Partitions"
                            value={form.dimensions.partition_width}
                            onChange={(value) =>
                              updateDimension("partition_width", value)
                            }
                            placeholder="0"
                          />
                        </>
                      )}

                      {(form.category === "Table" ||
                        form.category === "Desk") && (
                        <DimensionInput
                          label="Leg Count"
                          value={form.dimensions.number_of_legs}
                          onChange={(value) =>
                            updateDimension("number_of_legs", value)
                          }
                          placeholder="4"
                        />
                      )}

                      {form.category === "Bed" && (
                        <DimensionInput
                          label="Drawer Count"
                          value={form.dimensions.number_of_drawers}
                          onChange={(value) =>
                            updateDimension("number_of_drawers", value)
                          }
                          placeholder="0"
                        />
                      )}

                      {form.category === "Shelf" && (
                        <DimensionInput
                          label="Shelves"
                          value={form.dimensions.number_of_shelves}
                          onChange={(value) =>
                            updateDimension("number_of_shelves", value)
                          }
                          placeholder="0"
                        />
                      )}

                      {form.category === "Dresser" && (
                        <DimensionInput
                          label="Drawers"
                          value={form.dimensions.number_of_drawers}
                          onChange={(value) =>
                            updateDimension("number_of_drawers", value)
                          }
                          placeholder="0"
                        />
                      )}
                    </div>
                  </section>

                  <section>
                    <SectionTitle
                      title="Materials Needed"
                      subtitle="Filter by Material Category, then click Add. Enter the exact quantity you used for each selected material."
                    />

                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                      {materialCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setMaterialFilter(category)}
                          className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                            materialFilter === category
                              ? "bg-[#4b2f20] text-white border-[#211c1d] hover:bg-[#6e4932]"
                              : "bg-[#fffaf2] text-[#806650] hover:bg-[#fff4df]"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredPriceItems.length === 0 ? (
                        <div className="md:col-span-2 border border-dashed border-[#c9a77f] rounded-2xl p-8 text-center text-[#9a7b61]">
                          No price-list items found for this category.
                        </div>
                      ) : (
                        filteredPriceItems.map((priceItem) => {
                          const selected = selectedRequirements.some(
                            (item) => item.material_id === priceItem.id,
                          );

                          return (
                            <div
                              key={priceItem.id}
                              className={`border rounded-2xl p-4 ${
                                selected
                                  ? "border-[#c9a66b] bg-[#fffaf2]"
                                  : "bg-[#fffaf2]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-[#4b2f20]">
                                    {priceItem.item_name}
                                  </p>

                                  <p className="text-xs text-[#806650] mt-1">
                                    {priceItem.category} ·{" "}
                                    {priceItem.size || "No size"}{" "}
                                    {priceItem.size_unit || ""}
                                  </p>

                                  <p className="text-xs text-[#806650] mt-1">
                                    {money(priceItem.unit_price)} /{" "}
                                    {priceItem.quantity_unit}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  disabled={selected}
                                  onClick={() =>
                                    addMaterialRequirement(priceItem.id)
                                  }
                                  className="shrink-0 px-3 py-2 rounded-xl bg-[#4b2f20] text-white text-sm font-semibold hover:bg-[#6e4932] disabled:bg-[#4c9b69]"
                                >
                                  {selected ? (
                                    <>
                                      <FaCheck className="inline mr-1" />
                                      Added
                                    </>
                                  ) : (
                                    "Add"
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="mt-5 space-y-3">
                      {selectedRequirements.length === 0 ? (
                        <div className="border border-dashed border-[#c9a77f] rounded-xl p-6 text-center text-sm text-[#9a7b61]">
                          Select materials using the category filters above.
                        </div>
                      ) : (
                        selectedRequirements.map((requirement) => {
                          const priceItem = priceItems.find(
                            (item) => item.id === requirement.material_id,
                          );

                          if (!priceItem) return null;

                          return (
                            <div
                              key={requirement.material_id}
                              className="border border-[#dfc7ab] bg-[#fffaf2] rounded-2xl p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-[#4b2f20]">
                                    {priceItem.item_name}
                                  </p>

                                  <p className="text-xs text-[#806650] mt-1">
                                    {priceItem.category} ·{" "}
                                    {priceItem.size || "No size"}{" "}
                                    {priceItem.size_unit || ""}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeRequirement(priceItem.id)
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FaTrash />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                                <div>
                                  <label className="text-xs font-semibold text-[#806650]">
                                    Required
                                  </label>

                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={formatMoneyInput(
                                      requirement.quantity,
                                    )}
                                    onChange={(event) => {
                                      const cleaned = event.target.value
                                        .replace(/,/g, "")
                                        .replace(/^0+(?=\d)/, "");

                                      updateRequirement(
                                        priceItem.id,
                                        "quantity",
                                        cleaned === "" ? 0 : num(cleaned),
                                      );
                                    }}
                                    className={smallInputClass}
                                    placeholder="1"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-semibold text-[#806650]">
                                    Unit
                                  </label>

                                  <div className="rounded-xl bg-[#f6ead8] px-3 py-2.5 text-sm font-semibold text-[#4b2f20]">
                                    {requirement.quantity_unit}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-xs font-semibold text-[#806650]">
                                    Listed Price
                                  </label>

                                  <div className="rounded-xl bg-[#f6ead8] px-3 py-2.5 text-sm font-semibold text-[#4b2f20]">
                                    {money(priceItem.unit_price)} /{" "}
                                    {priceItem.quantity_unit}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </section>

                  <section>
                    <SectionTitle
                      title="Labor and Automatic Pricing"
                      subtitle="Listed material prices and labor are combined into the finished project price."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CostBox
                        label="Material Cost"
                        value={money(materialCost)}
                      />

                      <Field label="Labor">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={
                            form.labor === 0 ? "" : formatMoneyInput(form.labor)
                          }
                          onChange={(event) => {
                            const cleaned = event.target.value
                              .replace(/,/g, "")
                              .replace(/^0+(?=\d)/, "");

                            setForm((previous) => ({
                              ...previous,
                              labor:
                                cleaned === "" ? 0 : parseMoneyInput(cleaned),
                            }));
                          }}
                          className={inputClass}
                          placeholder="0"
                        />
                      </Field>
                    </div>

                    <div className="mt-4 bg-[#4b2f20] text-white rounded-2xl p-5 flex items-center justify-between">
                      <div>
                        <p className="text-[#ead8bd] text-sm">
                          Finished Project Price
                        </p>

                        <p className="text-3xl font-bold mt-1">
                          {money(totalCost)}
                        </p>
                      </div>

                      <FaCube className="text-4xl text-[#c9a77f]" />
                    </div>
                  </section>

                  <section>
                    <SectionTitle
                      title="Project Image"
                      subtitle="Upload a photo/reference image of the completed furniture."
                    />

                    <label className="border-2 border-dashed border-[#c9a77f] rounded-2xl bg-[#fff4df] p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-[#f3cf95]">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Furniture project preview"
                          className="max-h-60 rounded-xl object-contain"
                        />
                      ) : (
                        <>
                          <FaImage className="text-[#c9a77f] text-5xl mb-3" />
                          <p className="font-semibold text-[#6e4932]">
                            Click to upload project image
                          </p>
                          <p className="text-sm text-[#9a7b61] mt-1">
                            JPG, PNG, JPEG
                          </p>
                        </>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </section>

                  <section>
                    <Field label="Date of Finished">
                      <div className="relative max-w-md">
                        <FaCalendarAlt className="absolute left-4 top-4 text-gray-400" />
                        <input
                          type="date"
                          value={form.finishDate}
                          onChange={(event) =>
                            setForm((previous) => ({
                              ...previous,
                              finishDate: event.target.value,
                            }))
                          }
                          className="w-full border border-[#dfc7ab] rounded-xl bg-white pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#a06a3e]"
                          required
                        />
                      </div>
                    </Field>
                  </section>

                  <div className="flex justify-end gap-3 border-t pt-5 pb-5">
                    <button
                      type="button"
                      onClick={closeAddModal}
                      disabled={saving}
                      className="px-5 py-3 rounded-xl border border-[#c9a77f] text-[#4b2f20] hover:bg-[#fff4df]"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4b2f20] text-white hover:bg-[#6e4932] disabled:opacity-50"
                    >
                      {saving && <FaSpinner className="animate-spin" />}
                      Save Finished Project
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedProject && (
        <ProjectViewModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

/*
  Removed 3D designer implementation.
*/
/*

function CabinetDesigner({
  config,
  onChange,
  category,
  title,
  referenceImage,
  onDoorToggle,
  onDrawerToggle,
  onPartSelect,
  onPartDimensionChange,
}: {
  config: ThreeDConfig;
  onChange: (
    field: keyof ThreeDConfig,
    value: number | boolean | string | number[],
  ) => void;
  category: string;
  title: string;
  referenceImage: string | null;
  onDoorToggle: (id: number) => void;
  onDrawerToggle: (id: number) => void;
  onPartSelect: (part: string) => void;
  onPartDimensionChange: (
    part: string,
    axis: keyof PartDimension,
    value: string | number,
  ) => void;
}) {
  const [Canvas, setCanvas] = useState<any>(null);
  const [OrbitControls, setOrbitControls] = useState<any>(null);
  const [Edges, setEdges] = useState<any>(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{
    part: string;
    dimensions: PartDimension;
    startX: number;
    startY: number;
    shiftKey: boolean;
  } | null>(null);
  const [toolTab, setToolTab] = useState<"Dimensions" | "Style" | "Hardware">(
    "Dimensions",
  );

  useEffect(() => {
    let mounted = true;
    Promise.all([import("@react-three/fiber"), import("@react-three/drei")])
      .then(([fiber, drei]) => {
        if (!mounted) return;
        setCanvas(() => fiber.Canvas);
        setOrbitControls(() => drei.OrbitControls);
        setEdges(() => drei.Edges);
      })
      .catch((error) => console.error("Three.js load error:", error));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const resize = resizeRef.current;
      if (!resize) return;
      const pixelsToMillimeters = 4;
      const horizontalDelta =
        (event.clientX - resize.startX) * pixelsToMillimeters;
      const verticalDelta =
        (resize.startY - event.clientY) * pixelsToMillimeters;

      if (resize.shiftKey) {
        onPartDimensionChange(
          resize.part,
          "depth",
          resize.dimensions.depth + horizontalDelta,
        );
      } else {
        onPartDimensionChange(
          resize.part,
          "width",
          resize.dimensions.width + horizontalDelta,
        );
        onPartDimensionChange(
          resize.part,
          "height",
          resize.dimensions.height + verticalDelta,
        );
      }
    };

    const handlePointerUp = () => {
      resizeRef.current = null;
      setIsResizing(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [onPartDimensionChange]);

  const resizeContext: PartResizeContextValue = {
    Edges,
    begin: (part, dimensions, event) => {
      resizeRef.current = {
        part,
        dimensions,
        startX: event.clientX,
        startY: event.clientY,
        shiftKey: event.shiftKey,
      };
      setIsResizing(true);
      onPartSelect(part);
    },
  };

  const selectedPart = config.selectedPart || "None";
  const selectedPartDimensions = getSelectedPartDimensions(
    selectedPart,
    config,
  );

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/90 shadow-inner shadow-black/20 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-700 bg-slate-950/80 px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-white">
              {title}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Parametric 3D workspace · Units: mm
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="rounded bg-slate-800 px-2 py-1">Orbit</span>
            <span className="rounded bg-slate-800 px-2 py-1">Zoom</span>
            <span className="rounded bg-slate-800 px-2 py-1">Select</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-slate-900 px-3 py-2">
          {[
            ["Dimensions", FaRulerCombined],
            ["Style", FaPalette],
            ["Hardware", FaLock],
          ].map(([name, Icon]: any) => (
            <button
              key={name}
              type="button"
              onClick={() => setToolTab(name)}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                toolTab === name
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Icon /> {name}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[430px] rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-[inset_0_0_20px_rgba(15,23,42,0.9)]">
        {Canvas && OrbitControls && Edges ? (
          <Canvas
            camera={{ position: [3.2, 2.5, 3.5], fov: 45 }}
            onPointerMissed={() => onPartSelect("")}
          >
            <color attach="background" args={["#0f172a"]} />
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 7, 5]} intensity={2} />
            <PartResizeContext.Provider value={resizeContext}>
              <FurnitureModel
                config={config}
                category={category}
                title={title}
                referenceImage={referenceImage}
                onDoorToggle={onDoorToggle}
                onDrawerToggle={onDrawerToggle}
                onPartSelect={onPartSelect}
              />
            </PartResizeContext.Provider>
            <OrbitControls enableDamping enabled={!isResizing} />
          </Canvas>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            <FaSpinner className="animate-spin mr-3" /> Loading 3D designer...
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <FaMousePointer className="text-blue-400" />
          <div>
            <p className="font-semibold">
              Selected part: {selectedPart === "None" ? "None" : selectedPart}
            </p>
            <p className="text-[11px] text-slate-400">
              Click and hold any part to resize it. Drag normally for width and
              height; hold Shift while dragging to resize depth.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(config.partDimensions ?? {}).map((part) => (
            <button
              key={part}
              type="button"
              onClick={() => onPartSelect(part)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold border transition ${
                selectedPart === part
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              {part}
            </button>
          ))}
        </div>

        {selectedPart !== "None" && selectedPartDimensions && (
          <div className="grid grid-cols-3 gap-2">
            {(["width", "height", "depth"] as const).map((axis) => (
              <div
                key={axis}
                className="rounded-xl border border-blue-400/40 bg-blue-500/10 p-2.5"
              >
                <label className="block text-[10px] uppercase font-bold text-blue-300 mb-1">
                  {axis === "width"
                    ? "Width"
                    : axis === "height"
                      ? "Height"
                      : "Length / Depth"}
                </label>
                <input
                  type="number"
                  min="1"
                  value={Math.round(selectedPartDimensions[axis])}
                  onChange={(event) =>
                    onPartDimensionChange(
                      selectedPart,
                      axis,
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg bg-slate-950 border border-blue-400/30 px-2 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400">mm</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {toolTab === "Dimensions" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-5">
            <DimensionSlider
              label="Overall Width"
              value={config.width}
              min={50}
              max={5000}
              step={10}
              onChange={(value) => onChange("width", value)}
            />
            <DimensionSlider
              label="Overall Height"
              value={config.height}
              min={50}
              max={5000}
              step={10}
              onChange={(value) => onChange("height", value)}
            />
            <DimensionSlider
              label="Overall Depth"
              value={config.depth}
              min={50}
              max={3000}
              step={10}
              onChange={(value) => onChange("depth", value)}
            />
          </div>

          {(category === "Cabinet" ||
            category === "Shelf" ||
            category === "Dresser" ||
            category === "Counter") && (
            <div className="grid grid-cols-2 gap-3">
              {(category === "Cabinet" || category === "Shelf") && (
                <ThreeDNumber
                  label="Shelves"
                  value={config.shelves}
                  min={0}
                  max={30}
                  step={1}
                  onChange={(value) => onChange("shelves", value)}
                />
              )}
              {(category === "Cabinet" ||
                category === "Counter" ||
                category === "Dresser") && (
                <ThreeDNumber
                  label="Drawers"
                  value={config.drawers}
                  min={0}
                  max={20}
                  step={1}
                  onChange={(value) => onChange("drawers", value)}
                />
              )}
              {(category === "Cabinet" || category === "Counter") && (
                <>
                  <ThreeDNumber
                    label="Doors"
                    value={config.doors}
                    min={0}
                    max={20}
                    step={1}
                    onChange={(value) => onChange("doors", value)}
                  />
                  <ThreeDNumber
                    label="Partitions"
                    value={config.partitions}
                    min={0}
                    max={20}
                    step={1}
                    onChange={(value) => onChange("partitions", value)}
                  />
                </>
              )}
              <ThreeDNumber
                label="Board Thickness"
                value={config.thickness}
                min={6}
                max={50}
                step={1}
                onChange={(value) => onChange("thickness", value)}
              />
              <ThreeDNumber
                label="Back Thickness"
                value={config.backThickness}
                min={3}
                max={30}
                step={1}
                onChange={(value) => onChange("backThickness", value)}
              />
            </div>
          )}

          {(category === "Table" || category === "Desk") && (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs font-bold text-slate-300 mb-3">
                Table / Desk / Counter parts
              </p>
              <p className="text-xs text-slate-500">
                Use the individual part buttons above to edit the tabletop and
                every leg separately.
              </p>
            </div>
          )}

          {category === "Chair" && (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs font-bold text-slate-300 mb-3">
                Chair parts
              </p>
              <p className="text-xs text-slate-500">
                Seat, back and all four legs have independent W × H × D values.
              </p>
            </div>
          )}

          {category === "Bed" && (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs font-bold text-slate-300 mb-3">Bed parts</p>
              <p className="text-xs text-slate-500">
                Mattress platform, headboard and drawers are independently
                selectable.
              </p>
            </div>
          )}

          {(category === "Door" || category === "Doors") && (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs font-bold text-slate-300 mb-3">
                Door panel
              </p>
              <p className="text-xs text-slate-500">
                The door panel has its own Width × Height × Thickness values.
              </p>
            </div>
          )}
        </div>
      )}

      {toolTab === "Style" && (
        <div className="space-y-4 rounded-2xl bg-white/5 border border-white/10 p-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2">
              Cabinet Color
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                "#b77b43",
                "#8b5a2b",
                "#d39a62",
                "#5b4636",
                "#f1e8d5",
                "#2f2f2f",
                "#ffffff",
              ].map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  onClick={() => onChange("color", color)}
                  className={`w-10 h-10 rounded-full border-2 ${config.color === color ? "border-blue-400 ring-2 ring-blue-400/30" : "border-white/20"}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2">Handle</p>
            <div className="grid grid-cols-3 gap-2">
              {(["bar", "knob", "shell"] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => onChange("handleStyle", style)}
                  className={`px-3 py-2 rounded-xl border text-sm capitalize ${config.handleStyle === style ? "bg-blue-600 border-blue-500 text-white" : "border-white/10 text-slate-300"}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {toolTab === "Hardware" && (
        <div className="space-y-4 rounded-2xl bg-white/5 border border-white/10 p-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2">Hinge</p>
            <div className="grid grid-cols-2 gap-2">
              {(["concealed", "butt"] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => onChange("hingeStyle", style)}
                  className={`px-3 py-2 rounded-xl border text-sm capitalize ${config.hingeStyle === style ? "bg-blue-600 border-blue-500 text-white" : "border-white/10 text-slate-300"}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2">Lock</p>
            <div className="grid grid-cols-3 gap-2">
              {(["none", "cam", "magnetic"] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => onChange("lockStyle", style)}
                  className={`px-3 py-2 rounded-xl border text-sm capitalize ${config.lockStyle === style ? "bg-blue-600 border-blue-500 text-white" : "border-white/10 text-slate-300"}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          <CADKernelStatus config={config} />
        </div>
      )}

      <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-xs text-slate-400">
        <p className="font-semibold text-slate-200 mb-2">3D controls</p>
        <p>• Click and hold a panel, door, drawer or shelf to resize</p>
        <p>• Drag normally for width and height; hold Shift for depth</p>
        <p>• Drag empty space to rotate</p>
        <p>• Scroll to zoom</p>
        <p>• Right-click/secondary drag to pan</p>
        <p>• Click a door or drawer to open/close that exact part</p>
        <p>• Click a panel/shelf/door/drawer to show its W × H × D</p>
      </div>
    </div>
  );
}

function getSelectedPartDimensions(part: string, config: ThreeDConfig) {
  if (!part) return null;
  return config.partDimensions?.[part] ?? null;
}

function PartBox({
  part,
  dimensions,
  position,
  color,
  selected,
  onSelect,
  onClick,
}: {
  part: string;
  dimensions: PartDimension;
  position: [number, number, number];
  color: string;
  selected: boolean;
  onSelect: (part: string) => void;
  onClick?: () => void;
}) {
  const scale = 0.001;
  const resizeContext = useContext(PartResizeContext);
  const beginResize = (event: any) => {
    event.stopPropagation();
    resizeContext?.begin(part, dimensions, {
      clientX: event.nativeEvent.clientX,
      clientY: event.nativeEvent.clientY,
      shiftKey: event.nativeEvent.shiftKey,
    });
  };
  return (
    <mesh
      position={[position[0] * scale, position[1] * scale, position[2] * scale]}
      onPointerDown={beginResize}
      onPointerOver={() => {
        document.body.style.cursor = selected ? "nwse-resize" : "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(part);
        onClick?.();
      }}
    >
      <boxGeometry
        args={[
          Math.max(0.01, dimensions.width * scale),
          Math.max(0.01, dimensions.height * scale),
          Math.max(0.01, dimensions.depth * scale),
        ]}
      />
      {selected && resizeContext?.Edges && (
        <resizeContext.Edges scale={1.015} color="#dbeafe" linewidth={2} />
      )}
      <meshStandardMaterial
        color={color}
        emissive="#000000"
        emissiveIntensity={0}
        roughness={0.55}
      />
      {selected && (
        <ResizeGrip
          width={dimensions.width * scale}
          height={dimensions.height * scale}
          depth={dimensions.depth * scale}
          onPointerDown={beginResize}
        />
      )}
    </mesh>
  );
}

function ResizeGrip({
  width,
  height,
  depth,
  onPointerDown,
}: {
  width: number;
  height: number;
  depth: number;
  onPointerDown: (event: any) => void;
}) {
  const size = Math.max(0.018, Math.min(width, height) * 0.16);
  const thickness = Math.max(0.004, size * 0.16);
  const z = Math.max(0.006, depth / 2 + thickness);

  return (
    <group position={[0, 0, z]} renderOrder={3}>
      <mesh
        rotation={[0, 0, Math.PI / 4]}
        onPointerDown={onPointerDown}
        onPointerOver={() => {
          document.body.style.cursor = "nwse-resize";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <boxGeometry args={[size, thickness, thickness]} />
        <meshBasicMaterial color="#e0f2fe" depthTest={false} />
      </mesh>
      <mesh
        rotation={[0, 0, -Math.PI / 4]}
        onPointerDown={onPointerDown}
        onPointerOver={() => {
          document.body.style.cursor = "nwse-resize";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <boxGeometry args={[size, thickness, thickness]} />
        <meshBasicMaterial color="#e0f2fe" depthTest={false} />
      </mesh>
    </group>
  );
}

function FurnitureModel({
  config,
  category,
  title,
  referenceImage: _referenceImage,
  onDoorToggle,
  onDrawerToggle,
  onPartSelect,
}: {
  config: ThreeDConfig;
  category: string;
  title: string;
  referenceImage: string | null;
  onDoorToggle: (id: number) => void;
  onDrawerToggle: (id: number) => void;
  onPartSelect: (part: string) => void;
}) {
  const w = Math.max(50, config.width);
  const h = Math.max(50, config.height);
  const d = Math.max(50, config.depth);
  const color = config.color || "#b77b43";
  const lowerCategory = category.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const selected = config.selectedPart || "";

  const isCabinetFamily =
    ["cabinet", "shelf", "dresser", "counter"].includes(lowerCategory) ||
    lowerTitle.includes("cabinet") ||
    lowerTitle.includes("dresser") ||
    lowerTitle.includes("shelf");

  const part = (name: string, fallback: PartDimension): PartDimension =>
    config.partDimensions?.[name] ?? fallback;

  const overall: PartDimension = { width: w, height: h, depth: d };
  const side: PartDimension = {
    width: config.thickness,
    height: h,
    depth: d,
  };

  if (lowerCategory === "chair") {
    const seat = part("Seat", {
      width: Math.min(w * 0.9, 550),
      height: config.thickness * 2,
      depth: Math.min(d * 0.9, 550),
    });
    const back = part("Back", {
      width: seat.width,
      height: h * 0.45,
      depth: config.thickness,
    });
    const leg = part("Leg 1", {
      width: config.thickness * 1.5,
      height: h * 0.45,
      depth: config.thickness * 1.5,
    });
    const seatY = -h / 2 + leg.height + seat.height / 2;
    const legY = -h / 2 + leg.height / 2;
    const x = Math.max(10, seat.width / 2 - leg.width);
    const z = Math.max(10, seat.depth / 2 - leg.depth);

    return (
      <group>
        <PartBox
          part="Seat"
          dimensions={seat}
          position={[0, seatY, 0]}
          color={color}
          selected={selected === "Seat"}
          onSelect={onPartSelect}
        />
        <PartBox
          part="Back"
          dimensions={back}
          position={[
            0,
            seatY + seat.height / 2 + back.height / 2,
            -seat.depth / 2 + back.depth / 2,
          ]}
          color={color}
          selected={selected === "Back"}
          onSelect={onPartSelect}
        />
        {["Leg 1", "Leg 2", "Leg 3", "Leg 4"].map((name, i) => {
          const legPart = part(name, leg);
          const px = i % 2 === 0 ? -x : x;
          const pz = i < 2 ? -z : z;
          return (
            <PartBox
              key={name}
              part={name}
              dimensions={legPart}
              position={[px, legY, pz]}
              color={color}
              selected={selected === name}
              onSelect={onPartSelect}
            />
          );
        })}
      </group>
    );
  }

  if (lowerCategory === "table" || lowerCategory === "desk") {
    const top = part("Tabletop", {
      width: w,
      height: config.thickness,
      depth: d,
    });
    const leg = part("Leg 1", {
      width: Math.max(35, config.thickness * 2),
      height: Math.max(100, h - top.height),
      depth: Math.max(35, config.thickness * 2),
    });
    const topY = h / 2 - top.height / 2;
    const legY = -h / 2 + leg.height / 2;
    const x = Math.max(10, top.width / 2 - leg.width * 1.5);
    const z = Math.max(10, top.depth / 2 - leg.depth * 1.5);

    return (
      <group>
        <PartBox
          part="Tabletop"
          dimensions={top}
          position={[0, topY, 0]}
          color={color}
          selected={selected === "Tabletop"}
          onSelect={onPartSelect}
        />
        {["Leg 1", "Leg 2", "Leg 3", "Leg 4"].map((name, i) => {
          const legPart = part(name, leg);
          return (
            <PartBox
              key={name}
              part={name}
              dimensions={legPart}
              position={[i % 2 === 0 ? -x : x, legY, i < 2 ? -z : z]}
              color={color}
              selected={selected === name}
              onSelect={onPartSelect}
            />
          );
        })}
        {Array.from({ length: Math.max(0, Math.floor(config.drawers)) }).map(
          (_, i) => {
            const drawer = part(`Drawer ${i + 1}`, {
              width: w * 0.25,
              height: 120,
              depth: d * 0.6,
            });
            return (
              <PartBox
                key={`drawer-${i}`}
                part={`Drawer ${i + 1}`}
                dimensions={drawer}
                position={[
                  -w / 2 + drawer.width / 2 + 40 + i * (drawer.width + 20),
                  topY - top.height / 2 - drawer.height / 2,
                  d / 2 + drawer.depth / 2,
                ]}
                color={color}
                selected={selected === `Drawer ${i + 1}`}
                onSelect={onPartSelect}
                onClick={() => onDrawerToggle(i)}
              />
            );
          },
        )}
      </group>
    );
  }

  if (lowerCategory === "bed") {
    const platform = part("Mattress Platform", {
      width: w,
      height: config.thickness,
      depth: d,
    });
    const headboard = part("Headboard", {
      width: w,
      height: Math.max(300, h * 0.65),
      depth: config.thickness,
    });
    const platformY = -h / 2 + platform.height / 2 + 100;
    return (
      <group>
        <PartBox
          part="Mattress Platform"
          dimensions={platform}
          position={[0, platformY, 0]}
          color={color}
          selected={selected === "Mattress Platform"}
          onSelect={onPartSelect}
        />
        <PartBox
          part="Headboard"
          dimensions={headboard}
          position={[
            0,
            platformY + headboard.height / 2 - platform.height / 2,
            -d / 2 + headboard.depth / 2,
          ]}
          color={color}
          selected={selected === "Headboard"}
          onSelect={onPartSelect}
        />
        {Array.from({ length: Math.max(0, Math.floor(config.drawers)) }).map(
          (_, i) => {
            const drawer = part(`Drawer ${i + 1}`, {
              width: w / Math.max(1, config.drawers),
              height: 180,
              depth: d * 0.75,
            });
            return (
              <PartBox
                key={`drawer-${i}`}
                part={`Drawer ${i + 1}`}
                dimensions={drawer}
                position={[
                  -w / 2 + drawer.width / 2 + i * drawer.width,
                  -h / 2 + drawer.height / 2,
                  d / 2 + drawer.depth / 2,
                ]}
                color={color}
                selected={selected === `Drawer ${i + 1}`}
                onSelect={onPartSelect}
                onClick={() => onDrawerToggle(i)}
              />
            );
          },
        )}
      </group>
    );
  }

  if (lowerCategory === "door" || lowerCategory === "doors") {
    const door = part("Door 1", overall);
    return (
      <group>
        <PartBox
          part="Door 1"
          dimensions={door}
          position={[0, 0, 0]}
          color={color}
          selected={selected === "Door 1"}
          onSelect={onPartSelect}
          onClick={() => onDoorToggle(0)}
        />
      </group>
    );
  }

  if (isCabinetFamily) {
    const sideT = config.thickness;
    const usableW = Math.max(50, w - sideT * 2);
    const usableH = Math.max(50, h - sideT * 2);
    const usableD = Math.max(50, d - config.backThickness);
    const shelfCount = Math.max(0, Math.floor(config.shelves));
    const partitionCount = Math.max(0, Math.floor(config.partitions));
    const doorCount = Math.max(0, Math.floor(config.doors));
    const drawerCount = Math.max(0, Math.floor(config.drawers));
    const leftPanel = part("Left Panel", side);
    const rightPanel = part("Right Panel", side);
    const topPanel = part("Top Panel", {
      width: w,
      height: sideT,
      depth: d,
    });
    const bottomPanel = part("Bottom Panel", {
      width: w,
      height: sideT,
      depth: d,
    });
    const backPanel = part("Back Panel", {
      width: w,
      height: h,
      depth: config.backThickness,
    });

    return (
      <group>
        <PartBox
          part="Left Panel"
          dimensions={leftPanel}
          position={[-w / 2 + sideT / 2, 0, 0]}
          color={color}
          selected={selected === "Left Panel"}
          onSelect={onPartSelect}
        />
        <PartBox
          part="Right Panel"
          dimensions={rightPanel}
          position={[w / 2 - sideT / 2, 0, 0]}
          color={color}
          selected={selected === "Right Panel"}
          onSelect={onPartSelect}
        />
        <PartBox
          part="Top Panel"
          dimensions={topPanel}
          position={[0, h / 2 - sideT / 2, 0]}
          color={color}
          selected={selected === "Top Panel"}
          onSelect={onPartSelect}
        />
        <PartBox
          part="Bottom Panel"
          dimensions={bottomPanel}
          position={[0, -h / 2 + sideT / 2, 0]}
          color={color}
          selected={selected === "Bottom Panel"}
          onSelect={onPartSelect}
        />
        <PartBox
          part="Back Panel"
          dimensions={backPanel}
          position={[0, 0, -d / 2 + config.backThickness / 2]}
          color={color}
          selected={selected === "Back Panel"}
          onSelect={onPartSelect}
        />

        {Array.from({ length: shelfCount }).map((_, i) => {
          const name = `Shelf ${i + 1}`;
          const shelf = part(name, {
            width: usableW,
            height: sideT,
            depth: usableD,
          });
          const spacing = usableH / (shelfCount + 1);
          return (
            <PartBox
              key={name}
              part={name}
              dimensions={shelf}
              position={[0, h / 2 - sideT - spacing * (i + 1), 0]}
              color={color}
              selected={selected === name}
              onSelect={onPartSelect}
            />
          );
        })}

        {Array.from({ length: partitionCount }).map((_, i) => {
          const name = `Partition ${i + 1}`;
          const partition = part(name, {
            width: sideT,
            height: usableH,
            depth: usableD,
          });
          const x = -usableW / 2 + usableW * ((i + 1) / (partitionCount + 1));
          return (
            <PartBox
              key={name}
              part={name}
              dimensions={partition}
              position={[x, 0, 0]}
              color={color}
              selected={selected === name}
              onSelect={onPartSelect}
            />
          );
        })}

        {Array.from({ length: doorCount }).map((_, i) => {
          const name = `Door ${i + 1}`;
          const door = part(name, {
            width: usableW / Math.max(1, doorCount),
            height: usableH,
            depth: sideT,
          });
          const isOpen = config.openDoorIds.includes(i);
          const totalDoorWidth = Array.from({
            length: doorCount,
          }).reduce<number>(
            (sum, _, index) =>
              sum +
              (config.partDimensions?.[`Door ${index + 1}`]?.width ??
                door.width),
            0,
          );
          let cursor = -totalDoorWidth / 2;
          for (let index = 0; index < i; index++) {
            cursor +=
              config.partDimensions?.[`Door ${index + 1}`]?.width ?? door.width;
          }
          const closedX = cursor + door.width / 2;
          const openX =
            i % 2 === 0
              ? -w / 2 - door.width * 0.25
              : w / 2 + door.width * 0.25;
          return (
            <group key={name}>
              <PartBox
                part={name}
                dimensions={door}
                position={[
                  isOpen ? openX : closedX,
                  0,
                  isOpen ? 0 : d / 2 + door.depth / 2,
                ]}
                color={color}
                selected={selected === name}
                onSelect={onPartSelect}
                onClick={() => onDoorToggle(i)}
              />
            </group>
          );
        })}

        {Array.from({ length: drawerCount }).map((_, i) => {
          const name = `Drawer ${i + 1}`;
          const drawer = part(name, {
            width: usableW * 0.9,
            height: Math.max(80, usableH / Math.max(4, drawerCount + 2)),
            depth: d * 0.8,
          });
          const y = -h / 2 + sideT + drawer.height / 2 + i * drawer.height;
          const z = d / 2 + drawer.depth / 2;
          return (
            <group key={name}>
              <PartBox
                part={name}
                dimensions={drawer}
                position={[0, y, z]}
                color={color}
                selected={selected === name}
                onSelect={onPartSelect}
                onClick={() => onDrawerToggle(i)}
              />
            </group>
          );
        })}
      </group>
    );
  }

  return (
    <PartBox
      part="Furniture"
      dimensions={overall}
      position={[0, 0, 0]}
      color={color}
      selected={selected === "Furniture"}
      onSelect={onPartSelect}
    />
  );
}

function HardwareHandle({
  style,
  width,
  y,
  z,
  onClick,
}: {
  style: ThreeDConfig["handleStyle"];
  width: number;
  y: number;
  z: number;
  onClick?: () => void;
}) {
  if (style === "knob") {
    return (
      <mesh
        position={[0, y, z]}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <sphereGeometry args={[Math.max(0.015, width * 0.08), 16, 16]} />
        <meshStandardMaterial color="#4b5563" metalness={0.7} />
      </mesh>
    );
  }
  if (style === "shell") {
    return (
      <mesh
        position={[0, y, z]}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <boxGeometry
          args={[
            width * 0.7,
            Math.max(0.018, width * 0.16),
            Math.max(0.012, width * 0.12),
          ]}
        />
        <meshStandardMaterial color="#4b5563" metalness={0.7} />
      </mesh>
    );
  }
  return (
    <mesh
      position={[0, y, z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <boxGeometry
        args={[
          width,
          Math.max(0.012, width * 0.07),
          Math.max(0.012, width * 0.07),
        ]}
      />
      <meshStandardMaterial color="#4b5563" metalness={0.7} />
    </mesh>
  );
}

function ReferenceImagePlane({
  url,
  width,
  height,
  position,
  rotation = [0, 0, 0],
}: {
  url: string;
  width: number;
  height: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let active = true;
    const loader = new THREE.TextureLoader();
    loader.load(url, (loaded) => {
      if (active) {
        loaded.colorSpace = THREE.SRGBColorSpace;
        setTexture(loaded);
      }
    });
    return () => {
      active = false;
    };
  }, [url]);
  if (!texture) return null;
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.22}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function CADKernelStatus({ config }: { config: ThreeDConfig }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [message, setMessage] = useState(
    "OpenCascade.js CAD kernel not loaded yet.",
  );
  const [oc, setOc] = useState<any>(null);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setMessage("Loading OpenCascade.js WebAssembly CAD kernel…");
    import("opencascade.js")
      .then(async (module: any) => {
        const initOpenCascade = module.default ?? module;
        const instance = await initOpenCascade();
        if (!active) return;
        setOc(instance);
        setStatus("ready");
        setMessage(
          "CAD kernel ready. Current cabinet dimensions are being validated as B-Rep geometry.",
        );
      })
      .catch((error) => {
        console.error("OpenCascade.js load error:", error);
        if (!active) return;
        setStatus("error");
        setMessage(
          "CAD kernel could not load. Install opencascade.js and configure WASM bundling. Three.js remains available.",
        );
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!oc) return;
    try {
      const box = new oc.BRepPrimAPI_MakeBox_2(
        config.width / 1000,
        config.height / 1000,
        config.depth / 1000,
      );
      const done = typeof box.IsDone === "function" ? box.IsDone() : true;
      if (typeof box.delete === "function") box.delete();
      setStatus(done ? "ready" : "error");
      setMessage(
        done
          ? `B-Rep validation OK: ${Math.round(config.width)} × ${Math.round(config.height)} × ${Math.round(config.depth)} mm.`
          : "CAD kernel loaded but geometry validation failed.",
      );
    } catch (error) {
      console.error("OpenCascade geometry validation error:", error);
      setStatus("error");
      setMessage(
        "CAD kernel loaded, but this dimension set could not be converted to a B-Rep box.",
      );
    }
  }, [oc, config.width, config.height, config.depth]);

  return (
    <div
      className={`rounded-xl border p-3 text-xs ${status === "ready" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : status === "error" ? "border-amber-400/30 bg-amber-400/10 text-amber-200" : "border-white/10 bg-black/10 text-slate-400"}`}
    >
      <div className="flex items-center gap-2 font-semibold mb-1">
        <FaCube /> CAD Engine:{" "}
        {status === "ready"
          ? "OpenCascade.js Ready"
          : status === "loading"
            ? "Loading…"
            : status === "error"
              ? "Fallback mode"
              : "Idle"}
      </div>
      <p>{message}</p>
    </div>
  );
}

// ================================================================
// VIEW MODAL
// =================================================================
*/

const hiddenTableDimensions = new Set([
  "leg_depth",
  "leg_width",
  "back_depth",
  "back_width",
  "door_depth",
  "door_width",
  "leg_height",
  "seat_depth",
  "seat_width",
  "back_height",
  "door_height",
  "seat_height",
  "shelf_depth",
  "shelf_width",
  "drawer_depth",
  "drawer_width",
  "shelf_height",
  "drawer_height",
]);

function formatDimensionLabel(key: string) {
  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getVisibleDimensions(project: FinishedProject) {
  return Object.entries(project.dimensions || {})
    .filter(
      ([key, value]) =>
        key !== "project" &&
        !hiddenTableDimensions.has(key) &&
        String(value ?? "").trim() !== "",
    )
    .map(([key, value]) => `${formatDimensionLabel(key)}: ${value}`);
}

function ProjectTableRow({
  project,
  onView,
  onDelete,
}: {
  project: FinishedProject;
  onView: () => void;
  onDelete: () => void;
}) {
  const dimensions = getVisibleDimensions(project);
  const meta = getProjectMeta(project.dimensions);
  const projectInfo = [
    meta.furniture_type,
    meta.material_requirements?.length
      ? `${meta.material_requirements.length} materials`
      : null,
    meta.labor ? `Labor ${money(num(meta.labor))}` : null,
  ].filter(Boolean);

  return (
    <tr className="align-top transition hover:bg-[#fffaf2]">
      <td className="px-5 py-4">
        <p className="font-bold text-[#211c1d]">{project.title}</p>
        <span className="mt-1 inline-flex rounded-full bg-[#f3eee8] px-2.5 py-1 text-xs font-semibold text-[#6d4b24]">
          Finished
        </span>
      </td>
      <td className="px-5 py-4 text-sm text-gray-600">
        {project.customer_name}
      </td>
      <td className="px-5 py-4 text-sm font-semibold text-gray-700">
        {project.category}
      </td>
      <td className="max-w-[260px] px-5 py-4 text-sm text-gray-600">
        <div className="space-y-1">
          {dimensions.length ? (
            dimensions.slice(0, 5).map((item) => <p key={item}>{item}</p>)
          ) : (
            <span>Not specified</span>
          )}
          {dimensions.length > 5 && (
            <span className="text-xs font-semibold text-[#a4773f]">
              +{dimensions.length - 5} more
            </span>
          )}
        </div>
      </td>
      <td className="max-w-[190px] px-5 py-4 text-sm text-gray-600">
        {projectInfo.length ? (
          projectInfo.map((item) => <p key={item}>{item}</p>)
        ) : (
          <span>No additional info</span>
        )}
      </td>
      <td className="px-5 py-4 text-sm font-bold text-[#211c1d]">
        {money(num(project.price))}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
        {new Date(`${project.finish_date}T00:00:00`).toLocaleDateString(
          "en-PH",
          { year: "numeric", month: "short", day: "numeric" },
        )}
      </td>
      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center gap-2 rounded-lg border border-[#c9a66b] px-3 py-2 text-sm font-semibold text-[#211c1d] hover:bg-[#f8f1e8]"
          >
            <FaEye /> View
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-[#e2c4c0] px-3 py-2 text-[#a33b32] hover:bg-[#fff5f3]"
            aria-label={`Delete ${project.title}`}
          >
            <FaTrash />
          </button>
        </div>
      </td>
    </tr>
  );
}

function DeleteConfirmationModal({
  project,
  onCancel,
  onConfirm,
}: {
  project: FinishedProject;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2b1b14]/55 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-[#eee8e4] px-6 py-5">
          <h2 className="text-xl font-bold text-[#211c1d]">
            Confirm to delete project
          </h2>
        </div>
        <div className="px-6 py-6 text-[15px] leading-6 text-gray-600">
          This action cannot be undone. Are you sure you want to delete &quot;
          {project.title}&quot;?
        </div>
        <div className="flex gap-3 border-t border-[#eee8e4] px-6 py-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#9adbbd] bg-white px-4 py-3 font-semibold text-[#211c1d] hover:bg-[#f3fbf5]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl border border-[#d95c55] bg-[#ffd9d6] px-4 py-3 font-semibold text-[#7c211b] hover:bg-[#ffc9c5]"
          >
            Delete project
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectViewModal({
  project,
  onClose,
}: {
  project: FinishedProject;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#2b1b14]/65 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#211c1d]">
              {project.title}
            </h2>
            <p className="text-sm text-gray-500">Project image</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#211c1d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3a3031]"
          >
            Close
          </button>
        </div>
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="max-h-[75vh] w-full rounded-xl bg-[#f8f5f2] object-contain"
          />
        ) : (
          <div className="flex h-72 items-center justify-center rounded-xl bg-[#f8f5f2] text-gray-400">
            <FaImage className="text-5xl" />{" "}
          </div>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full border rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-[#b88746]";

const smallInputClass =
  "w-full border rounded-xl px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-[#b88746]";

function StatCard({
  label,
  value,
  className = "text-gray-900",
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(33,28,29,0.06)] p-5 border border-[#e8e1dd]">
      <p className="text-gray-500">{label}</p>
      <h2 className={`text-3xl font-bold mt-2 ${className}`}>{value}</h2>
    </div>
  );
}

function CategoryCard({
  category,
  count,
  selected,
  onClick,
}: {
  category: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border p-5 transition ${
        selected
          ? "bg-[#4b2f20] border-[#211c1d] text-white shadow-lg"
          : "bg-white border-gray-200 text-gray-800 hover:border-[#c9a66b] hover:bg-[#fffaf2]"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
          selected ? "bg-white/15" : "bg-gray-100"
        }`}
      >
        <FaCouch />
      </div>

      <p className={`text-sm ${selected ? "text-[#ead8bd]" : "text-gray-500"}`}>
        {category === "All" ? "All Categories" : category}
      </p>

      <p className="text-3xl font-bold mt-1">{count}</p>

      <p
        className={`text-xs mt-1 ${
          selected ? "text-[#ead8bd]" : "text-gray-400"
        }`}
      >
        finished {count === 1 ? "project" : "projects"}
      </p>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border rounded-2xl p-10 text-center">
      <FaCouch className="mx-auto text-gray-300 text-5xl mb-4" />
      <h3 className="text-lg font-semibold text-gray-700">
        No finished projects found
      </h3>
      <p className="text-gray-500 mt-1">
        Click Add Finished Project to create a finished project record.
      </p>
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function DimensionInput({
  label,
  value,
  onChange,
  placeholder = "Enter dimension",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </Field>
  );
}

function MiniValue({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="text-gray-400 text-xs">{label}</span>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b last:border-b-0 pb-2 last:pb-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800 text-right">
        {value || "—"}
      </span>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-semibold mt-1 text-gray-800">{value || "—"}</p>
    </div>
  );
}

function CostBox({
  label,
  value,
  warning = false,
  dark = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 ${
        dark ? "bg-gray-900 text-white" : warning ? "bg-red-50" : "bg-gray-50"
      }`}
    >
      <p
        className={`text-xs ${
          dark ? "text-gray-400" : warning ? "text-red-500" : "text-gray-500"
        }`}
      >
        {label}
      </p>

      <p
        className={`font-bold mt-1 ${
          dark ? "text-white" : warning ? "text-red-700" : "text-gray-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
=======
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/services/uploadImage";

type Project = {
  id?: string;
  title: string;
  description: string;
  price: string;
  difficulty: string;
  youtube_url: string;
  thumbnail: string;
};

const emptyForm: Project = {
  title: "",
  description: "",
  price: "",
  difficulty: "",
  youtube_url: "",
  thumbnail: "",
};

export default function Projects() {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [search, setSearch] =
    useState("");

  const [open, setOpen] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [file, setFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState("");

  const [form, setForm] =
    useState<Project>(
      emptyForm
    );

  function update(
    key: keyof Project,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function closeModal() {
    setOpen(false);

    setEditing(false);

    setFile(null);

    setPreview("");

    setForm(
      emptyForm
    );
  }

  async function loadProjects() {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          "furniture_projects"
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        );

    if (!error) {
      setProjects(
        data || []
      );
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function openAdd() {
    closeModal();

    setOpen(true);
  }

  function openEdit(
    item: Project
  ) {
    setEditing(true);

    setForm(item);

    setPreview(
      item.thumbnail
    );

    setOpen(true);
  }

  async function save() {
    try {
      setLoading(true);

      let image =
        form.thumbnail;

      if (file) {
        image =
          await uploadImage(
            "project-images",
            file
          );
      }

      const payload = {
        title:
          form.title,

        description:
          form.description,

        price:
          Number(
            form.price
          ),

        difficulty:
          form.difficulty,

        youtube_url:
          form.youtube_url,

        thumbnail:
          image,
      };

      let error;

      if (
        editing &&
        form.id
      ) {
        ({
          error,
        } =
          await supabase
            .from(
              "furniture_projects"
            )
            .update(
              payload
            )
            .eq(
              "id",
              form.id
            ));
      } else {
        ({
          error,
        } =
          await supabase
            .from(
              "furniture_projects"
            )
            .insert(
              payload
            ));
      }

      if (error)
        throw error;

      alert(
        editing
          ? "Updated"
          : "Saved"
      );

      closeModal();

      loadProjects();

    } catch (
      err: any
    ) {
      alert(
        err.message
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  async function deleteProject(
  id?: string
) {
  if (!id) return;

  const confirmDelete =
    confirm(
      "Delete this project?"
    );

  if (
    !confirmDelete
  )
    return;

  try {
    const {
      error,
    } =
      await supabase
        .from(
          "furniture_projects"
        )
        .delete()
        .eq(
          "id",
          id
        );

    if (error)
      throw error;

    setProjects(
      (prev) =>
        prev.filter(
          (x) =>
            x.id !== id
        )
    );

    alert(
      "Deleted"
    );

  } catch (
    err: any
  ) {
    alert(
      err.message
    );
  }
}

  const filtered =
    projects.filter(
      (p) =>
        p.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* HEADER */}

      <div className="flex gap-4 mb-10">

        <input
          value={search}
          onChange={(e)=>
            setSearch(
              e.target.value
            )
          }
          placeholder="Search Project..."
          className="
          flex-1
          p-4
          rounded-2xl
          border
          bg-white
          "
        />

        <button
          onClick={
            openAdd
          }
          className="
          px-8
          rounded-2xl
          bg-black
          text-white
          "
        >
          + Add
        </button>

      </div>

      {/* CARDS */}

      <div className="grid md:grid-cols-3 gap-6">

        {filtered.map(
          (item) => (

            <div
              key={
                item.id
              }
              className="
              bg-white
              rounded-3xl
              overflow-hidden
              shadow
              "
            >

              <img
                src={
                  item.thumbnail ||
                  "/placeholder.jpg"
                }
                className="
                h-60
                w-full
                object-cover
                "
              />

              <div className="p-6">

                <h2 className="text-2xl font-bold">
                  {
                    item.title
                  }
                </h2>

                <p className="text-gray-500">
                  {
                    item.description
                  }
                </p>

                <div
className="
mt-5
flex
gap-3
"
>

<button
onClick={()=>
openEdit(
item
)
}
className="
flex-1
bg-orange-500
text-white
p-3
rounded-xl
"
>

Edit

</button>

<button
onClick={()=>
deleteProject(
item.id
)
}
className="
flex-1
bg-red-500
text-white
p-3
rounded-xl
"
>

Delete

</button>

</div>

              </div>

            </div>

          )
        )}

      </div>

      {/* MODAL */}

      {open && (

        <div
          onClick={
            closeModal
          }
          className="
          fixed
          inset-0
          bg-black/50
          flex
          justify-center
          items-center
          z-50
          "
        >

          <div
            onClick={(e)=>
              e.stopPropagation()
            }
            className="
            relative
            bg-white
            rounded-3xl
            w-[900px]
            p-8
            grid
            md:grid-cols-2
            gap-8
            "
          >

            {/* CLOSE */}

            <button
              onClick={
                closeModal
              }
              className="
              absolute
              right-5
              top-5

              w-10
              h-10

              rounded-full

              bg-gray-100

              hover:bg-red-500
              hover:text-white
              "
            >
              ✕

            </button>

            {/* FORM */}

            <div className="space-y-4">

              <h1 className="text-3xl font-bold">

                {
                  editing
                    ? "Edit"
                    : "Add"
                }

                Project

              </h1>

              <input
                value={
                  form.title
                }
                onChange={(e)=>
                  update(
                    "title",
                    e.target.value
                  )
                }
                placeholder="Title"
                className="w-full p-4 border rounded-xl"
              />

              <textarea
                rows={5}
                value={
                  form.description
                }
                onChange={(e)=>
                  update(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Description"
                className="w-full p-4 border rounded-xl"
              />

              <input
                value={
                  form.price
                }
                onChange={(e)=>
                  update(
                    "price",
                    e.target.value
                  )
                }
                placeholder="Price"
                className="w-full p-4 border rounded-xl"
              />

             <select
value={
form.difficulty
}
onChange={(e)=>
update(
"difficulty",
e.target.value
)
}

className="
w-full
p-4
border
rounded-xl
"
>

<option value="">
Select Difficulty
</option>

<option value="Easy">
Easy
</option>

<option value="Hard">
Hard
</option>

<option value="Difficult">
Difficult
</option>

</select>

              <input
                value={
                  form.youtube_url
                }
                onChange={(e)=>
                  update(
                    "youtube_url",
                    e.target.value
                  )
                }
                placeholder="Youtube"
                className="w-full p-4 border rounded-xl"
              />

              <input
                type="file"
                onChange={(e)=>{

                  const f =
                    e.target
                      .files?.[0];

                  if (
                    f
                  ) {

                    setFile(
                      f
                    );

                    setPreview(
                      URL.createObjectURL(
                        f
                      )
                    );

                  }

                }}className="w-full p-4 border rounded-xl"
              />

              <button
                onClick={
                  save
                }
                className="
                w-full
                bg-black
                text-white
                p-4
                rounded-xl
                "
              >
                {
                  loading
                    ? "Saving..."
                    : "Save"
                }
              </button>

            </div>

            {/* PREVIEW */}

            <div className="rounded-3xl overflow-hidden shadow">

              <img
                src={
                  preview ||
                  form.thumbnail ||
                  "/placeholder.jpg"
                }
                className="
                h-64
                w-full
                object-cover
                "
              />

              <div
className="
p-8
space-y-4
"
>

<h1
className="
text-3xl
font-bold
"
>

{
form.title
||
"Project"
}

</h1>

<p
className="
text-gray-500
"
>

{
form.description
||
"Description"
}

</p>

<div
className="
space-y-3
"
>

<p>

💰 Price:

<b>

₱

{
form.price
||
"0"
}

</b>

</p>

<p>

⚒ Difficulty:

<b>

{
form.difficulty
||
"-"
}

</b>

</p>

<p
className="
break-all
"
>

▶ Youtube:

<br/>

<span
className="
text-blue-600
"
>

{
form.youtube_url
||
"-"
}

</span>

</p>

</div>

</div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7
