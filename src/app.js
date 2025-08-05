import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDYPQdPV0BD3c5C1MwJTDhlGKzKL5hYePg",
    authDomain: "authenticating-c76ff.firebaseapp.com",
    projectId: "authenticating-c76ff",
    storageBucket: "authenticating-c76ff.appspot.com",
    messagingSenderId: "966955661775",
    appId: "1:966955661775:web:97b38da7b76f58b0ce3aba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ========== Signup Function ==========
if (document.getElementById('signup-btn')) {
    document.getElementById('signup-btn').addEventListener('click', async () => {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        if (!name || !email || !password) {
            alert("Please fill all fields!");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Account created successfully! Please login.");
            window.location.href = "public/login.html";
        } catch (error) {
            alert(error.message);
        }
    });
}

// ========== Login Function ==========
if (document.getElementById('login-btn')) {
    document.getElementById('login-btn').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "dashboard.html";
        } catch (error) {
            alert(error.message);
        }
    });
}

// ========== Logout Function ==========
if (document.getElementById('logout-btn')) {
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = "../public/login.html";
        } catch (error) {
            alert(error.message);
        }
    });
}

// ========== Product Management ==========
if (document.getElementById('show-form-btn')) {
    const productForm = document.getElementById('product-form');
    const showFormBtn = document.getElementById('show-form-btn');

    showFormBtn.addEventListener('click', () => {
        productForm.style.display = productForm.style.display === 'none' ? 'block' : 'none';
    });

    // ========== Save Product with Image URL ==========
    document.getElementById('save-product-btn').addEventListener('click', async () => {
        const name = document.getElementById('product-name').value;
        const description = document.getElementById('product-description').value;
        const price = document.getElementById('product-price').value;
        const imageUrl = document.getElementById('product-image-url').value;

        if (!name || !description || !price || !imageUrl) {
            alert("Please fill all fields including Image URL!");
            return;
        }

        try {
            await addDoc(collection(db, "products"), {
                name,
                description,
                price: parseFloat(price),
                imageUrl,
                userId: auth.currentUser.uid,
                createdAt: new Date()
            });
            alert("Product added successfully!");
            productForm.style.display = 'none';
            fetchProducts();
        } catch (error) {
            alert("Error: " + error.message);
        }
    });
}

// ========== Fetch Products with Image ==========
async function fetchProducts() {
    if (!auth.currentUser) return;

    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = "";

    try {
        const q = query(collection(db, "products"), where("userId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
            const product = doc.data();
            productsGrid.innerHTML += `
                <div class="product-card">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p>Price: $${product.price}</p>
                    <button onclick="deleteProduct('${doc.id}')">Delete</button>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error fetching products: ", error);
    }
}

// ========== Delete Product Function ==========
window.deleteProduct = async (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
        try {
            await deleteDoc(doc(db, "products", productId));
            fetchProducts();
        } catch (error) {
            alert("Error deleting product: " + error.message);
        }
    }
};

// ========== Auth State Listener ==========
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in
        if (window.location.pathname.endsWith("login.html") || 
            window.location.pathname.endsWith("signup.html")) {
            window.location.href = "dashboard.html";
        }
        fetchProducts();
    } else {
        // User is logged out
        if (window.location.pathname.endsWith("dashboard.html")) {
            window.location.href = "../public/login.html";
        }
    }
});