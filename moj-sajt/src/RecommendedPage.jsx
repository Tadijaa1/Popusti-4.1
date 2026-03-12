function RecommendedPage({ user }) {
  const [allProducts, setAllProducts] = useState([])
  const [recommendedProducts, setRecommendedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const stores = ["idea", "maxi", "dis", "lidl"];
        let productsArray = [];

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
              productsArray = [...productsArray, ...formatted];
            }
          });
        }
        setAllProducts(productsArray);
      } catch (err) {
        console.error("Greska:", err);
      }
    };

    fetchAllProducts();
  }, []);

  useEffect(() => {
    const getRecommendations = async () => {
      if (!user || allProducts.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const saved = await getSavedProducts(user.uid);

        const categories = [...new Set(saved.map(p => p.category))];

        const keywords = [];
        saved.forEach(p => {
          const words = p.name.split(' ').filter(w => w.length > 3);
          keywords.push(...words.slice(0, 2));
        });
        const uniqueKeywords = [...new Set(keywords)];

        const savedIds = new Set(saved.map(p => p.id));
        const recommended = allProducts.filter(p => {
          if (savedIds.has(p.id)) return false;

          const matchesCategory = categories.includes(p.category);
          const matchesKeyword = uniqueKeywords.some(kw =>
            p.name.toLowerCase().includes(kw.toLowerCase())
          );

          return matchesCategory || matchesKeyword;
        });

        setRecommendedProducts(recommended);
      } catch (err) {
        console.error("Greska:", err);
      } finally {
        setLoading(false);
      }
    };

    getRecommendations();
  }, [user, allProducts]);

  if (!user) {
    return (
      <div className="app">
        <nav className="top-nav">
          <Link to="/saved" className="nav-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>Nazad</span>
          </Link>
        </nav>
        <div className="no-products" style={{ padding: "40px", textAlign: "center" }}>
          <p>Moras da budes prijavljen.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app">
        <nav className="top-nav">
          <Link to="/saved" className="nav-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>Nazad</span>
          </Link>
        </nav>
        <div className="loading">Ucitavanje preporuka...</div>
      </div>
    );
  }

  const ideaProducts = recommendedProducts.filter(p => p.store === "idea");
  const maxiProducts = recommendedProducts.filter(p => p.store === "maxi");
  const disProducts = recommendedProducts.filter(p => p.store === "dis");
  const lidlProducts = recommendedProducts.filter(p => p.store === "lidl");

  return (
    <div className="app">
      <nav className="top-nav">
        <Link to="/saved" className="nav-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span>Nazad</span>
        </Link>
        <button className="nav-btn" onClick={() => setIsAuthModalOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>{user.displayName || user.email.split("@")[0]}</span>
        </button>
      </nav>

      <header className="header">
        <div className="header-content">
          <h1 className="title">Preporuceni popusti</h1>
          <p className="subtitle">Na osnovu tvojih sacuvanih proizvoda</p>
        </div>
      </header>

      {recommendedProducts.length === 0 ? (
        <div className="no-products" style={{ padding: "40px", textAlign: "center" }}>
          Nema preporuka. Sacuvaj vise proizvoda!
        </div>
      ) : (
        <>
          {ideaProducts.length > 0 && (
            <div className="store-section">
              <div className="store-header idea-header">
                <span className="store-icon idea-icon">
                  <img src="https://cdn.brandfetch.io/idMspEIa-9/w/857/h/857/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1751696361343" alt="IDEA" width="32" height="32"/>
                </span>
                IDEA ({ideaProducts.length})
              </div>
              <div className="store-products-grid">
                {ideaProducts.map(product => (
                  <ProductCard key={product.id} product={product} user={user} setIsAuthModalOpen={setIsAuthModalOpen} />
                ))}
              </div>
            </div>
          )}

          {maxiProducts.length > 0 && (
            <div className="store-section">
              <div className="store-header maxi-header">
                <span className="store-icon maxi-icon">
                  <img src="https://images.seeklogo.com/logo-png/48/1/maxi-logo-png_seeklogo-487511.png" alt="MAXI" width="40" height="40"/>
                </span>
                MAXI ({maxiProducts.length})
              </div>
              <div className="store-products-grid">
                {maxiProducts.map(product => (
                  <ProductCard key={product.id} product={product} user={user} setIsAuthModalOpen={setIsAuthModalOpen} />
                ))}
              </div>
            </div>
          )}

          {disProducts.length > 0 && (
            <div className="store-section">
              <div className="store-header dis-header">
                <span className="store-icon dis-icon">
                  <img src="https://is3-ssl.mzstatic.com/image/thumb/Purple113/v4/34/00/5e/34005e22-0a29-97cb-cd56-a3904c2dbfcc/source/512x512bb.jpg" alt="Dis" width="40" height="40"/>
                </span>
                Dis ({disProducts.length})
              </div>
              <div className="store-products-grid">
                {disProducts.map(product => (
                  <ProductCard key={product.id} product={product} user={user} setIsAuthModalOpen={setIsAuthModalOpen} />
                ))}
              </div>
            </div>
          )}

          {lidlProducts.length > 0 && (
            <div className="store-section">
              <div className="store-header lidl-header">
                <span className="store-icon lidl-icon">
                  <img src="https://cdn.freebiesupply.com/logos/large/2x/lidl-logo-png-transparent.png" alt="Lidl" width="38" height="38"/>
                </span>
                Lidl ({lidlProducts.length})
              </div>
              <div className="store-products-grid">
                {lidlProducts.map(product => (
                  <ProductCard key={product.id} product={product} user={user} setIsAuthModalOpen={setIsAuthModalOpen} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} user={user} />
    </div>
  );
}

export default RecommendedPage;
