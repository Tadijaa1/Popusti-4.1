import { useState, useRef, useEffect } from "react";
import { Routes, Route, Link, useParams, useSearchParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db, saveProduct, unsaveProduct, getSavedProducts, isProductSaved } from "./firebase";
import AuthModal from "./components/AuthModal";
import RecommendedPage from "./RecommendedPage";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC7PdXEdcufuUtFEHqGKwYnA7v4zy1toxA",
  authDomain: "popusti-9db1a.firebaseapp.com",
  projectId: "popusti-9db1a",
  storageBucket: "popusti-9db1a.firebasestorage.app",
  messagingSenderId: "217123418288",
  appId: "1:217123418288:web:3d30d5cd3da03ae1220b75",
  measurementId: "G-QCKJTKRJS1"
};




const categories = ['Sve', 'Alkoholna pića', 'Meso, mesne i riblje prerađevine', 'Voće i Povrće','Bebi svet',
  'Kućni ljubimci', 'Lična higijena i kozmetika', 'Kućna hemija i papirna galanterija',
  'Domaćinstvo i Elektronika','Čaj i kafa','Voda i sokovi','Mlečni proizvodi i jaja',
  'Smrznuti proizvodi','Konzervirano, supe i gotova jela','Pekara, torte i kolači',
  'Slatkiši i grickalice','Zdrava hrana','Namirnice za pripremu jela'];

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Sve')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const handleLogout = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error(err);
  }
};


  const ideaScrollRef = useRef(null)
  const maxiScrollRef = useRef(null)
  const disScrollRef = useRef(null)
  const lidlScrollRef = useRef(null)

  useEffect(() => {
  
    const fetchProducts = async () => {
      setLoading(true);
      try {

        const stores = ["idea", "maxi", "dis", "lidl"];
        let allProducts = [];

        for (const store of stores) {
          const productsCol = collection(db, store);
          const snapshot = await getDocs(productsCol);

          snapshot.forEach(docSnap => {
            const data = docSnap.data();

            if (data[store] && Array.isArray(data[store])) {
              const category = docSnap.id;

              const formatted = data[store].map((item, index) => ({
                id: `${store}-${category}-${index}`,
                name: item.ime,
                oldPrice: item.originalna_cena,
                newPrice: item.popust_cena,
                discount: item.popust,
                image: item.slika_url,
                category: category,
                store: store
              }));

              allProducts = [...allProducts, ...formatted];
            }
          });
        }

        setProducts(allProducts);
        setLoading(false);

      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });

  return () => unsubscribe();
}, []); 

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'Sve' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const ideaProducts = filteredProducts.filter(p => p.store === "idea");
  const maxiProducts = filteredProducts.filter(p => p.store === "maxi");
  const disProducts = filteredProducts.filter(p => p.store === "dis");
  const lidlProducts = filteredProducts.filter(p => p.store === "lidl");

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 400
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Učitavanje proizvoda...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage
          user={user}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          ideaProducts={ideaProducts}
          maxiProducts={maxiProducts}
          disProducts={disProducts}
          lidlProducts={lidlProducts}
          ideaScrollRef={ideaScrollRef}
          maxiScrollRef={maxiScrollRef}
          disScrollRef={disScrollRef}
          lidlScrollRef={lidlScrollRef}
          scroll={scroll}
          isAuthModalOpen={isAuthModalOpen}
          setIsAuthModalOpen={setIsAuthModalOpen}
        />} />
        <Route path="/store/:storeId" element={<StoreProductsPage user={user} />} />
        <Route path="/saved" element={<SavedProductsPage user={user} />} />
        <Route path="/recommended" element={<RecommendedPage user={user} />} />
      </Routes>
    </div>
  )
}

function ProductCard({ product, user, setIsAuthModalOpen, initialSaved = false }) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (user) {
        try {
          const status = await isProductSaved(user.uid, product.id);
          setSaved(status);
        } catch (err) {
          console.error("Greška pri proveri statusa:", err);
        }
      } else {
        setSaved(initialSaved);
      }
    };
    checkSavedStatus();
  }, [user, product.id, initialSaved]);

  const handleSaveClick = async () => {
    if (!user) {
      alert("Moraš da napraviš nalog ili da se prijaviš da bi sačuvao proizvod.");
      setIsAuthModalOpen(true);
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (saved) {
        await unsaveProduct(user.uid, product.id);
      } else {
        await saveProduct(user.uid, product);
      }
      setSaved(!saved);
    } catch (err) {
      console.error("Greška pri čuvanju:", err);
      alert("Došlo je do greške");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-card">
      {product.discount > 0 && (
  <div className="discount-badge">
    -{product.discount}%
  </div>
)}
      <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={handleSaveClick}>
        {saved ? (
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="price-container">
          <span className="old-price">{product.oldPrice} rsd</span>
          {product.newPrice != "None" && (
             <span className="new-price">
               {product.newPrice} rsd
             </span>
           )}
        </div>
      </div>
    </div>
  )
}

function HomePage({
  user,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  ideaProducts,
  maxiProducts,
  disProducts,
  lidlProducts,
  ideaScrollRef,
  maxiScrollRef,
  disScrollRef,
  lidlScrollRef,
  scroll,
  isAuthModalOpen,
  setIsAuthModalOpen
}) {
  

  return (
    <>
      <nav className="top-nav">
       <button
  className="nav-btn"
  onClick={() => setIsAuthModalOpen(true)}
>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>{user ? (user.displayName || user.email.split("@")[0]) : "Profil"}</span>
        </button>
        {user && (
  <Link to="/saved" className="nav-btn">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
    <span>Sačuvano</span>
  </Link>
)}
      </nav>

      <header className="header">
        <div className="header-content">
          <h1 className="title">AKCIJE</h1>
          <p className="subtitle">Najnoviji popusti</p>
        </div>
      </header>

      <div className="search-container">
        <div className="search-bar">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Pretraži proizvode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="filters-container">
        {categories.map(category => (
          <button
            key={category}
            className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* IDEA */}
      <div className="store-section">
        <div className="store-header idea-header">
          <span className="store-icon idea-icon">
            <img src="https://cdn.brandfetch.io/idMspEIa-9/w/857/h/857/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1751696361343" alt="IDEA Logo" width="32" height="32"/>
          </span>
          IDEA
          <Link to={`/store/idea${activeCategory !== 'Sve' ? `?category=${encodeURIComponent(activeCategory)}` : ''}`} className="prikazi-sve">Prikaži sve</Link>
        </div>
        <div className="carousel-container">
          <button className="scroll-btn left" onClick={() => scroll(ideaScrollRef, 'left')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div className="products-carousel" ref={ideaScrollRef}>
            {ideaProducts.length === 0 ? (
              <div className="no-products">Nema proizvoda pronađenih</div>
            ) : (
              ideaProducts.map(product => (
               <ProductCard
  key={product.id}
  product={product}
  user={user}
  setIsAuthModalOpen={setIsAuthModalOpen}
/>
              ))
            )}
          </div>

          <button className="scroll-btn right" onClick={() => scroll(ideaScrollRef, 'right')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* MAXI */}
      <div className="store-section">
        <div className="store-header maxi-header">
         <span className="store-icon maxi-icon">
            <img src="https://images.seeklogo.com/logo-png/48/1/maxi-logo-png_seeklogo-487511.png" alt="MAXI Logo" width="40" height="40"/>
          </span>
          MAXI
          <Link to={`/store/maxi${activeCategory !== 'Sve' ? `?category=${encodeURIComponent(activeCategory)}` : ''}`} className="prikazi-sve">Prikaži sve</Link>
        </div>
        <div className="carousel-container">
          <button className="scroll-btn left" onClick={() => scroll(maxiScrollRef, 'left')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div className="products-carousel" ref={maxiScrollRef}>
            {maxiProducts.length === 0 ? (
              <div className="no-products">Nema proizvoda pronađenih</div>
            ) : (
              maxiProducts.map(product => (
                <ProductCard
  key={product.id}
  product={product}
  user={user}
  setIsAuthModalOpen={setIsAuthModalOpen}
/>
              ))
            )}
          </div>

          <button className="scroll-btn right" onClick={() => scroll(maxiScrollRef, 'right')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Dis */}
      <div className="store-section">
        <div className="store-header dis-header">
          <span className="store-icon dis-icon">
            <img src="https://is3-ssl.mzstatic.com/image/thumb/Purple113/v4/34/00/5e/34005e22-0a29-97cb-cd56-a3904c2dbfcc/source/512x512bb.jpg" alt="Dis Logo" width="40" height="40"/>
          </span>
          Dis
          <Link to={`/store/dis${activeCategory !== 'Sve' ? `?category=${encodeURIComponent(activeCategory)}` : ''}`} className="prikazi-sve">Prikaži sve</Link>
        </div>
        <div className="carousel-container">
          <button className="scroll-btn left" onClick={() => scroll(disScrollRef, 'left')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div className="products-carousel" ref={disScrollRef}>
            {disProducts.length === 0 ? (
              <div className="no-products">Nema proizvoda pronađenih</div>
            ) : (
              disProducts.map(product => (
                <ProductCard
  key={product.id}
  product={product}
  user={user}
  setIsAuthModalOpen={setIsAuthModalOpen}
/>
              ))
            )}
          </div>

          <button className="scroll-btn right" onClick={() => scroll(disScrollRef, 'right')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* LIDL */}
      <div className="store-section">
        <div className="store-header lidl-header">
          <span className="store-icon lidl-icon">
            <img src="https://cdn.freebiesupply.com/logos/large/2x/lidl-logo-png-transparent.png" alt="Lidl Logo" width="38" height="38"/>
          </span>
          Lidl
          <Link to={`/store/lidl${activeCategory !== 'Sve' ? `?category=${encodeURIComponent(activeCategory)}` : ''}`} className="prikazi-sve">Prikaži sve</Link>
        </div>
        <div className="carousel-container">
          <button className="scroll-btn left" onClick={() => scroll(lidlScrollRef, 'left')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div className="products-carousel" ref={lidlScrollRef}>
            {lidlProducts.length === 0 ? (
              <div className="no-products">Nema proizvoda pronađenih</div>
            ) : (
              lidlProducts.map(product => (
                <ProductCard
  key={product.id}
  product={product}
  user={user}
  setIsAuthModalOpen={setIsAuthModalOpen}
/>
              ))
            )}
          </div>

          <button className="scroll-btn right" onClick={() => scroll(lidlScrollRef, 'right')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <AuthModal
  isOpen={isAuthModalOpen}
  onClose={() => setIsAuthModalOpen(false)}
  user={user}
/>
    </>
  )
}

function StoreProductsPage({ user }) {
  const { storeId } = useParams()
  const [searchParams] = useSearchParams()
  const categoryFilter = searchParams.get('category')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const storeNames = {
    idea: 'IDEA',
    maxi: 'MAXI',
    dis: 'Dis',
    lidl: 'Lidl'
  }

  const storeLogos = {
    idea: 'https://cdn.brandfetch.io/idMspEIa-9/w/857/h/857/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1751696361343',
    maxi: 'https://images.seeklogo.com/logo-png/48/1/maxi-logo-png_seeklogo-487511.png',
    dis: 'https://is3-ssl.mzstatic.com/image/thumb/Purple113/v4/34/00/5e/34005e22-0a29-97cb-cd56-a3904c2dbfcc/source/512x512bb.jpg',
    lidl: 'https://cdn.freebiesupply.com/logos/large/2x/lidl-logo-png-transparent.png'
  }

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const productsCol = collection(db, storeId)
        const snapshot = await getDocs(productsCol)
        let allProducts = []

        snapshot.forEach(docSnap => {
          const data = docSnap.data()
          if (data[storeId] && Array.isArray(data[storeId])) {
            const category = docSnap.id
            const formatted = data[storeId].map((item, index) => ({
              id: `${storeId}-${category}-${index}`,
              name: item.ime,
              oldPrice: item.originalna_cena,
              newPrice: item.popust_cena,
              discount: item.popust,
              image: item.slika_url,
              category: category,
              store: storeId
            }))
            allProducts = [...allProducts, ...formatted]
          }
        })

        // Filter by category if provided
        if (categoryFilter) {
          allProducts = allProducts.filter(p => p.category === categoryFilter)
        }

        setProducts(allProducts)

        // Filter by category if specified
        if (categoryFilter) {
          const filtered = allProducts.filter(p => p.category === categoryFilter)
          setProducts(filtered)
        }

        setLoading(false)
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }

    fetchProducts()
  }, [storeId])

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Učitavanje proizvoda...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <nav className="top-nav">
        <Link to="/" className="nav-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span>Nazad</span>
        </Link>
        <button
          className="nav-btn"
          onClick={() => setIsAuthModalOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>{user ? (user.displayName || user.email.split("@")[0]) : "Profil"}</span>
        </button>
      </nav>

      <header className="header store-header-page">
        <div className="header-content">
          <span className="store-icon">
            <img src={storeLogos[storeId]} alt={storeNames[storeId]} width="48" height="48"/>
          </span>
          <h1 className="title">{storeNames[storeId]}</h1>
          <p className="subtitle">{categoryFilter ? `${categoryFilter} - ${products.length} proizvoda` : `${products.length} proizvoda`}</p>
        </div>
      </header>

      <div className="store-products-grid">
        {products.length === 0 ? (
          <div className="no-products">Nema proizvoda pronađenih</div>
        ) : (
          products.map(product => (
          <ProductCard
  key={product.id}
  product={product}
  user={user}
  setIsAuthModalOpen={setIsAuthModalOpen}
/>
          ))
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
      />
    </div>
  )
}

function SavedProductsPage({ user }) {
  const [savedProducts, setSavedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    const fetchSavedProducts = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const products = await getSavedProducts(user.uid)
        setSavedProducts(products)
      } catch (err) {
        console.error("Greška pri učitavanju:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedProducts()
  }, [user])

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Učitavanje...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app">
        <nav className="top-nav">
          <Link to="/" className="nav-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>Nazad</span>
          </Link>
          <button
            className="nav-btn"
            onClick={() => setIsAuthModalOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Profil</span>
          </button>
        </nav>
        <div className="no-products" style={{ padding: "40px", textAlign: "center" }}>
          <p>Moraš da budeš prijavljen da bi video sačuvane proizvode.</p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Prijavi se
          </button>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          user={user}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <nav className="top-nav">
        <Link to="/" className="nav-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span>Nazad</span>
        </Link>
        <button
          className="nav-btn"
          onClick={() => setIsAuthModalOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>{user.displayName || user.email.split("@")[0]}</span>
        </button>
      </nav>

      <header className="header">
        <div className="header-content">
          <h1 className="title">Sačuvano</h1>
          <p className="subtitle">{savedProducts.length} proizvoda</p>
          {/*
          <Link to="/recommended" className="filter-btn" style={{ marginTop: "15px", display: "inline-block" }}>
            Preporučeni popusti
          </Link>
          */}
        </div>
      </header>

      <div className="store-products-grid">
        {savedProducts.length === 0 ? (
          <div className="no-products">Nemaš sačuvanih proizvoda</div>
        ) : (
          savedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              user={user}
              setIsAuthModalOpen={setIsAuthModalOpen}
            />
          ))
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
      />
    </div>
  )
}


export default App
