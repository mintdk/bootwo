import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const registerForm = document.getElementById("registerForm");
const registerBtn = document.getElementById("registerBtn");
const registerMessage = document.getElementById("registerMessage");


function mostrarMensaje(mensaje, tipo = "error") {

    registerMessage.textContent = mensaje;
    registerMessage.className = `form-message ${tipo}`;

}


function obtenerMensajeError(errorCode) {

    switch (errorCode) {

        case "auth/email-already-in-use":
            return "Ya existe una cuenta con este correo.";

        case "auth/invalid-email":
            return "El correo electrónico no es válido.";

        case "auth/weak-password":
            return "La contraseña debe tener al menos 6 caracteres.";

        case "auth/missing-password":
            return "Debes escribir una contraseña.";

        case "auth/network-request-failed":
            return "No se pudo conectar. Revisa tu conexión a internet.";

        case "auth/too-many-requests":
            return "Se realizaron demasiados intentos. Inténtalo más tarde.";

        default:
            return "No se pudo crear la cuenta. Inténtalo nuevamente.";

    }

}


registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document
        .getElementById("email")
        .value
        .trim()
        .toLowerCase();

    const password = document
        .getElementById("password")
        .value;

    const confirmPassword = document
        .getElementById("confirmPassword")
        .value;


    mostrarMensaje("", "");


    if (!email || !password || !confirmPassword) {

        mostrarMensaje("Completa todos los campos.");

        return;

    }


    if (password.length < 6) {

        mostrarMensaje(
            "La contraseña debe tener al menos 6 caracteres."
        );

        return;

    }


    if (password !== confirmPassword) {

        mostrarMensaje("Las contraseñas no coinciden.");

        return;

    }


    registerBtn.disabled = true;
    registerBtn.textContent = "Creando cuenta...";


    try {

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;


        await setDoc(doc(db, "users", user.uid), {

            email: user.email,

            displayName: "",

            partnerId: null,

            partnerName: "",

            datingDate: null,

            linked: false,

            photoURL: "",

            createdAt: serverTimestamp()

        });


        mostrarMensaje(
            "Cuenta creada correctamente.",
            "success"
        );


        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 800);

    }

    catch (error) {

        console.error(
            "Error al crear la cuenta:",
            error
        );

        mostrarMensaje(
            obtenerMensajeError(error.code)
        );

    }

    finally {

        registerBtn.disabled = false;
        registerBtn.textContent = "Crear cuenta";

    }

});
