"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaEye,
  FaPrint,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaFileInvoiceDollar,
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
  FaProjectDiagram,
  FaArrowLeft,
  FaSave,
  FaCheckCircle,
  FaClock,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type QuotationStatus = "pending" | "approved";

type QuotationItem = {
  id: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
  section: "materials" | "varnish" | "upholstery" | "labor";
};

type Quotation = {
  id: string;
  quotation_no: string;
  quotation_date: string;

  customer_name: string;
  customer_address: string;
  project_name: string;
  project_location: string;

  items: QuotationItem[];

  materials_subtotal: number;
  varnish_subtotal: number;
  upholstery_subtotal: number;
  labor_subtotal: number;
  total_cost: number;

  status: QuotationStatus;

  created_at: string;
  updated_at?: string | null;
};

/* =========================================================
   CONSTANTS
========================================================= */

const QUOTATIONS_TABLE = "quotations";

const SHOP_NAME = "JGME FURNITURE SHOP";
const SHOP_LOCATION = "San Jose, Occidental Mindoro";

const DEFAULT_CUSTOMER = "Divine Word College of San Jose - Chapel";
const DEFAULT_ADDRESS =
  "General Lukban Street, Barangay 8, San Jose, 5100 Occidental Mindoro, Philippines";
const DEFAULT_PROJECT = "Long Chair";
const DEFAULT_PROJECT_LOCATION = "Divine Word College of San Jose - Chapel";

/* =========================================================
   HELPERS
========================================================= */

function money(value: number | string | null | undefined) {
  const amount = Number(value || 0);

  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function numberValue(value: string | number | null | undefined) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatInputMoney(value: string | number) {
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

function formatDate(date: string) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function formatDateTime(date: string) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getTodayInputValue() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createQuotationNumber() {
  const now = new Date();

  const year = now.getFullYear();

  const random = Math.floor(1000 + Math.random() * 9000);

  return `QT-${year}-${random}`;
}

function createItem(
  section: QuotationItem["section"],
  description = "",
): QuotationItem {
  return {
    id: crypto.randomUUID(),
    description,
    qty: 1,
    unit: "pcs",
    rate: 0,
    amount: 0,
    section,
  };
}

/* =========================================================
   DEFAULT ITEMS
========================================================= */

const defaultMaterials: QuotationItem[] = [
  {
    id: crypto.randomUUID(),
    description: 'Mahogany / Gemelina - 1" × 6" × 10\'',
    qty: 7,
    unit: "pcs",
    rate: 60,
    amount: 420,
    section: "materials",
  },
  {
    id: crypto.randomUUID(),
    description: 'Mahogany / Gemelina - 1" × 12" × 10\'',
    qty: 1,
    unit: "pcs",
    rate: 60,
    amount: 60,
    section: "materials",
  },
  {
    id: crypto.randomUUID(),
    description: 'Mahogany / Gemelina - 2" × 6" × 3\'',
    qty: 3,
    unit: "pcs",
    rate: 60,
    amount: 180,
    section: "materials",
  },
  {
    id: crypto.randomUUID(),
    description: 'Mahogany / Gemelina - 2" × 12" × 5\'',
    qty: 1,
    unit: "pcs",
    rate: 60,
    amount: 60,
    section: "materials",
  },
  {
    id: crypto.randomUUID(),
    description: 'Mahogany / Gemelina - 2" × 3" × 10\'',
    qty: 1,
    unit: "pcs",
    rate: 60,
    amount: 60,
    section: "materials",
  },
];

const defaultVarnish: QuotationItem[] = [
  {
    id: crypto.randomUUID(),
    description: "Gloss",
    qty: 0.5,
    unit: "Liter",
    rate: 500,
    amount: 250,
    section: "varnish",
  },
  {
    id: crypto.randomUUID(),
    description: "Sanding Sealer",
    qty: 0.5,
    unit: "Liter",
    rate: 300,
    amount: 150,
    section: "varnish",
  },
  {
    id: crypto.randomUUID(),
    description: "Lacquer Thinner",
    qty: 2,
    unit: "Bottle",
    rate: 55,
    amount: 110,
    section: "varnish",
  },
  {
    id: crypto.randomUUID(),
    description: "Sand Paper",
    qty: 5,
    unit: "Pcs",
    rate: 15,
    amount: 75,
    section: "varnish",
  },
  {
    id: crypto.randomUUID(),
    description: "Oil Color",
    qty: 0.5,
    unit: "Liter",
    rate: 330,
    amount: 165,
    section: "varnish",
  },
];

const defaultUpholstery: QuotationItem[] = [
  {
    id: crypto.randomUUID(),
    description: "Uratex Foam w/ Lether Cover",
    qty: 1,
    unit: "Set",
    rate: 750,
    amount: 750,
    section: "upholstery",
  },
];

const defaultLabor: QuotationItem[] = [
  {
    id: crypto.randomUUID(),
    description: "Labor Cost",
    qty: 1,
    unit: "Job",
    rate: 4212,
    amount: 4212,
    section: "labor",
  },
];

/* =========================================================
   FORM TYPE
========================================================= */

type QuotationForm = {
  quotationDate: string;
  customerName: string;
  customerAddress: string;
  projectName: string;
  projectLocation: string;
  materials: QuotationItem[];
  varnish: QuotationItem[];
  upholstery: QuotationItem[];
  labor: QuotationItem[];
};

/* =========================================================
   PAGE
========================================================= */

export default function Page() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
    null,
  );

  const [deleteTarget, setDeleteTarget] = useState<Quotation | null>(null);

  const [toast, setToast] = useState<{
    tone: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const [form, setForm] = useState<QuotationForm>({
    quotationDate: getTodayInputValue(),
    customerName: DEFAULT_CUSTOMER,
    customerAddress: DEFAULT_ADDRESS,
    projectName: DEFAULT_PROJECT,
    projectLocation: DEFAULT_PROJECT_LOCATION,
    materials: [],
    varnish: [],
    upholstery: [],
    labor: [],
  });

  /* =========================================================
     TOAST
  ========================================================= */

  function showToast(tone: "success" | "error" | "info", message: string) {
    setToast({
      tone,
      message,
    });
  }

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [toast]);

  /* =========================================================
     LOAD
  ========================================================= */

  useEffect(() => {
    void loadQuotations();
  }, []);

  async function loadQuotations() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from(QUOTATIONS_TABLE)
        .select("*")
        .order("quotation_date", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw new Error(error.message);
      }

      const normalized = (data ?? []).map((quotation) => ({
        ...(quotation as Quotation),
        items: Array.isArray(quotation.items)
          ? (quotation.items as QuotationItem[])
          : [],
        materials_subtotal: numberValue(quotation.materials_subtotal),
        varnish_subtotal: numberValue(quotation.varnish_subtotal),
        upholstery_subtotal: numberValue(quotation.upholstery_subtotal),
        labor_subtotal: numberValue(quotation.labor_subtotal),
        total_cost: numberValue(quotation.total_cost),
      }));

      setQuotations(normalized);
    } catch (error) {
      console.error("Load quotations error:", error);

      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to load quotations.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     RESET FORM
  ========================================================= */

  function resetForm() {
    setForm({
      quotationDate: getTodayInputValue(),
      customerName: DEFAULT_CUSTOMER,
      customerAddress: DEFAULT_ADDRESS,
      projectName: DEFAULT_PROJECT,
      projectLocation: DEFAULT_PROJECT_LOCATION,
      materials: [],
      varnish: [],
      upholstery: [],
      labor: [],
    });
  }

  function openCreateModal() {
    resetForm();
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (saving) return;

    setIsCreateModalOpen(false);
    resetForm();
  }

  /* =========================================================
     ITEM CALCULATION
  ========================================================= */

  function updateItem(
    section: keyof Pick<
      QuotationForm,
      "materials" | "varnish" | "upholstery" | "labor"
    >,
    id: string,
    field: keyof QuotationItem,
    value: string | number,
  ) {
    setForm((previous) => ({
      ...previous,
      [section]: previous[section].map((item) => {
        if (item.id !== id) return item;

        const updated = {
          ...item,
          [field]: value,
        };

        const qty = numberValue(updated.qty);
        const rate = numberValue(updated.rate);

        updated.amount = qty * rate;

        return updated;
      }),
    }));
  }

  function addItem(
    section: keyof Pick<
      QuotationForm,
      "materials" | "varnish" | "upholstery" | "labor"
    >,
  ) {
    const sectionType =
      section === "materials"
        ? "materials"
        : section === "varnish"
          ? "varnish"
          : section === "upholstery"
            ? "upholstery"
            : "labor";

    setForm((previous) => ({
      ...previous,
      [section]: [...previous[section], createItem(sectionType)],
    }));
  }

  function removeItem(
    section: keyof Pick<
      QuotationForm,
      "materials" | "varnish" | "upholstery" | "labor"
    >,
    id: string,
  ) {
    setForm((previous) => ({
      ...previous,
      [section]: previous[section].filter((item) => item.id !== id),
    }));
  }

  /* =========================================================
     SUBTOTALS
  ========================================================= */

  const materialsSubtotal = useMemo(
    () =>
      form.materials.reduce(
        (total, item) => total + numberValue(item.amount),
        0,
      ),
    [form.materials],
  );

  const varnishSubtotal = useMemo(
    () =>
      form.varnish.reduce((total, item) => total + numberValue(item.amount), 0),
    [form.varnish],
  );

  const upholsterySubtotal = useMemo(
    () =>
      form.upholstery.reduce(
        (total, item) => total + numberValue(item.amount),
        0,
      ),
    [form.upholstery],
  );

  const laborSubtotal = useMemo(
    () =>
      form.labor.reduce((total, item) => total + numberValue(item.amount), 0),
    [form.labor],
  );

  const totalCost =
    materialsSubtotal + varnishSubtotal + upholsterySubtotal + laborSubtotal;

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredQuotations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return quotations;

    return quotations.filter((quotation) =>
      [
        quotation.quotation_no,
        quotation.customer_name,
        quotation.project_name,
        quotation.project_location,
        quotation.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [quotations, search]);

  function handleSearch() {
    setSearch(searchInput);
  }

  /* =========================================================
     COUNTS
  ========================================================= */

  const totalQuotations = quotations.length;

  const approvedQuotations = quotations.filter(
    (quotation) => quotation.status === "approved",
  ).length;

  const pendingQuotations = quotations.filter(
    (quotation) => quotation.status === "pending",
  ).length;

  /* =========================================================
     SAVE QUOTATION
  ========================================================= */

  async function handleSaveQuotation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.customerName.trim()) {
      showToast("error", "Please enter the customer / organization.");
      return;
    }

    if (!form.customerAddress.trim()) {
      showToast("error", "Please enter the customer address.");
      return;
    }

    if (!form.projectName.trim()) {
      showToast("error", "Please enter the project name.");
      return;
    }

    if (!form.projectLocation.trim()) {
      showToast("error", "Please enter the project location.");
      return;
    }

    if (!form.quotationDate) {
      showToast("error", "Please select the quotation date.");
      return;
    }

    if (
      form.materials.length === 0 &&
      form.varnish.length === 0 &&
      form.upholstery.length === 0 &&
      form.labor.length === 0
    ) {
      showToast("error", "Please add at least one quotation item.");
      return;
    }

    setSaving(true);

    try {
      const allItems = [
        ...form.materials,
        ...form.varnish,
        ...form.upholstery,
        ...form.labor,
      ];

      const quotationNo = createQuotationNumber();

      const payload = {
        quotation_no: quotationNo,
        quotation_date: form.quotationDate,

        customer_name: form.customerName.trim(),
        customer_address: form.customerAddress.trim(),
        project_name: form.projectName.trim(),
        project_location: form.projectLocation.trim(),

        items: allItems,

        materials_subtotal: materialsSubtotal,
        varnish_subtotal: varnishSubtotal,
        upholstery_subtotal: upholsterySubtotal,
        labor_subtotal: laborSubtotal,

        total_cost: totalCost,

        status: "pending" as QuotationStatus,
      };

      const { data, error } = await supabase
        .from(QUOTATIONS_TABLE)
        .insert(payload)
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const savedQuotation: Quotation = {
        ...(data as Quotation),
        items: allItems,
        materials_subtotal: materialsSubtotal,
        varnish_subtotal: varnishSubtotal,
        upholstery_subtotal: upholsterySubtotal,
        labor_subtotal: laborSubtotal,
        total_cost: totalCost,
        status: "pending",
      };

      setQuotations((previous) => [savedQuotation, ...previous]);

      setIsCreateModalOpen(false);
      resetForm();

      showToast("success", `${quotationNo} saved successfully.`);
    } catch (error) {
      console.error("Save quotation error:", error);

      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to save quotation.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     APPROVE
  ========================================================= */

  async function approveQuotation(quotation: Quotation) {
    try {
      const { data, error } = await supabase
        .from(QUOTATIONS_TABLE)
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", quotation.id)
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const updatedQuotation: Quotation = {
        ...(data as Quotation),
        items: Array.isArray(data.items)
          ? (data.items as QuotationItem[])
          : quotation.items,
        materials_subtotal: numberValue(data.materials_subtotal),
        varnish_subtotal: numberValue(data.varnish_subtotal),
        upholstery_subtotal: numberValue(data.upholstery_subtotal),
        labor_subtotal: numberValue(data.labor_subtotal),
        total_cost: numberValue(data.total_cost),
        status: "approved",
      };

      setQuotations((previous) =>
        previous.map((item) =>
          item.id === quotation.id ? updatedQuotation : item,
        ),
      );

      setSelectedQuotation(updatedQuotation);

      showToast("success", `${quotation.quotation_no} approved successfully.`);
    } catch (error) {
      console.error("Approve quotation error:", error);

      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to approve quotation.",
      );
    }
  }

  /* =========================================================
     DELETE
  ========================================================= */

  function requestDelete(quotation: Quotation) {
    setDeleteTarget(quotation);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const quotation = deleteTarget;

    setDeleteTarget(null);

    try {
      const { error } = await supabase
        .from(QUOTATIONS_TABLE)
        .delete()
        .eq("id", quotation.id);

      if (error) {
        throw new Error(error.message);
      }

      setQuotations((previous) =>
        previous.filter((item) => item.id !== quotation.id),
      );

      if (selectedQuotation?.id === quotation.id) {
        setSelectedQuotation(null);
      }

      showToast(
        "success",
        `${quotation.quotation_no} was deleted successfully.`,
      );
    } catch (error) {
      console.error("Delete quotation error:", error);

      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to delete quotation.",
      );
    }
  }

  /* =========================================================
     PRINT PDF
  ========================================================= */

  function printQuotation(quotation: Quotation) {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();

      let y = 18;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);

      pdf.text(SHOP_NAME, pageWidth / 2, y, {
        align: "center",
      });

      y += 6;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);

      pdf.text(SHOP_LOCATION, pageWidth / 2, y, {
        align: "center",
      });

      y += 10;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);

      pdf.text(
        "QUOTATION FOR " + quotation.project_name.toUpperCase(),
        pageWidth / 2,
        y,
        {
          align: "center",
        },
      );

      y += 8;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      pdf.text(`Quotation No: ${quotation.quotation_no}`, 15, y);

      pdf.text(
        `Date: ${formatDate(quotation.quotation_date)}`,
        pageWidth - 15,
        y,
        {
          align: "right",
        },
      );

      y += 8;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);

      pdf.text("Customer/Organization Information", 15, y);

      y += 6;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      pdf.text(`Customer/Organization: ${quotation.customer_name}`, 15, y);

      y += 5;

      const addressLines = pdf.splitTextToSize(
        `Address: ${quotation.customer_address}`,
        pageWidth - 30,
      );

      pdf.text(addressLines, 15, y);

      y += addressLines.length * 5;

      pdf.text(`Project: ${quotation.project_name}`, 15, y);

      y += 5;

      const locationLines = pdf.splitTextToSize(
        `Project Location: ${quotation.project_location}`,
        pageWidth - 30,
      );

      pdf.text(locationLines, 15, y);

      y += locationLines.length * 5 + 5;

      /* -----------------------------------------------------
         MATERIALS
      ----------------------------------------------------- */

      const materials = quotation.items.filter(
        (item) => item.section === "materials",
      );

      if (materials.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);

        pdf.text("A. MATERIALS", 15, y);

        y += 2;

        autoTable(pdf, {
          startY: y,
          margin: {
            left: 15,
            right: 15,
          },
          head: [["DESCRIPTION", "QTY", "UNIT", "RATE", "AMOUNT"]],
          body: materials.map((item) => [
            item.description,
            String(item.qty),
            item.unit,
            money(item.rate),
            money(item.amount),
          ]),
          theme: "grid",
          styles: {
            fontSize: 8,
            cellPadding: 2.5,
          },
          headStyles: {
            fontStyle: "bold",
          },
          columnStyles: {
            0: {
              cellWidth: 85,
            },
            1: {
              cellWidth: 15,
              halign: "center",
            },
            2: {
              cellWidth: 22,
              halign: "center",
            },
            3: {
              cellWidth: 28,
              halign: "right",
            },
            4: {
              cellWidth: 28,
              halign: "right",
            },
          },
        });

        y = (pdf as any).lastAutoTable.finalY + 4;

        pdf.setFont("helvetica", "bold");

        pdf.text(
          `SUBTOTAL: ${money(quotation.materials_subtotal)}`,
          pageWidth - 15,
          y,
          {
            align: "right",
          },
        );

        y += 8;
      }

      /* -----------------------------------------------------
         VARNISH
      ----------------------------------------------------- */

      const varnish = quotation.items.filter(
        (item) => item.section === "varnish",
      );

      if (varnish.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);

        pdf.text("B. VARNISH FINISHER", 15, y);

        y += 2;

        autoTable(pdf, {
          startY: y,
          margin: {
            left: 15,
            right: 15,
          },
          head: [["DESCRIPTION", "QTY", "UNIT", "AMOUNT"]],
          body: varnish.map((item) => [
            item.description,
            String(item.qty),
            item.unit,
            money(item.amount),
          ]),
          theme: "grid",
          styles: {
            fontSize: 8,
            cellPadding: 2.5,
          },
          headStyles: {
            fontStyle: "bold",
          },
          columnStyles: {
            0: {
              cellWidth: 105,
            },
            1: {
              cellWidth: 20,
              halign: "center",
            },
            2: {
              cellWidth: 30,
              halign: "center",
            },
            3: {
              cellWidth: 35,
              halign: "right",
            },
          },
        });

        y = (pdf as any).lastAutoTable.finalY + 4;

        pdf.setFont("helvetica", "bold");

        pdf.text(
          `SUBTOTAL: ${money(quotation.varnish_subtotal)}`,
          pageWidth - 15,
          y,
          {
            align: "right",
          },
        );

        y += 8;
      }

      /* -----------------------------------------------------
         UPHOLSTERY
      ----------------------------------------------------- */

      const upholstery = quotation.items.filter(
        (item) => item.section === "upholstery",
      );

      if (upholstery.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);

        pdf.text("C. UPHOLSTERY", 15, y);

        y += 2;

        autoTable(pdf, {
          startY: y,
          margin: {
            left: 15,
            right: 15,
          },
          head: [["DESCRIPTION", "QTY", "UNIT", "AMOUNT"]],
          body: upholstery.map((item) => [
            item.description,
            String(item.qty),
            item.unit,
            money(item.amount),
          ]),
          theme: "grid",
          styles: {
            fontSize: 8,
            cellPadding: 2.5,
          },
          headStyles: {
            fontStyle: "bold",
          },
          columnStyles: {
            0: {
              cellWidth: 105,
            },
            1: {
              cellWidth: 20,
              halign: "center",
            },
            2: {
              cellWidth: 30,
              halign: "center",
            },
            3: {
              cellWidth: 35,
              halign: "right",
            },
          },
        });

        y = (pdf as any).lastAutoTable.finalY + 4;

        pdf.setFont("helvetica", "bold");

        pdf.text(
          `SUBTOTAL: ${money(quotation.upholstery_subtotal)}`,
          pageWidth - 15,
          y,
          {
            align: "right",
          },
        );

        y += 8;
      }

      /* -----------------------------------------------------
         LABOR
      ----------------------------------------------------- */

      const labor = quotation.items.filter((item) => item.section === "labor");

      if (labor.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);

        pdf.text("D. LABOR", 15, y);

        y += 2;

        autoTable(pdf, {
          startY: y,
          margin: {
            left: 15,
            right: 15,
          },
          head: [["DESCRIPTION", "QTY", "UNIT", "RATE", "AMOUNT"]],
          body: labor.map((item) => [
            item.description,
            String(item.qty),
            item.unit,
            money(item.rate),
            money(item.amount),
          ]),
          theme: "grid",
          styles: {
            fontSize: 8,
            cellPadding: 2.5,
          },
          headStyles: {
            fontStyle: "bold",
          },
          columnStyles: {
            0: {
              cellWidth: 85,
            },
            1: {
              cellWidth: 15,
              halign: "center",
            },
            2: {
              cellWidth: 22,
              halign: "center",
            },
            3: {
              cellWidth: 28,
              halign: "right",
            },
            4: {
              cellWidth: 28,
              halign: "right",
            },
          },
        });

        y = (pdf as any).lastAutoTable.finalY + 4;

        pdf.setFont("helvetica", "bold");

        pdf.text(
          `SUBTOTAL: ${money(quotation.labor_subtotal)}`,
          pageWidth - 15,
          y,
          {
            align: "right",
          },
        );

        y += 12;
      }

      /* -----------------------------------------------------
         TOTAL
      ----------------------------------------------------- */

      pdf.setDrawColor(80, 80, 80);

      pdf.line(15, y, pageWidth - 15, y);

      y += 8;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);

      pdf.text(
        `TOTAL COST: ${money(quotation.total_cost)}`,
        pageWidth - 15,
        y,
        {
          align: "right",
        },
      );

      y += 18;

      /* -----------------------------------------------------
         SIGNATURES
      ----------------------------------------------------- */

      pdf.setFontSize(9);

      pdf.text("Prepared By:", 20, y);

      pdf.text("Approved / Accepted By:", pageWidth / 2 + 10, y);

      y += 18;

      pdf.line(20, y, 75, y);

      pdf.line(pageWidth / 2 + 10, y, pageWidth - 20, y);

      y += 5;

      pdf.setFont("helvetica", "bold");

      pdf.text("Edwin L. Curammeng", 20, y);

      pdf.setFont("helvetica", "normal");

      pdf.text("Customer / Organization", pageWidth / 2 + 10, y);

      y += 5;

      pdf.text("Owner / Furniture Maker", 20, y);

      y += 12;

      pdf.text(`Date: ${formatDate(quotation.quotation_date)}`, 20, y);

      pdf.text("Sign Date: __________________", pageWidth / 2 + 10, y);

      /* -----------------------------------------------------
         FOOTER
      ----------------------------------------------------- */

      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");

      pdf.text(`Generated from ${SHOP_NAME}`, pageWidth / 2, pageHeight - 8, {
        align: "center",
      });

      pdf.save(`${quotation.quotation_no}-Quotation.pdf`);

      showToast(
        "success",
        `${quotation.quotation_no}-Quotation.pdf generated.`,
      );
    } catch (error) {
      console.error("PDF generation error:", error);

      showToast("error", "Failed to generate quotation PDF.");
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f6ead8] p-4 md:p-6 space-y-7 text-[#2b1b14]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#211c1d]">
            Quotations
          </h1>

          <p className="text-[#806650] mt-1">
            Create, manage, approve, view and print customer quotations.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4b2f20] px-5 py-3 text-white shadow-sm transition hover:bg-[#6e4932]"
        >
          <FaPlus />
          Create Quotation
        </button>
      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          icon={<FaFileInvoiceDollar />}
          label="Total Quotations"
          value={totalQuotations}
          description="All saved quotations"
        />

        <StatCard
          icon={<FaClock />}
          label="For Approval"
          value={pendingQuotations}
          description="Quotations waiting for approval"
          className="text-amber-700"
        />

        <StatCard
          icon={<FaCheckCircle />}
          label="Approved Quotations"
          value={approvedQuotations}
          description="Approved customer quotations"
          className="text-emerald-600"
        />
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <section>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-4 text-gray-400" />

            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Search quotation number, customer, project..."
              className="w-full rounded-xl border border-[#dfc7ab] bg-[#fffaf2] py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#a06a3e]"
            />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4b2f20] px-6 py-3 font-semibold text-white hover:bg-[#6e4932]"
          >
            <FaSearch />
            Search
          </button>

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSearchInput("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c9a77f] bg-white px-5 py-3 font-semibold text-[#4b2f20] hover:bg-[#fff4df]"
            >
              <FaTimes />
              Clear
            </button>
          )}
        </div>
      </section>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-[#4b2f20]">
            Quotation Records
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            {filteredQuotations.length} quotation
            {filteredQuotations.length === 1 ? "" : "s"} found.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="animate-spin text-[#a06a3e] text-3xl" />
          </div>
        ) : filteredQuotations.length === 0 ? (
          <EmptyQuotationState onCreate={openCreateModal} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#dfc7ab] bg-[#fffaf2] shadow-[0_10px_30px_rgba(75,47,32,0.12)]">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-[#4b2f20] text-[#fffaf2]">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">
                    Quotation
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">
                    Project
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">
                    Date
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">
                    Total
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#ead8c1]">
                {filteredQuotations.map((quotation) => (
                  <QuotationTableRow
                    key={quotation.id}
                    quotation={quotation}
                    onView={() => setSelectedQuotation(quotation)}
                    onPrint={() => printQuotation(quotation)}
                    onDelete={() => requestDelete(quotation)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <div
          role="status"
          className={`fixed right-5 top-5 z-[200] flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_16px_40px_rgba(33,28,29,0.16)] ${
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
              <FaTimes />
            ) : (
              <FaFileInvoiceDollar />
            )}
          </span>

          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* =====================================================
          CREATE MODAL
      ===================================================== */}

      {isCreateModalOpen && (
        <CreateQuotationModal
          form={form}
          setForm={setForm}
          saving={saving}
          materialsSubtotal={materialsSubtotal}
          varnishSubtotal={varnishSubtotal}
          upholsterySubtotal={upholsterySubtotal}
          laborSubtotal={laborSubtotal}
          totalCost={totalCost}
          onClose={closeCreateModal}
          onSave={handleSaveQuotation}
          addItem={addItem}
          removeItem={removeItem}
          updateItem={updateItem}
        />
      )}

      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      {selectedQuotation && (
        <QuotationViewModal
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
          onApprove={() => void approveQuotation(selectedQuotation)}
          onPrint={() => printQuotation(selectedQuotation)}
        />
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteTarget && (
        <DeleteQuotationModal
          quotation={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </div>
  );
}

/* ===========================================================
   STAT CARD
=========================================================== */

function StatCard({
  icon,
  label,
  value,
  description,
  className = "text-[#211c1d]",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  className?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(33,28,29,0.06)] p-5 border border-[#e8e1dd]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>

          <h2 className={`text-3xl font-bold mt-2 ${className}`}>{value}</h2>

          <p className="text-xs text-gray-400 mt-2">{description}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6ead8] text-[#4b2f20]">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
   TABLE ROW
=========================================================== */

function QuotationTableRow({
  quotation,
  onView,
  onPrint,
  onDelete,
}: {
  quotation: Quotation;
  onView: () => void;
  onPrint: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="align-middle transition hover:bg-[#fffaf2]">
      <td className="px-5 py-4">
        <p className="font-bold text-[#211c1d]">{quotation.quotation_no}</p>

        <span
          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            quotation.status === "approved"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {quotation.status === "approved" ? "Approved" : "Pending"}
        </span>
      </td>

      <td className="px-5 py-4 max-w-[270px]">
        <p className="text-sm font-semibold text-gray-800">
          {quotation.customer_name}
        </p>

        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {quotation.customer_address}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="font-semibold text-gray-800">{quotation.project_name}</p>

        <p className="text-xs text-gray-500 mt-1">
          {quotation.project_location}
        </p>
      </td>

      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
        {formatDate(quotation.quotation_date)}
      </td>

      <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-[#211c1d]">
        {money(quotation.total_cost)}
      </td>

      <td className="px-5 py-4">
        {quotation.status === "approved" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <FaCheckCircle />
            Approved
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
            <FaClock />
            For Approval
          </span>
        )}
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onPrint}
            title="Print / Download PDF"
            className="inline-flex items-center gap-2 rounded-lg border border-[#c9a66b] px-3 py-2 text-sm font-semibold text-[#211c1d] hover:bg-[#f8f1e8]"
          >
            <FaPrint />
            Print
          </button>

          <button
            type="button"
            onClick={onView}
            title="View quotation"
            className="inline-flex items-center gap-2 rounded-lg border border-[#c9a66b] px-3 py-2 text-sm font-semibold text-[#211c1d] hover:bg-[#f8f1e8]"
          >
            <FaEye />
            View
          </button>

          <button
            type="button"
            onClick={onDelete}
            title="Delete quotation"
            className="inline-flex items-center justify-center rounded-lg border border-[#e2c4c0] px-3 py-2 text-sm font-semibold text-[#a33b32] hover:bg-[#fff5f3]"
          >
            <FaTrash />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ===========================================================
   CREATE QUOTATION MODAL
=========================================================== */

function CreateQuotationModal({
  form,
  setForm,
  saving,
  materialsSubtotal,
  varnishSubtotal,
  upholsterySubtotal,
  laborSubtotal,
  totalCost,
  onClose,
  onSave,
  addItem,
  removeItem,
  updateItem,
}: {
  form: QuotationForm;
  setForm: React.Dispatch<React.SetStateAction<QuotationForm>>;
  saving: boolean;
  materialsSubtotal: number;
  varnishSubtotal: number;
  upholsterySubtotal: number;
  laborSubtotal: number;
  totalCost: number;
  onClose: () => void;
  onSave: (event: React.FormEvent<HTMLFormElement>) => void;
  addItem: (
    section: keyof Pick<
      QuotationForm,
      "materials" | "varnish" | "upholstery" | "labor"
    >,
  ) => void;
  removeItem: (
    section: keyof Pick<
      QuotationForm,
      "materials" | "varnish" | "upholstery" | "labor"
    >,
    id: string,
  ) => void;
  updateItem: (
    section: keyof Pick<
      QuotationForm,
      "materials" | "varnish" | "upholstery" | "labor"
    >,
    id: string,
    field: keyof QuotationItem,
    value: string | number,
  ) => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#2b1b14]/65">
      <div className="w-full h-full overflow-hidden flex flex-col bg-[#fffaf2] text-[#2b1b14]">
        {/* Header */}

        <div className="shrink-0 border-b border-[#dfc7ab] px-4 md:px-7 py-4 flex items-center justify-between gap-4 bg-[#fffaf2]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl p-2 text-[#806650] hover:bg-[#f6ead8] hover:text-[#4b2f20] disabled:opacity-50"
            >
              <FaArrowLeft />
            </button>

            <div>
              <h2 className="text-2xl font-bold text-[#4b2f20]">
                Create Quotation
              </h2>

              <p className="text-[#806650] text-sm">
                Prepare a quotation for the customer or organization.
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 rounded-xl bg-[#f6ead8] px-4 py-2 text-sm font-semibold text-[#4b2f20]">
            <FaFileInvoiceDollar />
            New Quotation
          </div>
        </div>

        {/* Form */}

        <form onSubmit={onSave} className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl p-4 md:p-7 space-y-7">
              {/* CUSTOMER INFO */}

              <section>
                <SectionTitle
                  title="Customer / Organization Information"
                  subtitle="Enter the customer and project details that will appear on the quotation."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Date">
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-4 top-4 text-gray-400" />

                      <input
                        type="date"
                        value={form.quotationDate}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            quotationDate: event.target.value,
                          }))
                        }
                        className={`${inputClass} pl-11`}
                        required
                      />
                    </div>
                  </Field>

                  <Field label="Customer / Organization">
                    <div className="relative">
                      <FaUser className="absolute left-4 top-4 text-gray-400" />

                      <input
                        value={form.customerName}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            customerName: event.target.value,
                          }))
                        }
                        className={`${inputClass} pl-11`}
                        placeholder="Customer / Organization"
                        required
                      />
                    </div>
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Address">
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400" />

                        <textarea
                          value={form.customerAddress}
                          onChange={(event) =>
                            setForm((previous) => ({
                              ...previous,
                              customerAddress: event.target.value,
                            }))
                          }
                          rows={3}
                          className={`${inputClass} pl-11 resize-none`}
                          required
                        />
                      </div>
                    </Field>
                  </div>

                  <Field label="Project">
                    <div className="relative">
                      <FaProjectDiagram className="absolute left-4 top-4 text-gray-400" />

                      <input
                        value={form.projectName}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            projectName: event.target.value,
                          }))
                        }
                        className={`${inputClass} pl-11`}
                        placeholder="Project name"
                        required
                      />
                    </div>
                  </Field>

                  <Field label="Project Location">
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400" />

                      <input
                        value={form.projectLocation}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            projectLocation: event.target.value,
                          }))
                        }
                        className={`${inputClass} pl-11`}
                        placeholder="Project location"
                        required
                      />
                    </div>
                  </Field>
                </div>
              </section>

              {/* MATERIALS */}

              <QuotationSection
                title="A. MATERIALS"
                subtitle="Add all lumber, boards and other material items."
                items={form.materials}
                section="materials"
                subtotal={materialsSubtotal}
                onAdd={() => addItem("materials")}
                onRemove={(id) => removeItem("materials", id)}
                onUpdate={(id, field, value) =>
                  updateItem("materials", id, field, value)
                }
              />

              {/* VARNISH */}

              <QuotationSection
                title="B. VARNISH FINISHER"
                subtitle="Add varnish, sealer, thinner, sandpaper and finishing items."
                items={form.varnish}
                section="varnish"
                subtotal={varnishSubtotal}
                onAdd={() => addItem("varnish")}
                onRemove={(id) => removeItem("varnish", id)}
                onUpdate={(id, field, value) =>
                  updateItem("varnish", id, field, value)
                }
              />

              {/* UPHOLSTERY */}

              <QuotationSection
                title="C. UPHOLSTERY"
                subtitle="Add foam, leather cover and upholstery requirements."
                items={form.upholstery}
                section="upholstery"
                subtotal={upholsterySubtotal}
                onAdd={() => addItem("upholstery")}
                onRemove={(id) => removeItem("upholstery", id)}
                onUpdate={(id, field, value) =>
                  updateItem("upholstery", id, field, value)
                }
              />

              {/* LABOR */}

              <QuotationSection
                title="D. LABOR"
                subtitle="Add labor or workmanship charges."
                items={form.labor}
                section="labor"
                subtotal={laborSubtotal}
                onAdd={() => addItem("labor")}
                onRemove={(id) => removeItem("labor", id)}
                onUpdate={(id, field, value) =>
                  updateItem("labor", id, field, value)
                }
              />

              {/* TOTAL */}

              <section>
                <div className="rounded-2xl bg-[#4b2f20] p-5 md:p-6 text-white shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-[#ead8bd] text-sm">Materials</p>

                      <p className="text-lg font-bold mt-1">
                        {money(materialsSubtotal)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#ead8bd] text-sm">Varnish Finisher</p>

                      <p className="text-lg font-bold mt-1">
                        {money(varnishSubtotal)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#ead8bd] text-sm">Upholstery</p>

                      <p className="text-lg font-bold mt-1">
                        {money(upholsterySubtotal)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#ead8bd] text-sm">Labor</p>

                      <p className="text-lg font-bold mt-1">
                        {money(laborSubtotal)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/20 mt-5 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-[#ead8bd] text-sm">
                        Total Quotation Cost
                      </p>

                      <p className="text-3xl md:text-4xl font-bold mt-1">
                        {money(totalCost)}
                      </p>
                    </div>

                    <FaFileInvoiceDollar className="text-5xl text-[#c9a77f]" />
                  </div>
                </div>
              </section>

              {/* FOOTER BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-[#dfc7ab] pt-5 pb-8">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-5 py-3 rounded-xl border border-[#c9a77f] text-[#4b2f20] hover:bg-[#fff4df] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4b2f20] text-white hover:bg-[#6e4932] disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}

                  {saving ? "Saving..." : "Save Quotation"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===========================================================
   QUOTATION SECTION
=========================================================== */

function QuotationSection({
  title,
  subtitle,
  items,
  section,
  subtotal,
  onAdd,
  onRemove,
  onUpdate,
}: {
  title: string;
  subtitle: string;
  items: QuotationItem[];
  section: QuotationItem["section"];
  subtotal: number;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (
    id: string,
    field: keyof QuotationItem,
    value: string | number,
  ) => void;
}) {
  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
        <SectionTitle title={title} subtitle={subtitle} />

        <button
          type="button"
          onClick={onAdd}
          className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#4b2f20] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6e4932]"
        >
          <FaPlus />
          Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#c9a77f] bg-[#fff4df] p-8 text-center">
          <p className="text-sm font-semibold text-[#6e4932]">No items added</p>

          <p className="text-xs text-[#9a7b61] mt-1">
            Click &quot;Add Item&quot; to add a quotation item.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <QuotationItemEditor
              key={item.id}
              item={item}
              index={index}
              section={section}
              onRemove={() => onRemove(item.id)}
              onUpdate={(field, value) => onUpdate(item.id, field, value)}
            />
          ))}

          <div className="flex justify-end rounded-xl bg-[#f6ead8] px-5 py-3">
            <p className="font-bold text-[#4b2f20]">
              SUBTOTAL: {money(subtotal)}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

/* ===========================================================
   ITEM EDITOR
=========================================================== */

function QuotationItemEditor({
  item,
  index,
  section,
  onRemove,
  onUpdate,
}: {
  item: QuotationItem;
  index: number;
  section: QuotationItem["section"];
  onRemove: () => void;
  onUpdate: (field: keyof QuotationItem, value: string | number) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#dfc7ab] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#a4773f]">
            Item {index + 1}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            {section === "materials"
              ? "Material"
              : section === "varnish"
                ? "Finishing Material"
                : section === "upholstery"
                  ? "Upholstery"
                  : "Labor"}
          </p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700"
          title="Remove item"
        >
          <FaTrash />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-4">
        <div className="md:col-span-5">
          <Field label="Description">
            <input
              value={item.description}
              onChange={(event) => onUpdate("description", event.target.value)}
              className={smallInputClass}
              placeholder="Item description"
              required
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Qty">
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.qty}
              onChange={(event) =>
                onUpdate("qty", numberValue(event.target.value))
              }
              className={smallInputClass}
              required
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Unit">
            <input
              value={item.unit}
              onChange={(event) => onUpdate("unit", event.target.value)}
              className={smallInputClass}
              placeholder="pcs"
              required
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Rate">
            <input
              type="text"
              inputMode="decimal"
              value={item.rate === 0 ? "" : formatInputMoney(item.rate)}
              onChange={(event) => {
                const cleaned = event.target.value
                  .replace(/,/g, "")
                  .replace(/[^\d.]/g, "");

                onUpdate("rate", cleaned === "" ? 0 : numberValue(cleaned));
              }}
              className={smallInputClass}
              placeholder="0.00"
              required
            />
          </Field>
        </div>

        <div className="md:col-span-1">
          <Field label="Amount">
            <div className="rounded-xl bg-[#f6ead8] px-3 py-2.5 text-sm font-bold text-[#4b2f20] min-h-[44px] flex items-center justify-end">
              {money(item.amount)}
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
   VIEW MODAL
=========================================================== */

function QuotationViewModal({
  quotation,
  onClose,
  onApprove,
  onPrint,
}: {
  quotation: Quotation;
  onClose: () => void;
  onApprove: () => void;
  onPrint: () => void;
}) {
  const [expanded, setExpanded] = useState({
    materials: true,
    varnish: true,
    upholstery: true,
    labor: true,
  });

  const sections = [
    {
      key: "materials" as const,
      title: "A. MATERIALS",
      items: quotation.items.filter((item) => item.section === "materials"),
      subtotal: quotation.materials_subtotal,
    },
    {
      key: "varnish" as const,
      title: "B. VARNISH FINISHER",
      items: quotation.items.filter((item) => item.section === "varnish"),
      subtotal: quotation.varnish_subtotal,
    },
    {
      key: "upholstery" as const,
      title: "C. UPHOLSTERY",
      items: quotation.items.filter((item) => item.section === "upholstery"),
      subtotal: quotation.upholstery_subtotal,
    },
    {
      key: "labor" as const,
      title: "D. LABOR",
      items: quotation.items.filter((item) => item.section === "labor"),
      subtotal: quotation.labor_subtotal,
    },
  ];

  return (
    <div className="fixed inset-0 z-[150] bg-[#2b1b14]/65 p-3 md:p-6">
      <div className="h-full w-full overflow-hidden rounded-2xl bg-[#fffaf2] shadow-2xl flex flex-col">
        {/* Header */}

        <div className="shrink-0 border-b border-[#dfc7ab] px-4 md:px-7 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-[#806650] hover:bg-[#f6ead8]"
            >
              <FaArrowLeft />
            </button>

            <div>
              <h2 className="text-2xl font-bold text-[#4b2f20]">
                Quotation Summary
              </h2>

              <p className="text-sm text-gray-500">{quotation.quotation_no}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {quotation.status === "pending" && (
              <button
                type="button"
                onClick={onApprove}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
              >
                <FaCheck />
                Approve Quotation
              </button>
            )}

            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4b2f20] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#6e4932]"
            >
              <FaPrint />
              Print PDF
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl border border-[#c9a77f] bg-white px-4 py-2.5 text-sm font-bold text-[#4b2f20] hover:bg-[#fff4df]"
            >
              <FaTimes />
              Close
            </button>
          </div>
        </div>

        {/* Body */}

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl p-4 md:p-7 space-y-6">
            {/* TOP INFO */}

            <div className="rounded-2xl border border-[#dfc7ab] bg-white p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#a4773f]">
                    {SHOP_NAME}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">{SHOP_LOCATION}</p>

                  <h3 className="text-2xl font-bold text-[#4b2f20] mt-4">
                    QUOTATION FOR {quotation.project_name.toUpperCase()}
                  </h3>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500">Quotation No.</p>

                  <p className="text-lg font-bold text-[#211c1d]">
                    {quotation.quotation_no}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">Date</p>

                  <p className="font-semibold">
                    {formatDate(quotation.quotation_date)}
                  </p>

                  <div className="mt-3">
                    <StatusBadge status={quotation.status} />
                  </div>
                </div>
              </div>
            </div>

            {/* CUSTOMER INFO */}

            <div className="rounded-2xl border border-[#dfc7ab] bg-white p-5">
              <h3 className="font-bold text-[#4b2f20] text-lg">
                Customer / Organization Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                <InfoBox
                  label="Customer / Organization"
                  value={quotation.customer_name}
                />

                <InfoBox label="Project" value={quotation.project_name} />

                <InfoBox
                  label="Address"
                  value={quotation.customer_address}
                  className="md:col-span-2"
                />

                <InfoBox
                  label="Project Location"
                  value={quotation.project_location}
                  className="md:col-span-2"
                />
              </div>
            </div>

            {/* ITEMS */}

            {sections.map((section) => (
              <div
                key={section.key}
                className="rounded-2xl border border-[#dfc7ab] bg-white overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((previous) => ({
                      ...previous,
                      [section.key]: !previous[section.key],
                    }))
                  }
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[#fffaf2]"
                >
                  <div>
                    <h3 className="font-bold text-[#4b2f20]">
                      {section.title}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      {section.items.length} item
                      {section.items.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  {expanded[section.key] ? (
                    <FaChevronUp className="text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </button>

                {expanded[section.key] && (
                  <div className="border-t border-[#ead8c1] overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm">
                      <thead className="bg-[#f6ead8]">
                        <tr>
                          <th className="px-5 py-3 text-left text-xs uppercase">
                            Description
                          </th>

                          <th className="px-5 py-3 text-center text-xs uppercase">
                            Qty
                          </th>

                          <th className="px-5 py-3 text-center text-xs uppercase">
                            Unit
                          </th>

                          <th className="px-5 py-3 text-right text-xs uppercase">
                            Rate
                          </th>

                          <th className="px-5 py-3 text-right text-xs uppercase">
                            Amount
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#ead8c1]">
                        {section.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-5 py-3 font-medium">
                              {item.description || "—"}
                            </td>

                            <td className="px-5 py-3 text-center">
                              {item.qty}
                            </td>

                            <td className="px-5 py-3 text-center">
                              {item.unit}
                            </td>

                            <td className="px-5 py-3 text-right">
                              {money(item.rate)}
                            </td>

                            <td className="px-5 py-3 text-right font-bold">
                              {money(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>

                      <tfoot>
                        <tr className="bg-[#fffaf2]">
                          <td
                            colSpan={4}
                            className="px-5 py-3 text-right font-bold"
                          >
                            SUBTOTAL
                          </td>

                          <td className="px-5 py-3 text-right font-bold text-[#4b2f20]">
                            {money(section.subtotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            ))}

            {/* TOTAL */}

            <div className="rounded-2xl bg-[#4b2f20] p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-[#ead8bd] text-sm">TOTAL COST</p>

                  <p className="text-3xl md:text-4xl font-bold mt-1">
                    {money(quotation.total_cost)}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-[#ead8bd] text-sm">Status</p>

                  <div className="mt-2">
                    <StatusBadge status={quotation.status} />
                  </div>
                </div>
              </div>
            </div>

            {/* SIGNATURE */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-5 pb-10">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Prepared By:
                </p>

                <div className="border-b border-gray-400 mt-12 w-full max-w-xs" />

                <p className="font-bold mt-2">Edwin L. Curammeng</p>

                <p className="text-sm text-gray-500">Owner / Furniture Maker</p>

                <p className="text-sm text-gray-500 mt-2">
                  Date: {formatDate(quotation.quotation_date)}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Approved / Accepted By:
                </p>

                <div className="border-b border-gray-400 mt-12 w-full max-w-xs" />

                <p className="font-bold mt-2">Customer / Organization</p>

                <p className="text-sm text-gray-500">Sign Date</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
   STATUS BADGE
=========================================================== */

function StatusBadge({ status }: { status: QuotationStatus }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
        <FaCheckCircle />
        Approved
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
      <FaClock />
      For Approval
    </span>
  );
}

/* ===========================================================
   INFO BOX
=========================================================== */

function InfoBox({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="text-sm font-semibold text-gray-800 mt-1 leading-6">
        {value || "—"}
      </p>
    </div>
  );
}

/* ===========================================================
   DELETE MODAL
=========================================================== */

function DeleteQuotationModal({
  quotation,
  onCancel,
  onConfirm,
}: {
  quotation: Quotation;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-[#2b1b14]/55 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-[#eee8e4] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <FaTrash />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#211c1d]">
                Confirm Delete
              </h2>

              <p className="text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 text-[15px] leading-6 text-gray-600">
          Are you sure you want to delete quotation{" "}
          <strong className="text-[#211c1d]">{quotation.quotation_no}</strong>?
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
            Delete Quotation
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
   EMPTY STATE
=========================================================== */

function EmptyQuotationState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-white border border-[#dfc7ab] rounded-2xl p-12 text-center">
      <FaFileInvoiceDollar className="mx-auto text-[#c9a77f] text-5xl mb-4" />

      <h3 className="text-lg font-semibold text-gray-700">
        No quotations found
      </h3>

      <p className="text-gray-500 mt-1 max-w-md mx-auto">
        Create your first quotation and it will appear here.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4b2f20] px-5 py-3 font-semibold text-white hover:bg-[#6e4932]"
      >
        <FaPlus />
        Create Quotation
      </button>
    </div>
  );
}

/* ===========================================================
   COMMON COMPONENTS
=========================================================== */

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
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

/* ===========================================================
   CLASSES
=========================================================== */

const inputClass =
  "w-full border border-[#dfc7ab] rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-[#b88746] focus:border-[#b88746]";

const smallInputClass =
  "w-full border border-[#dfc7ab] rounded-xl px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-[#b88746] focus:border-[#b88746]";
