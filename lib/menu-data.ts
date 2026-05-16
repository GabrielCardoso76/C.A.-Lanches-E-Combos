import type { MenuItem } from "@/components/cart-context"

export const WHATSAPP_NUMBER = "5500000000000"

export const menuData: MenuItem[] = [
  // Lanches
  {
    id: "lanche-1",
    name: "X-Burger",
    description: "Pão, hambúrguer artesanal, queijo, alface, tomate e maionese especial",
    price: 18.00,
    image: "/images/x-burger.jpg",
    category: "lanches",
  },
  {
    id: "lanche-2",
    name: "X-Bacon",
    description: "Pão, hambúrguer artesanal, queijo, bacon crocante, alface e maionese",
    price: 22.00,
    image: "/images/x-burger.jpg",
    category: "lanches",
  },
  {
    id: "lanche-3",
    name: "X-Egg",
    description: "Pão, hambúrguer artesanal, queijo, ovo, alface, tomate e maionese",
    price: 20.00,
    image: "/images/x-burger.jpg",
    category: "lanches",
  },
  {
    id: "lanche-4",
    name: "X-Tudo",
    description: "Pão, hambúrguer duplo, queijo, bacon, ovo, presunto, alface, tomate e maionese",
    price: 28.00,
    image: "/images/x-burger.jpg",
    category: "lanches",
  },
  {
    id: "lanche-5",
    name: "X-Salada",
    description: "Pão, hambúrguer artesanal, queijo, alface, tomate, cebola e maionese",
    price: 17.00,
    image: "/images/x-burger.jpg",
    category: "lanches",
  },

  // Combos
  {
    id: "combo-1",
    name: "Combo Individual",
    description: "1 X-Burger + Batata Frita pequena + 1 Refrigerante lata",
    price: 29.90,
    image: "/images/combo-familia.jpg",
    category: "combos",
  },
  {
    id: "combo-2",
    name: "Combo Casal",
    description: "2 X-Burger + Batata Frita grande + 2 Refrigerantes lata",
    price: 54.90,
    image: "/images/combo-familia.jpg",
    category: "combos",
  },
  {
    id: "combo-3",
    name: "Combo Família",
    description: "4 X-Burger + 2 Batatas Fritas grandes + 1 Refrigerante 2L",
    price: 89.90,
    image: "/images/combo-familia.jpg",
    category: "combos",
  },

  // Porções
  {
    id: "porcao-1",
    name: "Porção de Frango",
    description: "Frango empanado crocante com molho especial (500g)",
    price: 32.00,
    image: "/images/porcao-frango.jpg",
    category: "porcoes",
  },
  {
    id: "porcao-2",
    name: "Porção de Calabresa",
    description: "Calabresa acebolada com farofa (400g)",
    price: 28.00,
    image: "/images/porcao-frango.jpg",
    category: "porcoes",
  },
  {
    id: "porcao-3",
    name: "Porção Mista",
    description: "Frango, calabresa e batata frita com molho (600g)",
    price: 38.00,
    image: "/images/porcao-frango.jpg",
    category: "porcoes",
  },

  // Refrigerantes
  {
    id: "refri-1",
    name: "Coca-Cola Lata",
    description: "Coca-Cola 350ml gelada",
    price: 6.00,
    image: "/images/refrigerante.jpg",
    category: "refrigerantes",
  },
  {
    id: "refri-2",
    name: "Guaraná Lata",
    description: "Guaraná Antarctica 350ml gelado",
    price: 5.50,
    image: "/images/refrigerante.jpg",
    category: "refrigerantes",
  },
  {
    id: "refri-3",
    name: "Coca-Cola 2L",
    description: "Coca-Cola 2 litros",
    price: 12.00,
    image: "/images/refrigerante.jpg",
    category: "refrigerantes",
  },
  {
    id: "refri-4",
    name: "Suco Natural",
    description: "Suco natural da fruta (500ml) - consulte sabores",
    price: 8.00,
    image: "/images/refrigerante.jpg",
    category: "refrigerantes",
  },

  // Avulsos
  {
    id: "avulso-1",
    name: "Batata Frita P",
    description: "Porção individual de batata frita crocante (200g)",
    price: 12.00,
    image: "/images/batata-frita.jpg",
    category: "avulsos",
  },
  {
    id: "avulso-2",
    name: "Batata Frita G",
    description: "Porção grande de batata frita crocante (400g)",
    price: 20.00,
    image: "/images/batata-frita.jpg",
    category: "avulsos",
  },
  {
    id: "avulso-3",
    name: "Onion Rings",
    description: "Anéis de cebola empanados crocantes (250g)",
    price: 16.00,
    image: "/images/batata-frita.jpg",
    category: "avulsos",
  },
  {
    id: "avulso-4",
    name: "Nuggets (10un)",
    description: "10 unidades de nuggets de frango com molho",
    price: 18.00,
    image: "/images/porcao-frango.jpg",
    category: "avulsos",
  },
]

export const categories = [
  { id: "lanches", label: "Lanches", emoji: "🍔" },
  { id: "combos", label: "Combos", emoji: "🎉" },
  { id: "porcoes", label: "Porções", emoji: "🍗" },
  { id: "refrigerantes", label: "Bebidas", emoji: "🥤" },
  { id: "avulsos", label: "Avulsos", emoji: "🍟" },
]
