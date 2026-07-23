import { auth, db } from "./firebase.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const generateBtn = document.getElementById("generateBtn");
const generatedContainer = document.getElementById("generatedContainer");
const generatedCode = document.getElementById("generatedCode");
const copyBtn = document.getElementById("copyBtn");

function generarCodigo() {

    const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let codigo = "BTW-";

    for (let i = 0; i < 5; i++) {

        codigo += caracteres.charAt(
            Math.floor(Math.random() * caracteres.length)
        );

    }

    return codigo;

}

generateBtn.addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) {

        alert("Debes iniciar sesión.");

        return;

    }

    const myName = document.getElementById("myName").value.trim();
    const partnerName = document.getElementById("partnerName").value.trim();
    const datingDate = document.getElementById("datingDate").value;

    if (!myName || !partnerName || !datingDate) {

        alert("Completa todos los campos.");

        return;

    }

    try {


        await setDoc(doc(db, "users", user.uid), {

            email: user.email,

            displayName: myName,

            partnerId: null,

            partnerName: "",

            datingDate: null,

            linked: false,

            createdAt: serverTimestamp()

        }, { merge: true });


        const codigo = generarCodigo();


        await setDoc(doc(db, "inviteCodes", codigo), {

            code: codigo,

            ownerId: user.uid,

            ownerEmail: user.email,

            ownerName: myName,

            partnerName: partnerName,

            datingDate: datingDate,

            used: false,

            createdAt: serverTimestamp()

        });

        generatedCode.textContent = codigo;

        generatedContainer.style.display = "block";

    }

    catch (error) {

        console.error(error);

        alert("Ocurrió un error al generar el código.");

    }

});

copyBtn.addEventListener("click", async () => {

    try {

        await navigator.clipboard.writeText(generatedCode.textContent);

        alert("Código copiado.");

    }

    catch {

        alert("No se pudo copiar el código.");

    }

});
