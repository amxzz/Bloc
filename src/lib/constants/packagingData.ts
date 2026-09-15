import { PackagingOption } from "@/types/cashier";

export const PACKAGING_OPTIONS: PackagingOption[] = [
  // Cup Series
  {
    id: "pkg-cup-piccolo",
    category: "Cup",
    name: "Piccolo",
    maxScoops: 1,
    price: 25000,
    description: "Single scoop portion in Bloc classic cup",
  },
  {
    id: "pkg-cup-medio",
    category: "Cup",
    name: "Medio",
    maxScoops: 2,
    price: 34000,
    description: "Double scoop portion up to 2 flavors",
  },
  {
    id: "pkg-cup-grande",
    category: "Cup",
    name: "Grande",
    maxScoops: 3,
    price: 42000,
    description: "Triple scoop portion up to 3 flavors",
  },

  // Cono Series
  {
    id: "pkg-cono-bambino",
    category: "Cono",
    name: "Bambino",
    maxScoops: 1,
    price: 27000,
    description: "Crispy waffle cone with single scoop",
  },
  {
    id: "pkg-cono-classico",
    category: "Cono",
    name: "Classico",
    maxScoops: 2,
    price: 35000,
    description: "Crispy waffle cone with double scoop",
  },
  {
    id: "pkg-cono-maestro",
    category: "Cono",
    name: "Maestro",
    maxScoops: 3,
    price: 43000,
    description: "Crispy waffle cone with triple scoop",
  },

  // Vaschetta
  {
    id: "pkg-vas-solo",
    category: "Vaschetta",
    name: "Solo 350 ml",
    maxScoops: 2,
    volumeMl: 350,
    price: 79000,
    description: "Takeaway insulated box 350 ml up to 2 flavors",
  },
  {
    id: "pkg-vas-coppia",
    category: "Vaschetta",
    name: "Coppia 700 ml",
    maxScoops: 3,
    volumeMl: 700,
    price: 86000,
    description: "Takeaway insulated box 700 ml up to 3 flavors",
  },
];
