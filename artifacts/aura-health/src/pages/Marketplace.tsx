import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetProducts, useGetCart, useAddToCart, useRemoveFromCart } from "@workspace/api-client-react";
import { ShoppingBag, Leaf, Filter, X, Plus, Minus, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const CATEGORIES = [
  { id: "all", label: "All Products" },
  { id: "pads", label: "Pads" },
  { id: "tampons", label: "Tampons" },
  { id: "cups", label: "Cups" },
  { id: "heat_patches", label: "Heat Patches" },
  { id: "chocolates", label: "Chocolates" },
  { id: "supplements", label: "Supplements" }
];

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const { data: products, isLoading: productsLoading } = useGetProducts();
  const { data: cartItems, isLoading: cartLoading } = useGetCart();
  const addToCart = useAddToCart();
  const removeFromCart = useRemoveFromCart();

  const filteredProducts = products?.filter(
    p => selectedCategory === "all" || p.category === selectedCategory
  );

  const cartTotal = cartItems?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;
  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleAddToCart = (productId: number) => {
    addToCart.mutate({
      data: {
        productId,
        quantity: 1
      }
    });
  };

  const EcoRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5 text-green-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Leaf key={i} size={14} className={i < rating ? "fill-current" : "text-muted-foreground/30"} />
      ))}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground font-serif">Pure Essentials</h1>
          <p className="text-muted-foreground text-lg">Curated, eco-conscious products for your cycle.</p>
        </div>

        {/* Cart Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-bold shadow-md hover:scale-105 transition-transform">
              <ShoppingBag size={20} />
              <span>Cart ({cartCount})</span>
            </button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md border-l-border bg-background p-0 flex flex-col">
            <SheetHeader className="p-6 border-b border-border">
              <SheetTitle className="font-serif text-2xl">Your Cart</SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartLoading ? (
                <div className="text-center text-muted-foreground">Loading cart...</div>
              ) : cartItems?.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems?.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-card border rounded-2xl p-4">
                      <div className="w-20 h-20 bg-secondary rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                        <Leaf className="text-primary/20 w-10 h-10" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-sm">{item.product.name}</h4>
                          <p className="text-primary font-bold">£{item.product.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3 bg-secondary/50 rounded-lg px-2 py-1">
                            <span className="text-xs font-medium">Qty: {item.quantity}</span>
                          </div>
                          <button 
                            onClick={() => removeFromCart.mutate({ id: item.id })}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-card border-t border-border mt-auto">
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl font-serif">£{cartTotal.toFixed(2)}</span>
              </div>
              <button 
                disabled={cartItems?.length === 0}
                className="w-full bg-primary text-primary-foreground py-4 rounded-full font-bold text-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                Checkout Securely
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${
              selectedCategory === category.id 
                ? "bg-foreground text-background border-foreground shadow-sm" 
                : "bg-card text-muted-foreground border-border hover:border-primary/30"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {productsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card border rounded-3xl h-[400px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts?.map((product) => (
              <motion.div 
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-card rounded-3xl overflow-hidden border shadow-sm group flex flex-col h-full hover:shadow-md transition-shadow relative"
              >
                {product.badge && (
                  <div className="absolute top-4 left-4 z-10 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    {product.badge}
                  </div>
                )}
                <div className="h-48 bg-secondary/30 relative flex items-center justify-center p-6 shrink-0">
                  <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    {/* Placeholder for product image */}
                    <Leaf className="text-primary/20 w-16 h-16" />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-foreground line-clamp-2 leading-tight">{product.name}</h3>
                    <span className="font-bold text-primary whitespace-nowrap">£{product.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{product.description}</p>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                    <EcoRating rating={product.ecoRating} />
                    <button 
                      onClick={() => handleAddToCart(product.id)}
                      disabled={!product.inStock || addToCart.isPending}
                      className="bg-primary/10 hover:bg-primary hover:text-white text-primary w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                      aria-label="Add to cart"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
