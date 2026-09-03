"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import responsive from "./admin.module.css";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
const ADMIN_SESSION_KEY = "zenit_admin_key";

type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  active: boolean;
  productCount?: number;
};

type Product = {
  id: string;
  slug: string;
  sku?: string | null;
  name: string;
  brand: string;
  description: string;
  price: number;
  imageUrl: string;
  stock?: number | null;
  available: boolean;
  active: boolean;
  sortOrder: number;
  categoryId: string;
  category?: {
    id: string;
    slug: string;
    name: string;
  } | null;
};

type ProductForm = {
  name: string;
  brand: string;
  description: string;
  price: string;
  imageUrl: string;
  stock: string;
  sku: string;
  categoryId: string;
  available: boolean;
  active: boolean;
  sortOrder: string;
};

type CategoryForm = {
  name: string;
  description: string;
  sortOrder: string;
  active: boolean;
};

type Customer = {
  id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  purchasePoints: number;
  referralPoints: number;
  totalPoints: number;
};

type CustomerForm = {
  name: string;
  email: string;
  phone: string;
  purchasePoints: string;
  referralPoints: string;
};

const emptyProductForm: ProductForm = {
  name: "",
  brand: "",
  description: "",
  price: "",
  imageUrl: "",
  stock: "",
  sku: "",
  categoryId: "",
  available: true,
  active: true,
  sortOrder: "0",
};

const emptyCategoryForm: CategoryForm = {
  name: "",
  description: "",
  sortOrder: "0",
  active: true,
};

function formatColones(value: number) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<"catalog" | "customers" | "points">("catalog");
  const [adminKey, setAdminKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loginError, setLoginError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm);
  const [customerQuery, setCustomerQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [amountColones, setAmountColones] = useState("");
  const [pointDescription, setPointDescription] = useState("Compra o servicio confirmado");
  const [customerPage, setCustomerPage] = useState(1);
  const [customerTotal, setCustomerTotal] = useState(0);
  const [customerTotalPages, setCustomerTotalPages] = useState(1);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState<CustomerForm | null>(null);

  const headers = (key = adminKey) => ({
    "Content-Type": "application/json",
    "x-admin-key": key,
  });

  const loadAdminData = async (key = adminKey) => {
    setLoading(true);
    setActionError("");

    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_URL}/api/admin/products`, {
          cache: "no-store",
          headers: { "x-admin-key": key },
        }),
        fetch(`${API_URL}/api/admin/product-categories`, {
          cache: "no-store",
          headers: { "x-admin-key": key },
        }),
      ]);

      if (productsResponse.status === 401 || categoriesResponse.status === 401) {
        throw new Error("Clave administrativa incorrecta.");
      }

      const productsData = await productsResponse.json();
      const categoriesData = await categoriesResponse.json();

      if (!productsResponse.ok) {
        throw new Error(productsData.error || "No se pudieron cargar los productos.");
      }

      if (!categoriesResponse.ok) {
        throw new Error(categoriesData.error || "No se pudieron cargar las categorías.");
      }

      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
      return true;
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo abrir el panel.");
      return false;
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  useEffect(() => {
    const savedKey = sessionStorage.getItem(ADMIN_SESSION_KEY);

    if (!savedKey) {
      setChecking(false);
      return;
    }

    setAdminKey(savedKey);

    loadAdminData(savedKey).then((ok) => {
      if (ok) {
        setAuthenticated(true);
      } else {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");
    setActionError("");

    const key = adminKey.trim();

    if (!key) {
      setLoginError("Ingresá la clave administrativa.");
      return;
    }

    const ok = await loadAdminData(key);

    if (!ok) {
      setLoginError("No se pudo validar la clave administrativa.");
      return;
    }

    sessionStorage.setItem(ADMIN_SESSION_KEY, key);
    setAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminKey("");
    setAuthenticated(false);
    setProducts([]);
    setCategories([]);
    setShowProductForm(false);
    setShowCategoryForm(false);
    setEditingProduct(null);
    setEditingCategory(null);
    setMessage("");
    setActionError("");
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) =>
      [product.name, product.brand, product.sku || "", product.category?.name || ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [products, search]);

  const pointsPreview = useMemo(
    () => Math.floor(Math.max(0, Number(amountColones) || 0) / 100),
    [amountColones],
  );

  const loadCustomers = async (page = 1, query = customerQuery.trim()) => {
    setCustomerLoading(true);
    setActionError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/customers?q=${encodeURIComponent(query)}&page=${page}&pageSize=50`,
        { cache: "no-store", headers: { "x-admin-key": adminKey } },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudieron buscar los clientes.");
      }

      setCustomers(result.customers || []);
      setCustomerPage(result.pagination?.page || 1);
      setCustomerTotal(result.pagination?.total || 0);
      setCustomerTotalPages(result.pagination?.totalPages || 1);
      if (!(result.customers || []).length) {
        setMessage("No encontramos clientes con esos datos.");
      }
    } catch (error) {
      setCustomers([]);
      setActionError(error instanceof Error ? error.message : "No se pudieron buscar los clientes.");
    } finally {
      setCustomerLoading(false);
    }
  };

  const searchCustomers = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSelectedCustomer(null);
    await loadCustomers(1);
  };

  const openEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      purchasePoints: String(customer.purchasePoints),
      referralPoints: String(customer.referralPoints),
    });
    setActionError("");
    setMessage("");
  };

  const saveCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCustomer || !customerForm) return;

    setCustomerLoading(true);
    setActionError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/admin/customers/${editingCustomer.id}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({
          ...customerForm,
          purchasePoints: Number(customerForm.purchasePoints),
          referralPoints: Number(customerForm.referralPoints),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo actualizar el cliente.");

      const updated = result.customer as Customer;
      setCustomers((current) => current.map((customer) => customer.id === updated.id ? updated : customer));
      setSelectedCustomer((current) => current?.id === updated.id ? updated : current);
      setEditingCustomer(null);
      setCustomerForm(null);
      setMessage(`Cliente ${updated.name} actualizado correctamente.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo actualizar el cliente.");
    } finally {
      setCustomerLoading(false);
    }
  };

  const deleteCustomer = async (customer: Customer) => {
    const confirmed = window.confirm(
      `¿Eliminar definitivamente a ${customer.name}? Esta acción también borrará su historial de puntos y no se puede deshacer.`,
    );
    if (!confirmed) return;

    setCustomerLoading(true);
    setActionError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/admin/customers/${customer.id}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo eliminar el cliente.");

      if (selectedCustomer?.id === customer.id) setSelectedCustomer(null);
      if (editingCustomer?.id === customer.id) {
        setEditingCustomer(null);
        setCustomerForm(null);
      }
      await loadCustomers(customerPage);
      setMessage(`Cliente ${customer.name} eliminado.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo eliminar el cliente.");
    } finally {
      setCustomerLoading(false);
    }
  };

  const awardPoints = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCustomer) return;

    setCustomerLoading(true);
    setActionError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/admin/points/purchase`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          email: selectedCustomer.email,
          amountColones: Number(amountColones),
          description: pointDescription.trim(),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudieron acreditar los puntos.");
      }

      const updatedCustomer = result.customer as Customer;
      setSelectedCustomer(updatedCustomer);
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === updatedCustomer.id ? updatedCustomer : customer,
        ),
      );
      setAmountColones("");
      setMessage(`Listo: se agregaron ${result.points} puntos a ${updatedCustomer.name}.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudieron acreditar los puntos.");
    } finally {
      setCustomerLoading(false);
    }
  };

  const openCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      ...emptyProductForm,
      categoryId: categories.find((category) => category.active)?.id || "",
    });
    setMessage("");
    setActionError("");
    setShowProductForm(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl,
      stock: product.stock === null || product.stock === undefined ? "" : String(product.stock),
      sku: product.sku || "",
      categoryId: product.categoryId,
      available: product.available,
      active: product.active,
      sortOrder: String(product.sortOrder ?? 0),
    });
    setMessage("");
    setActionError("");
    setShowProductForm(true);
  };

  const closeProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setActionError("");
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadingImage(true);
    setActionError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_URL}/api/uploads/product-image`, {
        method: "POST",
        headers: {
          "x-admin-key": adminKey,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo subir la imagen.");
      }

      setProductForm((current) => ({
        ...current,
        imageUrl: result.image?.url || "",
      }));

      setMessage("Imagen cargada correctamente.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setActionError("");
    setMessage("");

    try {
      if (!productForm.imageUrl.trim()) {
        throw new Error("Seleccioná y subí una imagen antes de guardar el producto.");
      }

      const payload = {
        name: productForm.name.trim(),
        brand: productForm.brand.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price),
        imageUrl: productForm.imageUrl.trim(),
        stock: productForm.stock.trim() === "" ? null : Number(productForm.stock),
        sku: productForm.sku.trim() || null,
        categoryId: productForm.categoryId,
        available: productForm.available,
        active: productForm.active,
        sortOrder: Number(productForm.sortOrder || 0),
      };

      const url = editingProduct
        ? `${API_URL}/api/admin/products/${editingProduct.id}`
        : `${API_URL}/api/admin/products`;

      const response = await fetch(url, {
        method: editingProduct ? "PATCH" : "POST",
        headers: headers(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo guardar el producto.");
      }

      const wasEditing = Boolean(editingProduct);
      closeProductForm();
      await loadAdminData();
      setMessage(wasEditing ? "Producto actualizado correctamente." : "Producto creado correctamente.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo guardar el producto.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (product: Product) => {
    if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción lo borra del catálogo.`)) return;

    setLoading(true);
    setActionError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/admin/products/${product.id}`, {
        method: "DELETE",
        headers: headers(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo eliminar el producto.");
      }

      await loadAdminData();
      setMessage(`"${product.name}" fue eliminado.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo eliminar el producto.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (product: Product) => {
    setLoading(true);
    setActionError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ available: !product.available }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo actualizar la disponibilidad.");
      }

      await loadAdminData();
      setMessage(
        !product.available
          ? `${product.name} ahora está disponible.`
          : `${product.name} quedó marcado como agotado.`,
      );
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo actualizar el producto.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm(emptyCategoryForm);
    setMessage("");
    setActionError("");
    setShowCategoryForm(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      sortOrder: String(category.sortOrder ?? 0),
      active: category.active,
    });
    setMessage("");
    setActionError("");
    setShowCategoryForm(true);
  };

  const closeCategoryForm = () => {
    setEditingCategory(null);
    setCategoryForm(emptyCategoryForm);
    setShowCategoryForm(false);
    setActionError("");
  };

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setActionError("");
    setMessage("");

    try {
      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || null,
        sortOrder: Number(categoryForm.sortOrder || 0),
        active: categoryForm.active,
      };

      const url = editingCategory
        ? `${API_URL}/api/admin/product-categories/${editingCategory.id}`
        : `${API_URL}/api/admin/product-categories`;

      const response = await fetch(url, {
        method: editingCategory ? "PATCH" : "POST",
        headers: headers(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo guardar la categoría.");
      }

      const wasEditing = Boolean(editingCategory);
      closeCategoryForm();
      await loadAdminData();
      setMessage(wasEditing ? "Categoría actualizada correctamente." : "Categoría creada correctamente.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo guardar la categoría.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = async (category: Category) => {
    setLoading(true);
    setActionError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/admin/product-categories/${category.id}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ active: !category.active }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo actualizar la categoría.");
      }

      await loadAdminData();
      setMessage(category.active ? "Categoría desactivada." : "Categoría activada.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo actualizar la categoría.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (category: Category) => {
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"?`)) return;

    setLoading(true);
    setActionError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/admin/product-categories/${category.id}`, {
        method: "DELETE",
        headers: headers(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo eliminar la categoría.");
      }

      await loadAdminData();
      setMessage(`La categoría "${category.name}" fue eliminada.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo eliminar la categoría.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <main style={styles.centered}>
        <div style={styles.loadingCard}>Abriendo administración Zénit…</div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main style={styles.loginPage}>
        <section style={styles.loginCard}>
          <img src="/logo-zenit.png" alt="Zénit Salón" style={styles.loginLogo} />
          <p style={styles.eyebrow}>Administración privada</p>
          <h1 style={styles.loginTitle}>Control de catálogo</h1>
          <p style={styles.loginText}>
            Ingresá la clave administrativa para gestionar productos y categorías.
          </p>

          <form onSubmit={login} style={styles.loginForm}>
            <label style={styles.label}>
              Clave administrativa
              <input
                value={adminKey}
                onChange={(event) => setAdminKey(event.target.value)}
                type="password"
                autoComplete="off"
                placeholder="••••••••••••••"
                style={styles.input}
              />
            </label>

            {(loginError || actionError) && (
              <p style={styles.error}>{loginError || actionError}</p>
            )}

            <button type="submit" style={styles.primaryButton} disabled={loading}>
              {loading ? "Validando…" : "Ingresar al panel →"}
            </button>
          </form>

          <a href="/" style={styles.backLink}>← Volver al sitio</a>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.adminPage} className={responsive.adminPage}>
      <header style={styles.topbar} className={responsive.topbar}>
        <div style={styles.brandWrap}>
          <img src="/logo-zenit.png" alt="Zénit Salón" style={styles.brandLogo} />
          <div>
            <small style={styles.topbarSmall}>Panel administrativo</small>
            <strong style={styles.topbarTitle}>Zénit Salón</strong>
          </div>
        </div>

        <div style={styles.topbarActions} className={responsive.topbarActions}>
          <a href="/tienda" target="_blank" style={styles.secondaryButton}>
            Ver tienda
          </a>
          <button type="button" onClick={logout} style={styles.secondaryButton}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <section style={styles.shell}>
        <div style={styles.headingRow}>
          <div>
            <p style={styles.eyebrow}>Administración comercial</p>
            <h1 style={styles.pageTitle}>Gestioná Zénit desde un solo lugar.</h1>
            <p style={styles.pageLead}>
              Administrá el catálogo y acreditá puntos a clientes desde secciones independientes.
            </p>
          </div>
        </div>

        <nav className={responsive.sectionNav} aria-label="Secciones administrativas">
          <button
            type="button"
            className={`${responsive.navButton} ${activeSection === "catalog" ? responsive.navButtonActive : ""}`}
            onClick={() => setActiveSection("catalog")}
          >
            Productos y categorías
          </button>
          <button
            type="button"
            className={`${responsive.navButton} ${activeSection === "customers" ? responsive.navButtonActive : ""}`}
            onClick={() => {
              setActiveSection("customers");
              void loadCustomers(1);
            }}
          >
            Clientes registrados
          </button>
          <button
            type="button"
            className={`${responsive.navButton} ${activeSection === "points" ? responsive.navButtonActive : ""}`}
            onClick={() => {
              setActiveSection("points");
              void loadCustomers(1);
            }}
          >
            Agregar puntos
          </button>
        </nav>

        {activeSection === "customers" && (
          <section className={responsive.pointsPanel}>
            <div className={responsive.customerHeading}>
              <div>
                <p style={styles.eyebrow}>Club Zénit</p>
                <h2 style={styles.panelTitle}>Clientes registrados</h2>
                <p style={styles.pageLead}>
                  Consultá la lista completa, los puntos disponibles y administrá cada cuenta.
                </p>
              </div>
              <strong className={responsive.customerCount}>{customerTotal} clientes</strong>
            </div>

            <form className={responsive.searchForm} onSubmit={searchCustomers}>
              <input
                value={customerQuery}
                onChange={(event) => setCustomerQuery(event.target.value)}
                placeholder="Buscar por nombre, correo, WhatsApp o código…"
                aria-label="Buscar en la lista de clientes"
                style={styles.searchInput}
              />
              <button type="submit" style={styles.primaryButton} disabled={customerLoading}>
                {customerLoading ? "Cargando…" : "Buscar"}
              </button>
            </form>

            {(message || actionError) && (
              <div style={actionError ? styles.alertError : styles.alertSuccess}>
                {actionError || message}
              </div>
            )}

            <div className={responsive.customerTableWrap}>
              <table className={responsive.customerTable}>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Contacto</th>
                    <th>Compras</th>
                    <th>Referidos</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td data-label="Cliente"><strong>{customer.name}</strong><small>{customer.customerId}</small></td>
                      <td data-label="Contacto"><span>{customer.email}</span><small>{customer.phone}</small></td>
                      <td data-label="Compras">{customer.purchasePoints}</td>
                      <td data-label="Referidos">{customer.referralPoints}</td>
                      <td data-label="Total"><strong className={responsive.tablePoints}>{customer.totalPoints}</strong></td>
                      <td data-label="Acciones">
                        <div className={responsive.customerActions}>
                          <button type="button" onClick={() => openEditCustomer(customer)}>Editar</button>
                          <button type="button" className={responsive.deleteButton} onClick={() => void deleteCustomer(customer)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {customerTotalPages > 1 && (
              <div className={responsive.pagination}>
                <button type="button" disabled={customerLoading || customerPage <= 1} onClick={() => void loadCustomers(customerPage - 1)}>Anterior</button>
                <span>Página {customerPage} de {customerTotalPages}</span>
                <button type="button" disabled={customerLoading || customerPage >= customerTotalPages} onClick={() => void loadCustomers(customerPage + 1)}>Siguiente</button>
              </div>
            )}

            {editingCustomer && customerForm && (
              <div className={responsive.editOverlay} role="dialog" aria-modal="true" aria-labelledby="edit-customer-title">
                <form className={responsive.editCustomerForm} onSubmit={saveCustomer}>
                  <div className={responsive.editFormHeading}>
                    <div><small>Editar cliente</small><h3 id="edit-customer-title">{editingCustomer.name}</h3></div>
                    <button type="button" aria-label="Cerrar editor" onClick={() => { setEditingCustomer(null); setCustomerForm(null); }}>×</button>
                  </div>
                  <label style={styles.label}>Nombre<input required minLength={2} maxLength={120} value={customerForm.name} onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })} style={styles.input} /></label>
                  <label style={styles.label}>Correo<input required type="email" value={customerForm.email} onChange={(event) => setCustomerForm({ ...customerForm, email: event.target.value })} style={styles.input} /></label>
                  <label style={styles.label}>WhatsApp<input required minLength={7} maxLength={30} value={customerForm.phone} onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })} style={styles.input} /></label>
                  <div className={responsive.pointFields}>
                    <label style={styles.label}>Puntos por compras<input required type="number" min="0" value={customerForm.purchasePoints} onChange={(event) => setCustomerForm({ ...customerForm, purchasePoints: event.target.value })} style={styles.input} /></label>
                    <label style={styles.label}>Puntos por referidos<input required type="number" min="0" value={customerForm.referralPoints} onChange={(event) => setCustomerForm({ ...customerForm, referralPoints: event.target.value })} style={styles.input} /></label>
                  </div>
                  <div className={responsive.editFormActions}>
                    <button type="button" onClick={() => { setEditingCustomer(null); setCustomerForm(null); }}>Cancelar</button>
                    <button type="submit" style={styles.primaryButton} disabled={customerLoading}>{customerLoading ? "Guardando…" : "Guardar cambios"}</button>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}

        {activeSection === "points" && (
          <section className={responsive.pointsPanel}>
            <div>
              <p style={styles.eyebrow}>Club Zénit</p>
              <h2 style={styles.panelTitle}>Acreditar puntos</h2>
              <p style={styles.pageLead}>
                Buscá al cliente, verificá sus datos y registrá el monto de la compra o servicio.
                Cada ₡100 confirmados equivalen a 1 punto.
              </p>
            </div>

            <form className={responsive.searchForm} onSubmit={searchCustomers}>
              <input
                value={customerQuery}
                onChange={(event) => setCustomerQuery(event.target.value)}
                placeholder="Nombre, correo, WhatsApp o código de cliente…"
                aria-label="Buscar cliente"
                style={styles.searchInput}
              />
              <button type="submit" style={styles.primaryButton} disabled={customerLoading}>
                {customerLoading ? "Buscando…" : "Buscar cliente"}
              </button>
            </form>

            {(message || actionError) && (
              <div style={actionError ? styles.alertError : styles.alertSuccess}>
                {actionError || message}
              </div>
            )}

            {customers.length > 0 && (
              <div className={responsive.customerGrid}>
                {customers.map((customer) => (
                  <button
                    type="button"
                    key={customer.id}
                    className={`${responsive.customerCard} ${selectedCustomer?.id === customer.id ? responsive.customerCardSelected : ""}`}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setMessage("");
                      setActionError("");
                    }}
                  >
                    <small>{customer.customerId}</small>
                    <strong>{customer.name}</strong>
                    <span>{customer.email}</span>
                    <span>{customer.phone}</span>
                    <span>{customer.totalPoints} puntos disponibles</span>
                  </button>
                ))}
              </div>
            )}

            {selectedCustomer && (
              <div className={responsive.awardLayout}>
                <article className={responsive.summaryCard}>
                  <small style={styles.metricLabel}>Cliente seleccionado</small>
                  <h3>{selectedCustomer.name}</h3>
                  <p>{selectedCustomer.customerId}</p>
                  <p>{selectedCustomer.email}</p>
                  <p>{selectedCustomer.phone}</p>
                  <strong className={responsive.pointsTotal}>{selectedCustomer.totalPoints}</strong>
                  <small style={styles.metricLabel}>Puntos disponibles</small>
                </article>

                <form className={responsive.awardForm} onSubmit={awardPoints}>
                  <label style={styles.label}>
                    Monto pagado en colones
                    <input
                      required
                      type="number"
                      min="100"
                      step="100"
                      inputMode="numeric"
                      value={amountColones}
                      onChange={(event) => setAmountColones(event.target.value)}
                      placeholder="Ejemplo: 10000"
                      style={styles.input}
                    />
                  </label>

                  <label style={styles.label}>
                    Descripción
                    <input
                      required
                      minLength={3}
                      maxLength={200}
                      value={pointDescription}
                      onChange={(event) => setPointDescription(event.target.value)}
                      placeholder="Compra o servicio confirmado"
                      style={styles.input}
                    />
                  </label>

                  <div className={responsive.preview}>
                    <span>Puntos que se acreditarán</span>
                    <strong>+{pointsPreview} pts</strong>
                  </div>

                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={customerLoading || pointsPreview <= 0}
                  >
                    {customerLoading ? "Guardando…" : `Confirmar +${pointsPreview} puntos`}
                  </button>
                </form>
              </div>
            )}
          </section>
        )}

        <div hidden={activeSection !== "catalog"}>

        <div style={styles.metricsGrid}>
          <article style={styles.metricCard}>
            <small style={styles.metricLabel}>Productos</small>
            <strong style={styles.metricValue}>{products.length}</strong>
          </article>
          <article style={styles.metricCard}>
            <small style={styles.metricLabel}>Disponibles</small>
            <strong style={styles.metricValue}>
              {products.filter((product) => product.available && product.active).length}
            </strong>
          </article>
          <article style={styles.metricCard}>
            <small style={styles.metricLabel}>Agotados</small>
            <strong style={styles.metricValue}>
              {products.filter((product) => !product.available).length}
            </strong>
          </article>
          <article style={styles.metricCard}>
            <small style={styles.metricLabel}>Categorías</small>
            <strong style={styles.metricValue}>{categories.length}</strong>
          </article>
        </div>

        {(message || actionError) && (
          <div style={actionError ? styles.alertError : styles.alertSuccess}>
            {actionError || message}
          </div>
        )}

        <section style={styles.categoriesPanel}>
          <div style={styles.sectionTop}>
            <div>
              <p style={styles.eyebrow}>Categorías</p>
              <h2 style={styles.panelTitle}>Organización del catálogo</h2>
            </div>
            <button type="button" onClick={openCreateCategory} style={styles.primaryButton}>
              + Nueva categoría
            </button>
          </div>

          {showCategoryForm && (
            <form onSubmit={submitCategory} style={styles.categoryForm}>
              <div style={styles.twoColumns}>
                <label style={styles.label}>
                  Nombre
                  <input
                    required
                    value={categoryForm.name}
                    onChange={(event) =>
                      setCategoryForm({ ...categoryForm, name: event.target.value })
                    }
                    style={styles.input}
                  />
                </label>

                <label style={styles.label}>
                  Orden
                  <input
                    type="number"
                    min="0"
                    value={categoryForm.sortOrder}
                    onChange={(event) =>
                      setCategoryForm({ ...categoryForm, sortOrder: event.target.value })
                    }
                    style={styles.input}
                  />
                </label>
              </div>

              <label style={styles.label}>
                Descripción
                <textarea
                  value={categoryForm.description}
                  onChange={(event) =>
                    setCategoryForm({ ...categoryForm, description: event.target.value })
                  }
                  style={styles.textareaSmall}
                />
              </label>

              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={categoryForm.active}
                  onChange={(event) =>
                    setCategoryForm({ ...categoryForm, active: event.target.checked })
                  }
                />
                Categoría activa
              </label>

              <div style={styles.formActions}>
                <button type="button" onClick={closeCategoryForm} style={styles.secondaryButton}>
                  Cancelar
                </button>
                <button type="submit" style={styles.primaryButton} disabled={loading}>
                  {editingCategory ? "Guardar categoría" : "Crear categoría"}
                </button>
              </div>
            </form>
          )}

          <div style={styles.categoryGrid}>
            {categories.map((category) => (
              <article key={category.id} style={styles.categoryCard}>
                <div>
                  <small style={styles.categoryMeta}>
                    {category.productCount ?? 0} producto(s)
                  </small>
                  <h3 style={styles.categoryName}>{category.name}</h3>
                  <p style={styles.categoryDescription}>
                    {category.description || "Sin descripción."}
                  </p>
                </div>

                <div style={styles.cardActions}>
                  <button
                    type="button"
                    onClick={() => openEditCategory(category)}
                    style={styles.editButton}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    style={styles.secondaryButton}
                  >
                    {category.active ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCategory(category)}
                    style={styles.deleteButton}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.productsPanel}>
          <div style={styles.sectionTop}>
            <div>
              <p style={styles.eyebrow}>Productos</p>
              <h2 style={styles.panelTitle}>Inventario</h2>
            </div>
            <button type="button" onClick={openCreateProduct} style={styles.primaryButton}>
              + Nuevo producto
            </button>
          </div>

          <div style={styles.toolbar}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por producto, marca, SKU o categoría…"
              style={styles.searchInput}
            />
            <button type="button" onClick={() => loadAdminData()} style={styles.secondaryButton}>
              Actualizar
            </button>
          </div>

          {showProductForm && (
            <section style={styles.formPanel}>
              <div style={styles.formHeading}>
                <div>
                  <p style={styles.eyebrow}>
                    {editingProduct ? "Editar producto" : "Nuevo producto"}
                  </p>
                  <h2 style={styles.formTitle}>
                    {editingProduct ? editingProduct.name : "Agregar producto a Zénit"}
                  </h2>
                </div>
                <button type="button" onClick={closeProductForm} style={styles.closeButton}>
                  ×
                </button>
              </div>

              <form onSubmit={submitProduct} style={styles.productForm}>
                <div style={styles.twoColumns}>
                  <label style={styles.label}>
                    Nombre
                    <input
                      required
                      value={productForm.name}
                      onChange={(event) =>
                        setProductForm({ ...productForm, name: event.target.value })
                      }
                      style={styles.input}
                    />
                  </label>

                  <label style={styles.label}>
                    Marca
                    <input
                      required
                      value={productForm.brand}
                      onChange={(event) =>
                        setProductForm({ ...productForm, brand: event.target.value })
                      }
                      style={styles.input}
                    />
                  </label>

                  <label style={styles.label}>
                    Precio en colones
                    <input
                      required
                      type="number"
                      min="0"
                      value={productForm.price}
                      onChange={(event) =>
                        setProductForm({ ...productForm, price: event.target.value })
                      }
                      style={styles.input}
                    />
                  </label>

                  <label style={styles.label}>
                    Stock
                    <input
                      type="number"
                      min="0"
                      placeholder="Vacío = sin control"
                      value={productForm.stock}
                      onChange={(event) =>
                        setProductForm({ ...productForm, stock: event.target.value })
                      }
                      style={styles.input}
                    />
                  </label>

                  <label style={styles.label}>
                    Categoría
                    <select
                      required
                      value={productForm.categoryId}
                      onChange={(event) =>
                        setProductForm({ ...productForm, categoryId: event.target.value })
                      }
                      style={styles.input}
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories
                        .filter((category) => category.active)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label style={styles.label}>
                    SKU
                    <input
                      value={productForm.sku}
                      onChange={(event) =>
                        setProductForm({ ...productForm, sku: event.target.value })
                      }
                      style={styles.input}
                      placeholder="Opcional"
                    />
                  </label>
                </div>

                <label style={styles.label}>
                  Descripción
                  <textarea
                    required
                    value={productForm.description}
                    onChange={(event) =>
                      setProductForm({ ...productForm, description: event.target.value })
                    }
                    style={styles.textarea}
                  />
                </label>

                <div style={styles.uploadBox}>
                  <div>
                    <p style={styles.uploadTitle}>Imagen del producto</p>
                    <p style={styles.uploadText}>
                      Elegí una imagen JPG, PNG, WEBP o AVIF de hasta 5 MB.
                    </p>
                  </div>

                  <label style={styles.uploadButton}>
                    {uploadingImage ? "Subiendo…" : productForm.imageUrl ? "Cambiar imagen" : "Seleccionar imagen"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      style={styles.hiddenInput}
                    />
                  </label>
                </div>

                {productForm.imageUrl && (
                  <div style={styles.previewWrap}>
                    <img
                      src={productForm.imageUrl}
                      alt="Vista previa"
                      style={styles.previewImage}
                    />
                    <span style={styles.previewBadge}>Imagen lista</span>
                  </div>
                )}

                <div style={styles.twoColumns}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={productForm.available}
                      onChange={(event) =>
                        setProductForm({ ...productForm, available: event.target.checked })
                      }
                    />
                    Disponible para clientes
                  </label>

                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={productForm.active}
                      onChange={(event) =>
                        setProductForm({ ...productForm, active: event.target.checked })
                      }
                    />
                    Visible en catálogo
                  </label>
                </div>

                <div style={styles.formActions}>
                  <button type="button" onClick={closeProductForm} style={styles.secondaryButton}>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={loading || uploadingImage}
                  >
                    {uploadingImage
                      ? "Esperando imagen…"
                      : loading
                        ? "Guardando…"
                        : editingProduct
                          ? "Guardar cambios"
                          : "Crear producto"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {loading && !products.length ? (
            <p style={styles.empty}>Cargando catálogo…</p>
          ) : filteredProducts.length === 0 ? (
            <p style={styles.empty}>No hay productos para mostrar.</p>
          ) : (
            <div style={styles.productGrid}>
              {filteredProducts.map((product) => (
                <article key={product.id} style={styles.productCard}>
                  <div style={styles.imageFrame}>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={styles.productImage}
                    />
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(product.available && product.active
                          ? styles.statusAvailable
                          : styles.statusUnavailable),
                      }}
                    >
                      {product.available && product.active ? "Disponible" : "No disponible"}
                    </span>
                  </div>

                  <div style={styles.productBody}>
                    <small style={styles.productCategory}>
                      {product.category?.name || "Sin categoría"}
                    </small>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <p style={styles.productBrand}>{product.brand}</p>
                    <strong style={styles.productPrice}>{formatColones(product.price)}</strong>
                    <p style={styles.stockText}>
                      Stock:{" "}
                      {product.stock === null || product.stock === undefined
                        ? "sin control"
                        : product.stock}
                    </p>

                    <div style={styles.cardActions}>
                      <button
                        type="button"
                        onClick={() => openEditProduct(product)}
                        style={styles.editButton}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAvailability(product)}
                        style={styles.secondaryButton}
                      >
                        {product.available ? "Marcar agotado" : "Activar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(product)}
                        style={styles.deleteButton}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  centered: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#07111e", color: "#fff", padding: 24 },
  loadingCard: { padding: "28px 34px", border: "1px solid rgba(255,255,255,.12)", borderRadius: 20, background: "rgba(255,255,255,.04)" },
  loginPage: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "radial-gradient(circle at 70% 20%, rgba(44,126,206,.18), transparent 34%), #06101c", color: "#fff" },
  loginCard: { width: "min(100%, 460px)", padding: 38, borderRadius: 28, border: "1px solid rgba(255,255,255,.1)", background: "rgba(10,24,40,.92)", boxShadow: "0 30px 80px rgba(0,0,0,.35)" },
  loginLogo: { width: 130, height: "auto", marginBottom: 24 },
  eyebrow: { margin: "0 0 8px", fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "#7fbfff", fontWeight: 700 },
  loginTitle: { margin: 0, fontSize: 38, lineHeight: 1.05, fontWeight: 600 },
  loginText: { color: "#9fb0c2", lineHeight: 1.7, margin: "16px 0 26px" },
  loginForm: { display: "grid", gap: 18 },
  label: { display: "grid", gap: 8, fontSize: 13, color: "#cbd7e4", fontWeight: 600 },
  input: { width: "100%", boxSizing: "border-box", border: "1px solid rgba(255,255,255,.12)", borderRadius: 14, background: "#0b1b2d", color: "#fff", padding: "14px 15px", outline: "none", fontSize: 15 },
  textarea: { width: "100%", boxSizing: "border-box", minHeight: 120, resize: "vertical", border: "1px solid rgba(255,255,255,.12)", borderRadius: 14, background: "#0b1b2d", color: "#fff", padding: "14px 15px", outline: "none", fontSize: 15, fontFamily: "inherit" },
  textareaSmall: { width: "100%", boxSizing: "border-box", minHeight: 90, resize: "vertical", border: "1px solid rgba(255,255,255,.12)", borderRadius: 14, background: "#0b1b2d", color: "#fff", padding: "14px 15px", outline: "none", fontSize: 15, fontFamily: "inherit" },
  primaryButton: { border: 0, borderRadius: 14, padding: "14px 18px", background: "linear-gradient(135deg, #4aa6ff, #2569b4)", color: "#fff", fontWeight: 800, cursor: "pointer", textDecoration: "none" },
  secondaryButton: { border: "1px solid rgba(255,255,255,.14)", borderRadius: 12, padding: "11px 14px", background: "rgba(255,255,255,.04)", color: "#dce8f5", fontWeight: 700, cursor: "pointer", textDecoration: "none", fontSize: 13 },
  backLink: { display: "inline-block", marginTop: 22, color: "#91a6bc", textDecoration: "none", fontSize: 13 },
  error: { margin: 0, padding: "12px 14px", borderRadius: 12, background: "rgba(255,88,88,.12)", color: "#ffaaaa", fontSize: 13 },
  adminPage: { minHeight: "100vh", background: "#07111e", color: "#fff" },
  topbar: { minHeight: 76, padding: "12px clamp(18px, 4vw, 56px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, borderBottom: "1px solid rgba(255,255,255,.08)", background: "rgba(7,17,30,.96)", position: "sticky", top: 0, zIndex: 20, backdropFilter: "blur(18px)" },
  brandWrap: { display: "flex", alignItems: "center", gap: 14 },
  brandLogo: { width: 70, height: "auto" },
  topbarSmall: { display: "block", color: "#70869b", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" },
  topbarTitle: { display: "block", marginTop: 2, fontSize: 16 },
  topbarActions: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  shell: { width: "min(1400px, calc(100% - 32px))", margin: "0 auto", padding: "44px 0 70px" },
  headingRow: { display: "flex", justifyContent: "space-between", gap: 28, alignItems: "end", flexWrap: "wrap" },
  pageTitle: { fontSize: "clamp(34px, 5vw, 58px)", lineHeight: 1, margin: 0, maxWidth: 780, fontWeight: 600 },
  pageLead: { maxWidth: 700, margin: "16px 0 0", color: "#8fa5ba", lineHeight: 1.7 },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 34 },
  metricCard: { padding: 22, borderRadius: 18, border: "1px solid rgba(255,255,255,.08)", background: "linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.025))" },
  metricLabel: { color: "#8298ad", textTransform: "uppercase", letterSpacing: ".12em", fontSize: 10 },
  metricValue: { display: "block", marginTop: 8, fontSize: 32 },
  alertSuccess: { marginTop: 20, padding: "13px 16px", borderRadius: 12, background: "rgba(58,196,132,.12)", color: "#85e3b9", border: "1px solid rgba(58,196,132,.2)" },
  alertError: { marginTop: 20, padding: "13px 16px", borderRadius: 12, background: "rgba(255,88,88,.12)", color: "#ffaaaa", border: "1px solid rgba(255,88,88,.2)" },
  categoriesPanel: { marginTop: 30, padding: "clamp(20px, 3vw, 30px)", borderRadius: 24, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.025)" },
  sectionTop: { display: "flex", justifyContent: "space-between", gap: 18, alignItems: "end", flexWrap: "wrap" },
  panelTitle: { margin: 0, fontSize: 26 },
  categoryForm: { display: "grid", gap: 16, marginTop: 22, padding: 22, borderRadius: 18, border: "1px solid rgba(85,166,255,.2)", background: "#0a1a2b" },
  categoryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 22 },
  categoryCard: { display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 18, padding: 20, borderRadius: 18, border: "1px solid rgba(255,255,255,.08)", background: "#0a1827" },
  categoryMeta: { color: "#69adf3", textTransform: "uppercase", letterSpacing: ".1em", fontSize: 10 },
  categoryName: { margin: "7px 0 5px", fontSize: 21 },
  categoryDescription: { margin: 0, color: "#8499ad", lineHeight: 1.55, fontSize: 13 },
  toolbar: { marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" },
  searchInput: { flex: "1 1 320px", minWidth: 0, border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, background: "#0b1b2d", color: "#fff", padding: "13px 15px", outline: "none" },
  formPanel: { marginTop: 28, padding: "clamp(22px, 4vw, 34px)", borderRadius: 24, border: "1px solid rgba(85,166,255,.22)", background: "linear-gradient(145deg, rgba(15,38,62,.95), rgba(8,23,39,.98))" },
  formHeading: { display: "flex", justifyContent: "space-between", gap: 20, alignItems: "start" },
  formTitle: { margin: 0, fontSize: 28 },
  closeButton: { border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "#fff", width: 42, height: 42, borderRadius: 12, cursor: "pointer", fontSize: 24 },
  productForm: { display: "grid", gap: 18, marginTop: 24 },
  twoColumns: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 },
  checkboxLabel: { display: "flex", gap: 10, alignItems: "center", color: "#cbd7e4", fontSize: 14 },
  uploadBox: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", padding: 18, borderRadius: 16, border: "1px dashed rgba(127,191,255,.35)", background: "rgba(53,122,190,.08)" },
  uploadTitle: { margin: 0, fontWeight: 800, color: "#fff" },
  uploadText: { margin: "5px 0 0", color: "#8fa5ba", fontSize: 13 },
  uploadButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "12px 16px", borderRadius: 12, background: "#2a75bd", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 13 },
  hiddenInput: { display: "none" },
  previewWrap: { position: "relative", width: 180, height: 180, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.1)", background: "#081522" },
  previewImage: { width: "100%", height: "100%", objectFit: "cover" },
  previewBadge: { position: "absolute", left: 10, bottom: 10, padding: "6px 8px", borderRadius: 999, background: "rgba(42,181,116,.92)", color: "#fff", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" },
  formActions: { display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" },
  productsPanel: { marginTop: 32, padding: "clamp(20px, 3vw, 30px)", borderRadius: 24, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.025)" },
  productGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18, marginTop: 22 },
  productCard: { overflow: "hidden", borderRadius: 20, border: "1px solid rgba(255,255,255,.08)", background: "#0a1827" },
  imageFrame: { position: "relative", height: 220, background: "#081522", overflow: "hidden" },
  productImage: { width: "100%", height: "100%", objectFit: "cover" },
  statusBadge: { position: "absolute", top: 12, right: 12, padding: "7px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" },
  statusAvailable: { background: "rgba(42,181,116,.9)", color: "#fff" },
  statusUnavailable: { background: "rgba(157,74,74,.92)", color: "#fff" },
  productBody: { padding: 18 },
  productCategory: { color: "#69adf3", textTransform: "uppercase", letterSpacing: ".1em", fontSize: 10 },
  productName: { margin: "7px 0 2px", fontSize: 21 },
  productBrand: { margin: 0, color: "#8499ad", fontSize: 13 },
  productPrice: { display: "block", marginTop: 13, fontSize: 21 },
  stockText: { margin: "7px 0 0", color: "#7d91a5", fontSize: 12 },
  cardActions: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 },
  editButton: { border: 0, borderRadius: 11, padding: "10px 13px", background: "#2a75bd", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 12 },
  deleteButton: { border: "1px solid rgba(255,90,90,.2)", borderRadius: 11, padding: "10px 13px", background: "rgba(255,90,90,.08)", color: "#ff9a9a", fontWeight: 800, cursor: "pointer", fontSize: 12 },
  empty: { padding: "36px 0", color: "#7f94a8", textAlign: "center" },
};
