// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDiO3KC_aahKuPOJc6Pr_HnpxrLmHiKMiQ",
    authDomain: "agroauth2.firebaseapp.com",
    projectId: "agroauth2",
    storageBucket: "agroauth2.firebasestorage.app",
    messagingSenderId: "480388623648",
    appId: "1:480388623648:web:8353fab9e746f7beb17b45",
    measurementId: "G-09T502G0MF"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {

    const cadastrar = document.getElementById('cadastro');
    const sair = document.getElementById('logout');
    const areaLoginCad = document.querySelector('.login-cadastro');
    const btnLogin = document.getElementById("login-google");
    const botaoEntrar = document.getElementById("login");

    const statusloginManual = localStorage.getItem('UsuarioLogado');

    // Função para atualizar interface de login
    function atualizarInterface(user) {
        if (user || statusloginManual === '1') {
            // Usuário logado
            cadastrar.style.display = 'none';
            sair.style.display = 'block';
            botaoEntrar.style.display = 'none';
            areaLoginCad.style.width = '10%';
        } else {
            // Nenhum usuário logado
            cadastrar.style.display = 'block';
            sair.style.display = 'none';
            botaoEntrar.style.display = 'block';
            areaLoginCad.style.width = '';
        }
    }

    // Login Google
    if (btnLogin) {
        btnLogin.addEventListener("click", () => {
            signInWithPopup(auth, provider)
                .then(result => {
                    console.log("Usuário logado:", result.user.displayName);
                    window.location.href = '/AgroAnalyst-VersaoFinal/index.html';
                })
                .catch(error => {
                    console.error("Erro no login:", error);
                    alert("Erro ao tentar logar, tente novamente.");
                });
        });
    }

    // Logout
    if (sair) {
        sair.addEventListener("click", () => {
            // Logout manual
            localStorage.setItem('UsuarioLogado', '0');

            // Logout Firebase (se estiver logado)
            signOut(auth).catch(err => console.warn(err));

            window.location.reload();
        });
    }

    // Atualiza interface imediatamente baseado no login manual
    atualizarInterface(null);

    // Observa login do Firebase
    onAuthStateChanged(auth, user => {
        atualizarInterface(user);
    });

});
