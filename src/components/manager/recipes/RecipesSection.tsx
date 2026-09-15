"use client";

import React, { useState } from "react";
import { GELATO_FLAVORS, GELATO_SERIES } from "@/lib/constants/gelatoData";
import {
  GELATO_MASTER_FORMULATIONS,
  MasterRecipeFormulation,
  DetailedBOMIngredient,
  getFullMasterFormulation,
} from "@/lib/constants/gelatoFormulations";
import { GelatoFlavor } from "@/types/kitchen";
import DataTable, { Column } from "@/components/common/ui/DataTable";
import { useNotificationStore } from "@/store/useNotificationStore";
import {
  X,
  Pencil,
  Eye,
  Check,
  Plus,
  Trash2,
  Layers,
  DollarSign,
  Sparkles,
  Scale,
  FlaskConical,
  Info,
  Thermometer,
  RotateCcw,
  Tag,
} from "lucide-react";

const ALLERGEN_OPTIONS = ["Milk", "Gluten", "Nuts", "Peanuts", "Eggs", "Soy", "Sesame"];

const INGREDIENT_CATEGORIES: DetailedBOMIngredient["category"][] = [
  "Dairy Base",
  "Dairy Fat",
  "Milk Powder",
  "Sugars",
  "Flavor Compound",
  "Stabilizers",
  "Inclusions",
  "Water / Fruit",
];

export function getCategoryBadgeClass(category: DetailedBOMIngredient["category"]): string {
  switch (category) {
    case "Dairy Base":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Dairy Fat":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "Milk Powder":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "Sugars":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Flavor Compound":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Stabilizers":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Inclusions":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Water / Fruit":
      return "bg-teal-50 text-teal-700 border-teal-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

// Fallback formulation builder for unknown or custom flavors
function buildDefaultFormulation(flavor: GelatoFlavor): MasterRecipeFormulation {
  const isSorbet = flavor.baseType !== "milk" || flavor.series.toLowerCase().includes("dairy-free");
  const batchGrams = flavor.maxCapacityGram || (isSorbet ? 2500 : 3000);

  if (isSorbet) {
    return {
      id: `form-${flavor.id}`,
      flavorId: flavor.id,
      name: flavor.name,
      series: flavor.series,
      masterBase: "MB-06 Sorbet Base",
      batchTargetGrams: batchGrams,
      fatPercent: 0.1,
      msnfPercent: 0.0,
      solidsPercent: 31.0,
      pod: 20.5,
      pac: 30.0,
      servingTemp: "-13°C to -14°C",
      targetOverrun: 20,
      allergens: flavor.allergens || [],
      cogsEstimatedPerTub: 65000,
      cogsEstimatedPerScoop: 1820,
      instructions: "100% dairy-free artisanal sorbetto mix. Disperse stabilizers and anti-freezing sugars into fruit pulp before churning.",
      ingredients: [
        { id: "ing-1", name: "Mineral Spring Water", category: "Water / Fruit", grams1kg: 440, gramsBatch: (batchGrams * 0.44), costPerKg: 2500 },
        { id: "ing-2", name: `${flavor.name.replace(/sorbet/i, "").trim()} Puree (100% Pulp)`, category: "Flavor Compound", grams1kg: 380, gramsBatch: (batchGrams * 0.38), costPerKg: 95000 },
        { id: "ing-3", name: "Granulated Sucrose", category: "Sugars", grams1kg: 120, gramsBatch: (batchGrams * 0.12), costPerKg: 16500 },
        { id: "ing-4", name: "Dextrose Monohydrate", category: "Sugars", grams1kg: 40, gramsBatch: (batchGrams * 0.04), costPerKg: 25000 },
        { id: "ing-5", name: "Glucose Powder DE 40", category: "Sugars", grams1kg: 15, gramsBatch: (batchGrams * 0.015), costPerKg: 35000 },
        { id: "ing-6", name: "Sorbet Pectin / Gum Stabilizer", category: "Stabilizers", grams1kg: 5, gramsBatch: (batchGrams * 0.005), costPerKg: 240000 },
      ],
    };
  }

  return {
    id: `form-${flavor.id}`,
    flavorId: flavor.id,
    name: flavor.name,
    series: flavor.series,
    masterBase: "MB-01 Fior di Latte Base",
    batchTargetGrams: batchGrams,
    fatPercent: 7.5,
    msnfPercent: 10.2,
    solidsPercent: 38.5,
    pod: 18.5,
    pac: 27.5,
    servingTemp: "-13°C to -14°C",
    targetOverrun: 30,
    allergens: flavor.allergens || ["Milk"],
    cogsEstimatedPerTub: 72000,
    cogsEstimatedPerScoop: 1680,
    instructions: "Pasteurized whole milk and dairy cream base matured 6-12 hours at 4°C before dynamic batch churning.",
    ingredients: [
      { id: "ing-1", name: "Whole Milk (Diamond 3.5%)", category: "Dairy Base", grams1kg: 600, gramsBatch: (batchGrams * 0.60), costPerKg: 18000 },
      { id: "ing-2", name: "Dairy Cream (35% Fat)", category: "Dairy Fat", grams1kg: 100, gramsBatch: (batchGrams * 0.10), costPerKg: 68000 },
      { id: "ing-3", name: "Skim Milk Powder (SMP)", category: "Milk Powder", grams1kg: 45, gramsBatch: (batchGrams * 0.045), costPerKg: 65000 },
      { id: "ing-4", name: `Flavor Compound / Paste (${flavor.name})`, category: "Flavor Compound", grams1kg: 70, gramsBatch: (batchGrams * 0.07), costPerKg: 160000 },
      { id: "ing-5", name: "Granulated Sucrose", category: "Sugars", grams1kg: 125, gramsBatch: (batchGrams * 0.125), costPerKg: 16500 },
      { id: "ing-6", name: "Dextrose Monohydrate", category: "Sugars", grams1kg: 30, gramsBatch: (batchGrams * 0.03), costPerKg: 25000 },
      { id: "ing-7", name: "Glucose Powder DE 40", category: "Sugars", grams1kg: 25, gramsBatch: (batchGrams * 0.025), costPerKg: 35000 },
      { id: "ing-8", name: "Base 5 Stabilizer", category: "Stabilizers", grams1kg: 5, gramsBatch: (batchGrams * 0.005), costPerKg: 180000 },
    ],
  };
}

export interface BOMPresetTemplate {
  key: string;
  title: string;
  series: string;
  baseType: "milk" | "dairy-free";
  masterBase: string;
  targetOverrun: number;
  fatPercent: number;
  msnfPercent: number;
  solidsPercent: number;
  pod: number;
  pac: number;
  servingTemp: string;
  allergens: string[];
  instructions: string;
  ingredients: DetailedBOMIngredient[];
}

const BOM_PRESET_TEMPLATES: BOMPresetTemplate[] = [
  {
    key: "milk",
    title: "Milk Base Gelato (3000g)",
    series: "Milk",
    baseType: "milk",
    masterBase: "MB-01 Fior di Latte Base",
    targetOverrun: 32,
    fatPercent: 8.0,
    msnfPercent: 10.5,
    solidsPercent: 38.5,
    pod: 180,
    pac: 260,
    servingTemp: "-12°C to -13°C",
    allergens: ["Milk"],
    instructions: "Pasteurize milk base ingredients to 85°C, mature for 6-12 hours at 4°C, churn in batch freezer, then blast freeze at -38°C for 20 minutes.",
    ingredients: [
      { id: "ing-1", name: "Whole Milk (Diamond 3.5%)", category: "Dairy Base", grams1kg: 610, gramsBatch: 1830, costPerKg: 18000 },
      { id: "ing-2", name: "Dairy Cream (35% Fat)", category: "Dairy Fat", grams1kg: 110, gramsBatch: 330, costPerKg: 68000 },
      { id: "ing-3", name: "Skim Milk Powder (SMP)", category: "Milk Powder", grams1kg: 45, gramsBatch: 135, costPerKg: 65000 },
      { id: "ing-4", name: "Granulated Sucrose", category: "Sugars", grams1kg: 130, gramsBatch: 390, costPerKg: 16500 },
      { id: "ing-5", name: "Dextrose Monohydrate", category: "Sugars", grams1kg: 35, gramsBatch: 105, costPerKg: 25000 },
      { id: "ing-6", name: "Glucose Powder DE 40", category: "Sugars", grams1kg: 20, gramsBatch: 60, costPerKg: 35000 },
      { id: "ing-7", name: "Flavor Paste / Compound", category: "Flavor Compound", grams1kg: 45, gramsBatch: 135, costPerKg: 140000 },
      { id: "ing-8", name: "Base 5 Stabilizer", category: "Stabilizers", grams1kg: 5, gramsBatch: 15, costPerKg: 180000 },
    ],
  },
  {
    key: "sorbet",
    title: "Fruit Sorbetto (2500g)",
    series: "Dairy-Free / Sorbetto",
    baseType: "dairy-free",
    masterBase: "MB-06 Sorbet Base",
    targetOverrun: 22,
    fatPercent: 0.1,
    msnfPercent: 0.0,
    solidsPercent: 31.0,
    pod: 205,
    pac: 290,
    servingTemp: "-13°C to -14°C",
    allergens: [],
    instructions: "Cold process fruit sorbet. Blend fruit puree with water, sugar syrup, dextrose, and sorbet stabilizer with high-shear immersion mixer before batch freezing.",
    ingredients: [
      { id: "ing-1", name: "Mineral Spring Water", category: "Water / Fruit", grams1kg: 420, gramsBatch: 1050, costPerKg: 2500 },
      { id: "ing-2", name: "Real Fruit Puree (100% Pulp)", category: "Flavor Compound", grams1kg: 400, gramsBatch: 1000, costPerKg: 95000 },
      { id: "ing-3", name: "Granulated Sucrose", category: "Sugars", grams1kg: 120, gramsBatch: 300, costPerKg: 16500 },
      { id: "ing-4", name: "Dextrose Monohydrate", category: "Sugars", grams1kg: 40, gramsBatch: 100, costPerKg: 25000 },
      { id: "ing-5", name: "Glucose Powder DE 40", category: "Sugars", grams1kg: 15, gramsBatch: 37.5, costPerKg: 35000 },
      { id: "ing-6", name: "Sorbet Pectin / Gum Stabilizer", category: "Stabilizers", grams1kg: 5, gramsBatch: 12.5, costPerKg: 240000 },
    ],
  },
  {
    key: "chocolate",
    title: "Dark Chocolate Gelato (3000g)",
    series: "Chocolate",
    baseType: "milk",
    masterBase: "MB-02 Dark Chocolate Base",
    targetOverrun: 30,
    fatPercent: 9.2,
    msnfPercent: 9.8,
    solidsPercent: 42.0,
    pod: 185,
    pac: 275,
    servingTemp: "-12°C to -13°C",
    allergens: ["Milk", "Soy"],
    instructions: "Melt dark chocolate paste into hot pasteurized milk base (70°C). Emulsify thoroughly with immersion blender before aging at 4°C for 6 hours.",
    ingredients: [
      { id: "ing-1", name: "Whole Milk (Diamond 3.5%)", category: "Dairy Base", grams1kg: 570, gramsBatch: 1710, costPerKg: 18000 },
      { id: "ing-2", name: "Dairy Cream (35% Fat)", category: "Dairy Fat", grams1kg: 90, gramsBatch: 270, costPerKg: 68000 },
      { id: "ing-3", name: "Skim Milk Powder (SMP)", category: "Milk Powder", grams1kg: 40, gramsBatch: 120, costPerKg: 65000 },
      { id: "ing-4", name: "Dark Chocolate Paste 70%", category: "Flavor Compound", grams1kg: 85, gramsBatch: 255, costPerKg: 195000 },
      { id: "ing-5", name: "Dutch Cocoa Powder 22-24%", category: "Flavor Compound", grams1kg: 30, gramsBatch: 90, costPerKg: 110000 },
      { id: "ing-6", name: "Granulated Sucrose", category: "Sugars", grams1kg: 125, gramsBatch: 375, costPerKg: 16500 },
      { id: "ing-7", name: "Dextrose Monohydrate", category: "Sugars", grams1kg: 35, gramsBatch: 105, costPerKg: 25000 },
      { id: "ing-8", name: "Glucose Powder DE 40", category: "Sugars", grams1kg: 20, gramsBatch: 60, costPerKg: 35000 },
      { id: "ing-9", name: "Base 5 Stabilizer", category: "Stabilizers", grams1kg: 5, gramsBatch: 15, costPerKg: 180000 },
    ],
  },
  {
    key: "nut",
    title: "Nut Paste Gelato (3000g)",
    series: "Peanut & Nuts",
    baseType: "milk",
    masterBase: "MB-03 Pure Nut Base",
    targetOverrun: 30,
    fatPercent: 11.2,
    msnfPercent: 9.5,
    solidsPercent: 43.5,
    pod: 175,
    pac: 270,
    servingTemp: "-12°C to -13°C",
    allergens: ["Milk", "Nuts"],
    instructions: "Incorporate pure 100% nut paste into cold-aged base (4°C) with high shear immersion blender. Avoid over-heating to prevent nut oil separation.",
    ingredients: [
      { id: "ing-1", name: "Whole Milk (Diamond 3.5%)", category: "Dairy Base", grams1kg: 580, gramsBatch: 1740, costPerKg: 18000 },
      { id: "ing-2", name: "Dairy Cream (35% Fat)", category: "Dairy Fat", grams1kg: 60, gramsBatch: 180, costPerKg: 68000 },
      { id: "ing-3", name: "Skim Milk Powder (SMP)", category: "Milk Powder", grams1kg: 40, gramsBatch: 120, costPerKg: 65000 },
      { id: "ing-4", name: "Pure Nut Paste 100%", category: "Flavor Compound", grams1kg: 100, gramsBatch: 300, costPerKg: 380000 },
      { id: "ing-5", name: "Granulated Sucrose", category: "Sugars", grams1kg: 130, gramsBatch: 390, costPerKg: 16500 },
      { id: "ing-6", name: "Dextrose Monohydrate", category: "Sugars", grams1kg: 35, gramsBatch: 105, costPerKg: 25000 },
      { id: "ing-7", name: "Glucose Powder DE 40", category: "Sugars", grams1kg: 20, gramsBatch: 60, costPerKg: 35000 },
      { id: "ing-8", name: "Sea Salt (Fine)", category: "Flavor Compound", grams1kg: 1.5, gramsBatch: 4.5, costPerKg: 15000 },
      { id: "ing-9", name: "Base 5 Stabilizer", category: "Stabilizers", grams1kg: 5, gramsBatch: 15, costPerKg: 180000 },
    ],
  },
];

export default function RecipesSection() {
  const { showToast } = useNotificationStore();
  const [recipesList, setRecipesList] = useState<GelatoFlavor[]>(GELATO_FLAVORS);
  const [formulationsMap, setFormulationsMap] = useState<Record<string, MasterRecipeFormulation>>(GELATO_MASTER_FORMULATIONS);
  const [activeSeries, setActiveSeries] = useState<string>("All");

  // View Detail State
  const [selectedRecipe, setSelectedRecipe] = useState<GelatoFlavor | null>(null);
  const [selectedFormulation, setSelectedFormulation] = useState<MasterRecipeFormulation | null>(null);
  const [detailScaleMode, setDetailScaleMode] = useState<"batch" | "master">("batch");
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Edit / Create Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("edit");
  const [editingRecipe, setEditingRecipe] = useState<GelatoFlavor | null>(null);
  const [editingFormulation, setEditingFormulation] = useState<MasterRecipeFormulation | null>(null);
  const [activeTemplateKey, setActiveTemplateKey] = useState<string>("milk");

  const filteredFlavors = recipesList.filter(
    (f) => activeSeries === "All" || f.series === activeSeries
  );

  const getFormulation = (recipe: GelatoFlavor): MasterRecipeFormulation => {
    return formulationsMap[recipe.id] || getFullMasterFormulation(recipe.id) || buildDefaultFormulation(recipe);
  };

  const handleOpenDetail = (recipe: GelatoFlavor) => {
    const form = getFormulation(recipe);
    setSelectedRecipe(recipe);
    setSelectedFormulation(form);
    setDetailScaleMode("batch");
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (recipe: GelatoFlavor) => {
    const currentForm = getFormulation(recipe);
    setModalMode("edit");
    setEditingRecipe({ ...recipe });
    setEditingFormulation({
      ...currentForm,
      allergens: [...(recipe.allergens || currentForm.allergens || [])],
      ingredients: currentForm.ingredients.map((ing) => ({ ...ing })),
    });
    setIsEditOpen(true);
  };

  const handleOpenCreate = (presetKey: string = "milk") => {
    setModalMode("create");
    setActiveTemplateKey(presetKey);
    const template = BOM_PRESET_TEMPLATES.find((t) => t.key === presetKey) || BOM_PRESET_TEMPLATES[0];
    const generatedId = `FLV-NEW-${Date.now().toString().slice(-4)}`;

    const totalCost = template.ingredients.reduce(
      (sum, item) => sum + (item.gramsBatch / 1000) * item.costPerKg,
      0
    );
    const batchG = template.ingredients.reduce((sum, item) => sum + item.gramsBatch, 0);
    const cogsScoop = batchG > 0 ? Math.round((totalCost / batchG) * 70) : 0;

    const newFlavor: GelatoFlavor = {
      id: generatedId,
      name: `New ${template.series} Flavor`,
      series: template.series,
      description: `Artisanal recipe formulation for New ${template.series} Flavor`,
      allergens: [...template.allergens],
      baseType: template.baseType,
      maxCapacityGram: batchG,
    };

    const newFormulation: MasterRecipeFormulation = {
      id: `form-${generatedId}`,
      flavorId: generatedId,
      name: newFlavor.name,
      series: template.series,
      masterBase: template.masterBase,
      batchTargetGrams: batchG,
      fatPercent: template.fatPercent,
      msnfPercent: template.msnfPercent,
      solidsPercent: template.solidsPercent,
      pod: template.pod,
      pac: template.pac,
      servingTemp: template.servingTemp,
      targetOverrun: template.targetOverrun,
      allergens: [...template.allergens],
      cogsEstimatedPerTub: Math.round(totalCost),
      cogsEstimatedPerScoop: cogsScoop,
      instructions: template.instructions,
      ingredients: template.ingredients.map((ing, idx) => ({
        ...ing,
        id: `ing-new-${idx + 1}-${Date.now()}`,
      })),
    };

    setEditingRecipe(newFlavor);
    setEditingFormulation(newFormulation);
    setIsEditOpen(true);
  };

  const handleApplyTemplate = (presetKey: string) => {
    setActiveTemplateKey(presetKey);
    const template = BOM_PRESET_TEMPLATES.find((t) => t.key === presetKey);
    if (!template || !editingFormulation || !editingRecipe) return;

    const totalCost = template.ingredients.reduce(
      (sum, item) => sum + (item.gramsBatch / 1000) * item.costPerKg,
      0
    );
    const batchG = template.ingredients.reduce((sum, item) => sum + item.gramsBatch, 0);
    const cogsScoop = batchG > 0 ? Math.round((totalCost / batchG) * 70) : 0;

    setEditingRecipe({
      ...editingRecipe,
      series: template.series,
      baseType: template.baseType,
      maxCapacityGram: batchG,
      allergens: [...template.allergens],
    });

    setEditingFormulation({
      ...editingFormulation,
      series: template.series,
      masterBase: template.masterBase,
      batchTargetGrams: batchG,
      fatPercent: template.fatPercent,
      msnfPercent: template.msnfPercent,
      solidsPercent: template.solidsPercent,
      pod: template.pod,
      pac: template.pac,
      servingTemp: template.servingTemp,
      targetOverrun: template.targetOverrun,
      allergens: [...template.allergens],
      cogsEstimatedPerTub: Math.round(totalCost),
      cogsEstimatedPerScoop: cogsScoop,
      instructions: template.instructions,
      ingredients: template.ingredients.map((ing, idx) => ({
        ...ing,
        id: `ing-new-${idx + 1}-${Date.now()}`,
      })),
    });

    showToast("Template Applied", `Loaded ${template.title} parameters and BOM structure.`, "INFO");
  };

  // Dynamic live calculation during editing
  const recomputeFormulationMetrics = (ingredients: DetailedBOMIngredient[], targetOverrun: number) => {
    const totalBatchGrams = ingredients.reduce((sum, item) => sum + (Number(item.gramsBatch) || 0), 0);
    const totalCost = ingredients.reduce(
      (sum, item) => sum + ((Number(item.gramsBatch) || 0) / 1000) * (Number(item.costPerKg) || 0),
      0
    );
    const cogsPerScoop = totalBatchGrams > 0 ? Math.round((totalCost / totalBatchGrams) * 70) : 0;

    // Recalculate 1kg master proportions
    const updatedIngredients = ingredients.map((ing) => ({
      ...ing,
      grams1kg: totalBatchGrams > 0 ? Number(((ing.gramsBatch / totalBatchGrams) * 1000).toFixed(1)) : 0,
    }));

    return {
      totalBatchGrams,
      totalCost: Math.round(totalCost),
      cogsPerScoop,
      updatedIngredients,
    };
  };

  const handleUpdateIngredientBatchGrams = (index: number, grams: number) => {
    if (!editingFormulation) return;
    const nextGrams = Math.max(0, grams);
    const nextIngredients = [...editingFormulation.ingredients];
    nextIngredients[index] = { ...nextIngredients[index], gramsBatch: nextGrams };

    const { totalBatchGrams, totalCost, cogsPerScoop, updatedIngredients } = recomputeFormulationMetrics(
      nextIngredients,
      editingFormulation.targetOverrun
    );

    setEditingFormulation({
      ...editingFormulation,
      batchTargetGrams: totalBatchGrams,
      cogsEstimatedPerTub: totalCost,
      cogsEstimatedPerScoop: cogsPerScoop,
      ingredients: updatedIngredients,
    });
  };

  const handleUpdateIngredientCost = (index: number, costPerKg: number) => {
    if (!editingFormulation) return;
    const nextIngredients = [...editingFormulation.ingredients];
    nextIngredients[index] = { ...nextIngredients[index], costPerKg: Math.max(0, costPerKg) };

    const { totalCost, cogsPerScoop, updatedIngredients } = recomputeFormulationMetrics(
      nextIngredients,
      editingFormulation.targetOverrun
    );

    setEditingFormulation({
      ...editingFormulation,
      cogsEstimatedPerTub: totalCost,
      cogsEstimatedPerScoop: cogsPerScoop,
      ingredients: updatedIngredients,
    });
  };

  const handleUpdateIngredientName = (index: number, name: string) => {
    if (!editingFormulation) return;
    const nextIngredients = [...editingFormulation.ingredients];
    nextIngredients[index] = { ...nextIngredients[index], name };
    setEditingFormulation({ ...editingFormulation, ingredients: nextIngredients });
  };

  const handleUpdateIngredientCategory = (index: number, category: DetailedBOMIngredient["category"]) => {
    if (!editingFormulation) return;
    const nextIngredients = [...editingFormulation.ingredients];
    nextIngredients[index] = { ...nextIngredients[index], category };
    setEditingFormulation({ ...editingFormulation, ingredients: nextIngredients });
  };

  const handleAddIngredient = () => {
    if (!editingFormulation) return;
    const newIng: DetailedBOMIngredient = {
      id: `ing-custom-${Date.now()}`,
      name: "New Raw Ingredient",
      category: "Flavor Compound",
      gramsBatch: 100,
      grams1kg: 33.3,
      costPerKg: 65000,
    };
    const nextIngredients = [...editingFormulation.ingredients, newIng];
    const { totalBatchGrams, totalCost, cogsPerScoop, updatedIngredients } = recomputeFormulationMetrics(
      nextIngredients,
      editingFormulation.targetOverrun
    );

    setEditingFormulation({
      ...editingFormulation,
      batchTargetGrams: totalBatchGrams,
      cogsEstimatedPerTub: totalCost,
      cogsEstimatedPerScoop: cogsPerScoop,
      ingredients: updatedIngredients,
    });
  };

  const handleDeleteIngredient = (index: number) => {
    if (!editingFormulation || editingFormulation.ingredients.length <= 1) return;
    const nextIngredients = editingFormulation.ingredients.filter((_, i) => i !== index);
    const { totalBatchGrams, totalCost, cogsPerScoop, updatedIngredients } = recomputeFormulationMetrics(
      nextIngredients,
      editingFormulation.targetOverrun
    );

    setEditingFormulation({
      ...editingFormulation,
      batchTargetGrams: totalBatchGrams,
      cogsEstimatedPerTub: totalCost,
      cogsEstimatedPerScoop: cogsPerScoop,
      ingredients: updatedIngredients,
    });
  };

  const toggleAllergen = (allergen: string) => {
    if (!editingFormulation) return;
    const current = editingFormulation.allergens || [];
    const updated = current.includes(allergen)
      ? current.filter((a) => a !== allergen)
      : [...current, allergen];
    setEditingFormulation({ ...editingFormulation, allergens: updated });
    if (editingRecipe) {
      setEditingRecipe({ ...editingRecipe, allergens: updated });
    }
  };

  const handleAutoSuggestAllergens = () => {
    if (!editingFormulation) return;
    const detected: string[] = [];
    const namesAndCategories = editingFormulation.ingredients
      .map((i) => `${i.name} ${i.category}`.toLowerCase())
      .join(" ");

    if (
      namesAndCategories.includes("milk") ||
      namesAndCategories.includes("cream") ||
      namesAndCategories.includes("smp") ||
      namesAndCategories.includes("cheese") ||
      namesAndCategories.includes("dairy") ||
      namesAndCategories.includes("yogurt") ||
      namesAndCategories.includes("fior di latte") ||
      namesAndCategories.includes("mascarpone")
    ) {
      detected.push("Milk");
    }

    if (
      namesAndCategories.includes("cookie") ||
      namesAndCategories.includes("wafer") ||
      namesAndCategories.includes("biscuit") ||
      namesAndCategories.includes("brownie") ||
      namesAndCategories.includes("crumb") ||
      namesAndCategories.includes("churro") ||
      namesAndCategories.includes("pastry") ||
      namesAndCategories.includes("cake") ||
      namesAndCategories.includes("savoiardi") ||
      namesAndCategories.includes("speculoos") ||
      namesAndCategories.includes("gluten") ||
      namesAndCategories.includes("flour")
    ) {
      detected.push("Gluten");
    }

    if (
      namesAndCategories.includes("pistachio") ||
      namesAndCategories.includes("hazelnut") ||
      namesAndCategories.includes("almond") ||
      namesAndCategories.includes("pecan") ||
      namesAndCategories.includes("macadamia") ||
      namesAndCategories.includes("cashew") ||
      namesAndCategories.includes("nut")
    ) {
      detected.push("Nuts");
    }

    if (namesAndCategories.includes("peanut")) {
      detected.push("Peanuts");
    }

    if (namesAndCategories.includes("egg") || namesAndCategories.includes("savoiardi") || namesAndCategories.includes("brownie")) {
      detected.push("Eggs");
    }

    if (namesAndCategories.includes("soy") || namesAndCategories.includes("chocolate") || namesAndCategories.includes("nutella")) {
      detected.push("Soy");
    }

    if (namesAndCategories.includes("sesame") || namesAndCategories.includes("kurogoma")) {
      detected.push("Sesame");
    }

    const uniqueAllergens = Array.from(new Set(detected));
    setEditingFormulation({ ...editingFormulation, allergens: uniqueAllergens });
    if (editingRecipe) {
      setEditingRecipe({ ...editingRecipe, allergens: uniqueAllergens });
    }

    showToast("Allergens Auto-Detected", `Suggested allergens: ${uniqueAllergens.join(", ") || "None"}`, "INFO");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecipe || !editingFormulation) return;

    const totalGrams = editingFormulation.ingredients.reduce(
      (sum, item) => sum + (Number(item.gramsBatch) || 0),
      0
    );

    if (totalGrams <= 0) {
      showToast("Validation Error", "Total batch weight must be greater than 0 grams.", "WARNING");
      return;
    }

    if (!editingFormulation.name.trim()) {
      showToast("Validation Error", "Flavor name is required.", "WARNING");
      return;
    }

    if (modalMode === "create") {
      const newFlavorId = (editingFormulation.flavorId || "").trim() || `FLV-${Date.now().toString().slice(-4)}`;
      const isSorbet =
        editingFormulation.series.toLowerCase().includes("dairy-free") ||
        editingFormulation.series.toLowerCase().includes("sorbet");

      const newFlavor: GelatoFlavor = {
        id: newFlavorId,
        name: editingFormulation.name.trim(),
        series: editingFormulation.series,
        description: editingRecipe.description || `Artisanal recipe formulation for ${editingFormulation.name}`,
        allergens: editingFormulation.allergens || [],
        baseType: isSorbet ? "dairy-free" : "milk",
        maxCapacityGram: totalGrams,
      };

      const newFormulation: MasterRecipeFormulation = {
        ...editingFormulation,
        id: `form-${newFlavorId}`,
        flavorId: newFlavorId,
        name: newFlavor.name,
        batchTargetGrams: totalGrams,
      };

      setRecipesList((prev) => [newFlavor, ...prev]);
      setFormulationsMap((prev) => ({
        ...prev,
        [newFlavorId]: newFormulation,
      }));

      showToast(
        "New BOM Formulation Created",
        `Flavor [${newFlavor.name}] successfully added with ${newFormulation.ingredients.length} raw ingredients (${totalGrams}g batch).`,
        "SUCCESS"
      );
    } else {
      // Update existing recipes list
      setRecipesList((prev) =>
        prev.map((r) =>
          r.id === editingRecipe.id
            ? {
                ...r,
                name: editingFormulation.name,
                series: editingFormulation.series,
                allergens: editingFormulation.allergens,
                maxCapacityGram: totalGrams,
              }
            : r
        )
      );

      // Update formulations map
      setFormulationsMap((prev) => ({
        ...prev,
        [editingRecipe.id]: {
          ...editingFormulation,
          batchTargetGrams: totalGrams,
        },
      }));

      showToast(
        "BOM Formulation Saved",
        `Recipe [${editingFormulation.name}] updated with ${editingFormulation.ingredients.length} raw ingredients (${totalGrams}g batch).`,
        "SUCCESS"
      );
    }

    setIsEditOpen(false);
    setEditingRecipe(null);
    setEditingFormulation(null);
  };

  const columns: Column<GelatoFlavor>[] = [
    {
      header: "Flavor ID",
      accessorKey: "id",
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#2D3D6E] block">{row.id}</span>
      ),
    },
    {
      header: "Flavor Name & Master Base",
      accessorKey: "name",
      cell: (row) => {
        const form = getFormulation(row);
        return (
          <div>
            <span className="font-bold text-xs text-[#2D3D6E] block">{row.name}</span>
            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
              <FlaskConical className="w-3 h-3 text-slate-400 inline" />
              <span>{form.masterBase}</span>
            </span>
          </div>
        );
      },
    },
    {
      header: "Series",
      accessorKey: "series",
      cell: (row) => (
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-mono text-[11px] font-semibold text-slate-700">
          {row.series}
        </span>
      ),
    },
    {
      header: "Chemistry (Fat / Solids / POD / PAC)",
      cell: (row) => {
        const form = getFormulation(row);
        return (
          <div className="font-mono text-[11px] space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-amber-700 font-bold">Fat {form.fatPercent}%</span>
              <span className="text-slate-300">•</span>
              <span className="text-indigo-700 font-bold">TS {form.solidsPercent}%</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span>POD {form.pod}</span>
              <span>•</span>
              <span>PAC {form.pac}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Est. COGS (Batch / Scoop)",
      cell: (row) => {
        const form = getFormulation(row);
        return (
          <div className="font-mono text-xs">
            <span className="font-bold text-slate-800 block">
              Rp {form.cogsEstimatedPerTub.toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              Rp {form.cogsEstimatedPerScoop.toLocaleString("id-ID")} / scoop
            </span>
          </div>
        );
      },
    },
    {
      header: "Allergens",
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {row.allergens && row.allergens.length > 0 ? (
            row.allergens.map((all, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full bg-[#F0E79D]/70 text-[#2D3D6E] text-[10px] font-bold shadow-2xs"
              >
                {all}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">100% Dairy-Free / None</span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenDetail(row)}
            className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-[#2D3D6E] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="View Bill of Materials"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View BOM</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-full bg-[#2D3D6E]/10 hover:bg-[#2D3D6E] hover:text-white text-[#2D3D6E] transition-all cursor-pointer"
            title="Edit Formulation & BOM"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">
            Recipes & BOM
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl">
            Master database of gelato flavor recipes, ingredient formulations, and allergen declarations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Add New BOM Button */}
          <button
            type="button"
            onClick={() => handleOpenCreate("milk")}
            className="px-5 py-2.5 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold shadow-lg shadow-[#2D3D6E]/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add New Flavor BOM</span>
          </button>

          {/* Series Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F6F8FC] p-1.5 rounded-full border border-slate-100 overflow-x-auto max-w-md">
            {GELATO_SERIES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActiveSeries(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeSeries === s
                    ? "bg-[#2D3D6E] text-white shadow-md shadow-[#2D3D6E]/20"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Table */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
        <DataTable
          data={filteredFlavors}
          columns={columns}
          searchPlaceholder="Search variant name, master base, or series..."
          searchKey="name"
          pageSize={9}
        />
      </div>

      {/* ========================================================================= */}
      {/* 1. RECIPE DETAIL & BILL OF MATERIALS (BOM) MODAL                          */}
      {/* ========================================================================= */}
      {isDetailOpen && selectedRecipe && selectedFormulation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="w-full max-w-4xl bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
                    {selectedFormulation.flavorId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F6F8FC] border border-slate-200 font-mono text-[10px] font-bold text-[#2D3D6E]">
                    {selectedFormulation.masterBase}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold">
                    {selectedFormulation.series} Series
                  </span>
                </div>
                <h3 className="font-extrabold text-xl text-[#2D3D6E] mt-1">{selectedFormulation.name}</h3>
              </div>

              {/* View Scale Toggle (1kg Master vs Batch) */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#F6F8FC] p-1 rounded-full border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDetailScaleMode("batch")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      detailScaleMode === "batch"
                        ? "bg-[#2D3D6E] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Batch ({selectedFormulation.batchTargetGrams}g)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailScaleMode("master")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      detailScaleMode === "master"
                        ? "bg-[#2D3D6E] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Master (1.000g)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsDetailOpen(false);
                    setSelectedRecipe(null);
                    setSelectedFormulation(null);
                  }}
                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Flavor Description */}
            <p className="text-xs text-slate-600 leading-relaxed bg-[#F6F8FC] p-4 rounded-2xl border border-slate-100 font-medium">
              {selectedRecipe.description}
            </p>

            {/* Food Science & Formulation Balancing Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-mono block">Batch Weight</span>
                <span className="font-mono font-bold text-xs text-[#2D3D6E]">
                  {detailScaleMode === "batch"
                    ? `${selectedFormulation.batchTargetGrams.toLocaleString("id-ID")}g`
                    : "1.000g"}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 text-center">
                <span className="text-[10px] text-amber-700 font-mono block">Fat %</span>
                <span className="font-mono font-bold text-xs text-amber-800">
                  {selectedFormulation.fatPercent}%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center">
                <span className="text-[10px] text-indigo-700 font-mono block">MSNF %</span>
                <span className="font-mono font-bold text-xs text-indigo-800">
                  {selectedFormulation.msnfPercent}%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
                <span className="text-[10px] text-blue-700 font-mono block">Total Solids %</span>
                <span className="font-mono font-bold text-xs text-blue-800">
                  {selectedFormulation.solidsPercent}%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 text-center">
                <span className="text-[10px] text-purple-700 font-mono block">POD (Sweetness)</span>
                <span className="font-mono font-bold text-xs text-purple-800">
                  {selectedFormulation.pod}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-cyan-50/60 border border-cyan-100 text-center">
                <span className="text-[10px] text-cyan-700 font-mono block">PAC (Freezing)</span>
                <span className="font-mono font-bold text-xs text-cyan-800">
                  {selectedFormulation.pac}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
                <span className="text-[10px] text-emerald-700 font-mono block">Target Overrun</span>
                <span className="font-mono font-bold text-xs text-emerald-800">
                  {selectedFormulation.targetOverrun}%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-mono block">Serving Temp</span>
                <span className="font-mono font-bold text-[11px] text-slate-700">
                  {selectedFormulation.servingTemp}
                </span>
              </div>
            </div>

            {/* Bill of Materials (BOM) Detailed Ingredient Breakdown */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-[#2D3D6E] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#2D3D6E]" />
                  <span>Bill of Materials (BOM) Multi-Ingredient Breakdown</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-500">
                  {selectedFormulation.ingredients.length} precise raw ingredients • Scaled to{" "}
                  {detailScaleMode === "batch"
                    ? `${selectedFormulation.batchTargetGrams}g production tub`
                    : "1.000g master base"}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Ingredient Name</th>
                      <th className="py-2.5 px-2">Category</th>
                      <th className="py-2.5 px-2 text-right">
                        {detailScaleMode === "batch" ? "Batch Grams" : "Master (1kg)"}
                      </th>
                      <th className="py-2.5 px-2 text-right">Ratio %</th>
                      <th className="py-2.5 px-2 text-right">Cost / kg</th>
                      <th className="py-2.5 px-3 text-right">Subtotal Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedFormulation.ingredients.map((ing) => {
                      const activeGrams =
                        detailScaleMode === "batch"
                          ? ing.gramsBatch
                          : ing.grams1kg || (ing.gramsBatch / selectedFormulation.batchTargetGrams) * 1000;

                      const baseTotalWeight =
                        detailScaleMode === "batch"
                          ? selectedFormulation.batchTargetGrams
                          : 1000;

                      const ratio = ((activeGrams / baseTotalWeight) * 100).toFixed(1);
                      const subtotal = (activeGrams / 1000) * ing.costPerKg;

                      return (
                        <tr key={ing.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-800 font-sans">
                            {ing.name}
                          </td>
                          <td className="py-2.5 px-2">
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${getCategoryBadgeClass(
                                ing.category
                              )}`}
                            >
                              {ing.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right font-bold text-[#2D3D6E]">
                            {activeGrams.toLocaleString("id-ID")}g
                          </td>
                          <td className="py-2.5 px-2 text-right font-medium text-slate-600">
                            {ratio}%
                          </td>
                          <td className="py-2.5 px-2 text-right text-slate-500">
                            Rp {ing.costPerKg.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                            Rp {Math.round(subtotal).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-[#F6F8FC] font-bold border-t border-slate-200 text-xs text-[#2D3D6E]">
                    {(() => {
                      const activeTotalWeight =
                        detailScaleMode === "batch"
                          ? selectedFormulation.batchTargetGrams
                          : 1000;

                      const totalCost = selectedFormulation.ingredients.reduce((sum, ing) => {
                        const activeGrams =
                          detailScaleMode === "batch"
                            ? ing.gramsBatch
                            : (ing.gramsBatch / selectedFormulation.batchTargetGrams) * 1000;
                        return sum + (activeGrams / 1000) * ing.costPerKg;
                      }, 0);

                      return (
                        <tr>
                          <td colSpan={2} className="py-2.5 px-3">
                            Total {detailScaleMode === "batch" ? "Batch Tub Formulation" : "1kg Master Formula"}
                          </td>
                          <td className="py-2.5 px-2 text-right font-extrabold text-[#2D3D6E]">
                            {activeTotalWeight.toLocaleString("id-ID")}g
                          </td>
                          <td className="py-2.5 px-2 text-right">100.0%</td>
                          <td className="py-2.5 px-2 text-right text-slate-400 font-normal">--</td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700">
                            Rp {Math.round(totalCost).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      );
                    })()}
                  </tfoot>
                </table>
              </div>
            </div>

            {/* SOP Preparation & Instructions */}
            <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-100/70 space-y-1">
              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-700" />
                <span>Standard Operating Procedure (SOP) & Inclusions Handling:</span>
              </span>
              <p className="text-xs text-amber-800 leading-relaxed font-sans">
                {selectedFormulation.instructions}
              </p>
            </div>

            {/* Allergens & Cost Breakdown Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-bold">Declared Allergens:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedFormulation.allergens && selectedFormulation.allergens.length > 0 ? (
                    selectedFormulation.allergens.map((all, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full bg-[#F0E79D] text-[#2D3D6E] text-[10px] font-bold"
                      >
                        {all}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 font-bold">None (100% Dairy-Free)</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <span className="text-emerald-900 font-bold">Unit COGS (70g scoop):</span>
                <span className="font-extrabold text-sm text-emerald-800">
                  Rp {selectedFormulation.cogsEstimatedPerScoop.toLocaleString("id-ID")} / scoop
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const target = selectedRecipe;
                  setIsDetailOpen(false);
                  setSelectedRecipe(null);
                  setSelectedFormulation(null);
                  handleOpenEdit(target);
                }}
                className="flex-1 py-3 rounded-full border border-slate-200 hover:bg-slate-50 text-[#2D3D6E] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit BOM Formulation</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedRecipe(null);
                  setSelectedFormulation(null);
                }}
                className="flex-1 py-3 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold shadow-lg shadow-[#2D3D6E]/20 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT / CREATE RECIPE & MULTI-INGREDIENT BOM MODAL                      */}
      {/* ========================================================================= */}
      {isEditOpen && editingRecipe && editingFormulation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="w-full max-w-4xl bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-xl text-[#2D3D6E]">
                    {modalMode === "create" ? "Add New Flavor Formulation & BOM" : "Edit Formulation & BOM"}
                  </h3>
                  {modalMode === "create" && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      New Variant
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-slate-400 mt-0.5">
                  {modalMode === "create"
                    ? "Formulate a new gelato or sorbetto variant from scratch or start with balanced templates."
                    : `${editingFormulation.flavorId} • ${editingRecipe.name}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingRecipe(null);
                  setEditingFormulation(null);
                }}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Template Presets (Create Mode Only) */}
            {modalMode === "create" && (
              <div className="bg-[#F6F8FC] p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick-Start Balanced Recipe Templates:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Click to load recipe standard</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BOM_PRESET_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.key}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl.key)}
                      className={`px-3 py-2 rounded-xl text-left transition-all border cursor-pointer ${
                        activeTemplateKey === tmpl.key
                          ? "bg-white border-[#2D3D6E] shadow-xs ring-2 ring-[#2D3D6E]/10"
                          : "bg-white/60 hover:bg-white border-slate-200 text-slate-600"
                      }`}
                    >
                      <span className="font-bold text-xs text-[#2D3D6E] block truncate">{tmpl.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {tmpl.series} • {tmpl.masterBase}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-5">
              {/* Primary Master Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-[#F6F8FC] p-4 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Flavor ID / Code</label>
                  <input
                    type="text"
                    required
                    value={editingFormulation.flavorId}
                    onChange={(e) =>
                      setEditingFormulation({ ...editingFormulation, flavorId: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-[#2D3D6E] bg-white focus:outline-hidden focus:border-[#2D3D6E]"
                    placeholder="e.g. FLV-AVO-01"
                  />
                </div>

                <div className="space-y-1 lg:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600">Flavor Variant Name</label>
                  <input
                    type="text"
                    required
                    value={editingFormulation.name}
                    onChange={(e) =>
                      setEditingFormulation({ ...editingFormulation, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#2D3D6E] bg-white focus:outline-hidden focus:border-[#2D3D6E]"
                    placeholder="e.g. Avocado Espresso Fusion"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Series Category</label>
                  <select
                    value={editingFormulation.series}
                    onChange={(e) =>
                      setEditingFormulation({ ...editingFormulation, series: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#2D3D6E] bg-white focus:outline-hidden focus:border-[#2D3D6E]"
                  >
                    {GELATO_SERIES.filter((s) => s !== "All").map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Target Overrun %</label>
                  <input
                    type="number"
                    min={10}
                    max={60}
                    value={editingFormulation.targetOverrun}
                    onChange={(e) =>
                      setEditingFormulation({
                        ...editingFormulation,
                        targetOverrun: Number(e.target.value) || 30,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-emerald-700 bg-white focus:outline-hidden focus:border-[#2D3D6E]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                  <label className="text-[11px] font-bold text-slate-600">Master Base Classification</label>
                  <input
                    type="text"
                    required
                    value={editingFormulation.masterBase}
                    onChange={(e) =>
                      setEditingFormulation({ ...editingFormulation, masterBase: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold text-[#2D3D6E] bg-white focus:outline-hidden focus:border-[#2D3D6E]"
                    placeholder="e.g. MB-01 Fior di Latte Base"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2 lg:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600">Ideal Serving Temp</label>
                  <input
                    type="text"
                    value={editingFormulation.servingTemp}
                    onChange={(e) =>
                      setEditingFormulation({ ...editingFormulation, servingTemp: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 bg-white focus:outline-hidden focus:border-[#2D3D6E]"
                    placeholder="e.g. -12°C to -13°C"
                  />
                </div>
              </div>

              {/* Live Food Science Balancing Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-mono block">Batch Weight</span>
                  <span className="font-mono font-bold text-xs text-[#2D3D6E]">
                    {editingFormulation.batchTargetGrams.toLocaleString("id-ID")}g
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-mono block">Fat %</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editingFormulation.fatPercent}
                    onChange={(e) =>
                      setEditingFormulation({ ...editingFormulation, fatPercent: Number(e.target.value) || 0 })
                    }
                    className="w-16 px-1 py-0.5 rounded border border-slate-200 text-center font-mono font-bold text-xs text-amber-700 bg-white"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-mono block">MSNF %</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editingFormulation.msnfPercent}
                    onChange={(e) =>
                      setEditingFormulation({ ...editingFormulation, msnfPercent: Number(e.target.value) || 0 })
                    }
                    className="w-16 px-1 py-0.5 rounded border border-slate-200 text-center font-mono font-bold text-xs text-indigo-700 bg-white"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-mono block">Total Solids %</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editingFormulation.solidsPercent}
                    onChange={(e) =>
                      setEditingFormulation({ ...editingFormulation, solidsPercent: Number(e.target.value) || 0 })
                    }
                    className="w-16 px-1 py-0.5 rounded border border-slate-200 text-center font-mono font-bold text-xs text-blue-700 bg-white"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-mono block">POD</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editingFormulation.pod}
                    onChange={(e) =>
                      setEditingFormulation({ ...editingFormulation, pod: Number(e.target.value) || 0 })
                    }
                    className="w-16 px-1 py-0.5 rounded border border-slate-200 text-center font-mono font-bold text-xs text-purple-700 bg-white"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-mono block">PAC</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editingFormulation.pac}
                    onChange={(e) =>
                      setEditingFormulation({ ...editingFormulation, pac: Number(e.target.value) || 0 })
                    }
                    className="w-16 px-1 py-0.5 rounded border border-slate-200 text-center font-mono font-bold text-xs text-cyan-700 bg-white"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-mono block">Batch COGS</span>
                  <span className="font-mono font-bold text-xs text-slate-800 block mt-0.5">
                    Rp {editingFormulation.cogsEstimatedPerTub.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-mono block">Scoop COGS (70g)</span>
                  <span className="font-mono font-bold text-xs text-emerald-700 block mt-0.5">
                    Rp {editingFormulation.cogsEstimatedPerScoop.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Multi-Ingredient BOM Table Editor */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-[#2D3D6E] flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#2D3D6E]" />
                      <span>Ingredient Bill of Materials (BOM) Formulation Table</span>
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Edit ingredient names, categories, batch weights (grams), and raw material cost per kg.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="px-3.5 py-1.5 rounded-full bg-[#2D3D6E]/10 hover:bg-[#2D3D6E] hover:text-white text-[#2D3D6E] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Ingredient</span>
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Ingredient Name</th>
                        <th className="py-2.5 px-2">Category</th>
                        <th className="py-2.5 px-2 w-28 text-right">Batch Weight (g)</th>
                        <th className="py-2.5 px-2 text-right">Ratio %</th>
                        <th className="py-2.5 px-2 w-28 text-right">Cost / kg (Rp)</th>
                        <th className="py-2.5 px-2 text-right">Subtotal Cost</th>
                        <th className="py-2.5 px-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {editingFormulation.ingredients.map((ing, idx) => {
                        const totalG = editingFormulation.batchTargetGrams || 1;
                        const ratio = ((ing.gramsBatch / totalG) * 100).toFixed(1);
                        const cost = (ing.gramsBatch / 1000) * ing.costPerKg;

                        return (
                          <tr key={ing.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-sans">
                              <input
                                type="text"
                                required
                                value={ing.name}
                                onChange={(e) => handleUpdateIngredientName(idx, e.target.value)}
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-hidden focus:border-[#2D3D6E]"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <select
                                value={ing.category}
                                onChange={(e) =>
                                  handleUpdateIngredientCategory(
                                    idx,
                                    e.target.value as DetailedBOMIngredient["category"]
                                  )
                                }
                                className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700 bg-white"
                              >
                                {INGREDIENT_CATEGORIES.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  step="0.5"
                                  value={ing.gramsBatch}
                                  onChange={(e) =>
                                    handleUpdateIngredientBatchGrams(idx, Number(e.target.value) || 0)
                                  }
                                  className="w-20 px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono font-bold text-[#2D3D6E] text-right bg-white"
                                />
                                <span className="text-[10px] text-slate-400 font-mono">g</span>
                              </div>
                            </td>
                            <td className="py-2 px-2 text-right font-medium text-slate-600">
                              {ratio}%
                            </td>
                            <td className="py-2 px-2 text-right">
                              <input
                                type="number"
                                min={0}
                                step={500}
                                value={ing.costPerKg}
                                onChange={(e) =>
                                  handleUpdateIngredientCost(idx, Number(e.target.value) || 0)
                                }
                                className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono text-right text-slate-700 bg-white"
                              />
                            </td>
                            <td className="py-2 px-2 text-right font-bold text-slate-800">
                              Rp {Math.round(cost).toLocaleString("id-ID")}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {editingFormulation.ingredients.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteIngredient(idx)}
                                  className="p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete Ingredient"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-[#F6F8FC] font-bold border-t border-slate-200 text-xs text-[#2D3D6E]">
                      <tr>
                        <td colSpan={2} className="py-2.5 px-3">
                          Total Batch Formulation
                        </td>
                        <td className="py-2.5 px-2 text-right font-extrabold text-[#2D3D6E]">
                          {editingFormulation.batchTargetGrams.toLocaleString("id-ID")}g
                        </td>
                        <td className="py-2.5 px-2 text-right">100.0%</td>
                        <td className="py-2.5 px-2 text-right text-slate-400 font-normal">--</td>
                        <td className="py-2.5 px-2 text-right font-extrabold text-emerald-700">
                          Rp {editingFormulation.cogsEstimatedPerTub.toLocaleString("id-ID")}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* SOP Preparation & Instructions Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">
                  Standard Operating Procedure (SOP) & Inclusions Handling
                </label>
                <textarea
                  rows={2}
                  value={editingFormulation.instructions}
                  onChange={(e) =>
                    setEditingFormulation({ ...editingFormulation, instructions: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans text-slate-700 bg-white focus:outline-hidden focus:border-[#2D3D6E]"
                />
              </div>

              {/* Allergen Checkbox Declarations */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600">Allergen Declarations</label>
                  <button
                    type="button"
                    onClick={handleAutoSuggestAllergens}
                    className="text-[10px] font-mono text-[#2D3D6E] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Auto-Detect from Ingredients</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {ALLERGEN_OPTIONS.map((allergen) => {
                    const isSelected = editingFormulation.allergens?.includes(allergen);
                    return (
                      <button
                        key={allergen}
                        type="button"
                        onClick={() => toggleAllergen(allergen)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-[#F0E79D] text-[#2D3D6E] shadow-xs"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{allergen}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingRecipe(null);
                    setEditingFormulation(null);
                  }}
                  className="px-5 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold shadow-lg shadow-[#2D3D6E]/20 transition-all cursor-pointer"
                >
                  {modalMode === "create" ? "Create & Save BOM" : "Save Formulation & BOM"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
