import { useState, useEffect } from "react";
import axios from "axios";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    emri: "",
    pershkrimi: "",
    firma: "",
    cmimi: "",
    productCategoryID: "",
  });
  const [editedProduct, setEditedProduct] = useState({
    emri: "",
    pershkrimi: "",
    firma: "",
    cmimi: "",
    productCategoryID: "",
    imageUrl: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3001/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(response.data);
    } catch (error) {
      console.error("There was an error fetching the products!", error);
    }
  };

  // Fetch products by category
  const fetchProductsByCategory = async (categoryID) => {
    try {
      const response = await axios.get(`http://localhost:3001/products/category/${categoryID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(response.data);
    } catch (error) {
      console.error("There was an error fetching products by category!", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form changes
  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle image changes
  const handleImageChange = (e, type) => {
    if (type === "new") {
      setSelectedImage(e.target.files[0]);
    } else {
      setEditedProduct((prevState) => ({
        ...prevState,
        imageUrl: e.target.files[0],
      }));
    }
  };

  // Create a new product
  const handleAddProduct = async () => {
    const formData = new FormData();
    formData.append("emri", newProduct.emri);
    formData.append("pershkrimi", newProduct.pershkrimi);
    formData.append("firma", newProduct.firma);
    formData.append("cmimi", newProduct.cmimi);
    formData.append("productCategoryID", newProduct.productCategoryID);
    if (selectedImage) {
      formData.append("img", selectedImage);
    }

    try {
      await axios.post("http://localhost:3001/products", formData, axiosConfig);
      fetchProducts();
      setNewProduct({
        emri: "",
        pershkrimi: "",
        firma: "",
        cmimi: "",
        productCategoryID: "",
      });
      setSelectedImage(null);
      setShowAddProductForm(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // Edit an existing product
  const handleEditProduct = async () => {
    const formData = new FormData();
    formData.append("emri", editedProduct.emri);
    formData.append("pershkrimi", editedProduct.pershkrimi);
    formData.append("firma", editedProduct.firma);
    formData.append("cmimi", editedProduct.cmimi);
    formData.append("productCategoryID", editedProduct.productCategoryID);
    if (editedProduct.imageUrl) {
      formData.append("img", editedProduct.imageUrl);
    }

    try {
      await axios.put(`http://localhost:3001/products/${editingProductId}`, formData, axiosConfig);
      fetchProducts();
      setEditingProductId(null);
      setEditedProduct({
        emri: "",
        pershkrimi: "",
        firma: "",
        cmimi: "",
        productCategoryID: "",
        imageUrl: "",
      });
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  // Delete a product by ID
  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:3001/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return {
    products,
    newProduct,
    editedProduct,
    formErrors,
    selectedImage,
    editingProductId,
    showAddProductForm,
    handleAddProduct,
    handleAddInputChange,
    handleEditProduct,
    handleEditInputChange,
    handleDeleteProduct,
    setShowAddProductForm,
    handleImageChange,
    fetchProductsByCategory,
    setEditingProductId,
    setFormErrors,
  };
};
