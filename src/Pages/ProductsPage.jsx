import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "../Components/common/Header";
import { StatCard } from "../Components/common/StatCard";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Plus,
} from "lucide-react";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesTrendChart from "../Components/products/salesChart";
import ProductsTable from "../Components/products/productsTable";
import ProductForm from "../Components/products/productForm";

const ProductsPage = () => {
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [refreshProducts, setRefreshProducts] = useState(false);

  const handleToggleForm = (e) => {
    if (e) e.preventDefault();
    console.log("Toggling form. Current state:", showProductForm); // Debug log
    setShowProductForm(!showProductForm);
    if (showProductForm) {
      setSelectedProduct(null);
    }
  };

  const handleEditProduct = (product) => {
    console.log("Editing product:", product); // Debug log
    setSelectedProduct(product);
    setShowProductForm(true);
  };

  const handleProductSubmit = (product) => {
    setShowProductForm(false);
    setSelectedProduct(null);
    setRefreshProducts((prev) => !prev);
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Products" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* Add Product Button & Stats */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <motion.button
            onClick={handleToggleForm}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center mb-4 md:mb-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
          >
            <Plus className="mr-2" size={18} />
            {showProductForm ? "Cancel" : "Add Product"}
          </motion.button>

          {/* Product form will be conditionally rendered */}
          {!showProductForm && (
            <motion.div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 w-full md:w-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StatCard
                name="Total Products"
                icon={Package}
                value={1234}
                color="#6366F1"
              />
              <StatCard
                name="Top Selling"
                icon={TrendingUp}
                value={89}
                color="#10B981"
              />
              <StatCard
                name="Low Stock"
                icon={AlertTriangle}
                value={23}
                color="#F59E0B"
              />
              <StatCard
                name="Total Revenue"
                icon={DollarSign}
                value={"$543,210"}
                color="#EF4444"
              />
            </motion.div>
          )}
        </div>

        {/* Product Form */}
        {showProductForm ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <ProductForm
              product={selectedProduct}
              onSubmit={handleProductSubmit}
              onCancel={handleToggleForm}
            />
          </motion.div>
        ) : (
          <>
            <ProductsTable
              onEditProduct={handleEditProduct}
              key={refreshProducts.toString()}
            />
            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SalesTrendChart />
              <CategoryDistributionChart />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ProductsPage;
