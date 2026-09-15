import { ToppingOption, SauceOption } from "@/types/cashier";

export const TOPPING_OPTIONS: ToppingOption[] = [
  { id: "top-brownies", name: "Fudgy Brownies", price: 4500 },
  { id: "top-oreo", name: "Oreo Crumble", price: 2500 },
  { id: "top-marshmallow", name: "Mini Marshmallow", price: 3000 },
  { id: "top-almond", name: "Almond Flakes", price: 4000 },
  { id: "top-granola", name: "Mix Granola", price: 2500 },
  { id: "top-pistachio", name: "Pistachio Crumb", price: 5000 },
];

export const SAUCE_OPTIONS: SauceOption[] = [
  { id: "sauce-choco", name: "Chocolate Sauce", price: 2000 },
  { id: "sauce-caramel", name: "Caramel Sauce", price: 2000 },
  { id: "sauce-berry", name: "Berry Compote Sauce", price: 3500 },
  { id: "sauce-maple", name: "Maple Syrup Sauce", price: 3500 },
];
