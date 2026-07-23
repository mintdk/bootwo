import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const generateBtn = document.getElementById("generateBtn");
const generatedContainer = document.getElementById("generatedContainer");
const generatedCode = document.getElementById("generatedCode");
const copyBtn = document.getElementById("copyBtn");

const myNameInput = document.getElementById("myName");
const partnerNameInput = document.getElementById("partnerName");
const datingDateInput = document.getElementById("datingDate");

const inviteCodeInput = document.getElementById("inviteCode");
const linkBtn = document.getElementById("linkBtn");


let currentUser = null;



onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;


    try {

        const userReference = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userReference);

        if (!userSnapshot.exists()) {

            await setDoc(userReference, {

                email: user.email,
                displayName: "",
                partnerId: null,
                partnerName: "",
                datingDate: null,
                linked: false,
                createdAt: serverTimestamp()

            });

            return;

        }

        const userData = userSnapshot.data();

        if (userData.partnerId || userData.linked === true) {

            alert("Ya tienes una pareja vinculada.");

            window.location.href = "dashboard.html";

            return;

        }

        if (userData.displayName) {

            myNameInput.value = userData.displayName;

        }

    } catch (error) {

        console.error(
            "Error al comprobar el usuario:",
            error
        );

    }

});


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


async function generarCodigoUnico() {

    let codigo;
    let existe = true;

    while (existe) {

        codigo = generarCodigo();

        const codeReference = doc(
            db,
            "inviteCodes",
            codigo
        );

        const codeSnapshot = await getDoc(codeReference);

        existe = codeSnapshot.exists();

    }

    return codigo;

}



generateBtn.addEventListener("click", async () => {

    if (!currentUser) {

        alert("Debes iniciar sesión.");

        return;

    }

    const myName = myNameInput.value.trim();
    const partnerName = partnerNameInput.value.trim();
    const datingDate = datingDateInput.value;


    if (!myName || !partnerName || !datingDate) {

        alert("Completa todos los campos.");

        return;

    }


    if (
        myName.toLowerCase() ===
        partnerName.toLowerCase()
    ) {

        alert(
            "Tu nombre y el de tu pareja deben ser diferentes."
        );

        return;

    }


    generateBtn.disabled = true;
    generateBtn.textContent = "Generando...";


    try {

        const userReference = doc(
            db,
            "users",
            currentUser.uid
        );

        const userSnapshot = await getDoc(userReference);

        if (
            userSnapshot.exists() &&
            userSnapshot.data().partnerId
        ) {

            alert("Ya tienes una pareja vinculada.");

            window.location.href = "dashboard.html";

            return;

        }


        const codigo = await generarCodigoUnico();


        await setDoc(
            userReference,
            {
                email: currentUser.email,

                displayName: myName,

                partnerId: null,

                partnerName: partnerName,

                datingDate: datingDate,

                linked: false,

                updatedAt: serverTimestamp()
            },
            {
                merge: true
            }
        );


        await setDoc(
            doc(db, "inviteCodes", codigo),
            {
                code: codigo,

                ownerId: currentUser.uid,

                ownerEmail: currentUser.email,

                ownerName: myName,

                partnerName: partnerName,

                datingDate: datingDate,

                used: false,

                usedBy: null,

                createdAt: serverTimestamp()
            }
        );


        generatedCode.textContent = codigo;

        generatedContainer.style.display = "block";

        alert("Código generado correctamente.");

    } catch (error) {

        console.error(
            "Error al generar el código:",
            error
        );

        alert(
            "No se pudo generar el código. Revisa la consola."
        );

    } finally {

        generateBtn.disabled = false;
        generateBtn.textContent = "Generar código";

    }

});



copyBtn.addEventListener("click", async () => {

    const codigo = generatedCode.textContent.trim();

    if (
        !codigo ||
        codigo === "ABCD1234"
    ) {

        alert("Primero genera un código.");

        return;

    }


    try {

        await navigator.clipboard.writeText(codigo);

        alert("Código copiado.");

    } catch (error) {

        console.error(
            "Error al copiar:",
            error
        );

        alert("No se pudo copiar el código.");

    }

});



linkBtn.addEventListener("click", async () => {

    if (!currentUser) {

        alert("Debes iniciar sesión.");

        return;

    }


    const codigo = inviteCodeInput.value
        .trim()
        .toUpperCase();


    if (!codigo) {

        alert("Escribe el código de invitación.");

        return;

    }


    if (!codigo.startsWith("BTW-")) {

        alert(
            "El código debe tener un formato como BTW-8X4K9."
        );

        return;

    }


    linkBtn.disabled = true;
    linkBtn.textContent = "Vinculando...";


    try {

        const codeReference = doc(
            db,
            "inviteCodes",
            codigo
        );

        const currentUserReference = doc(
            db,
            "users",
            currentUser.uid
        );


        await runTransaction(db, async (transaction) => {

            const codeSnapshot =
                await transaction.get(codeReference);

            const currentUserSnapshot =
                await transaction.get(currentUserReference);


            if (!codeSnapshot.exists()) {

                throw new Error("CODE_NOT_FOUND");

            }


            const codeData = codeSnapshot.data();


            if (codeData.used === true) {

                throw new Error("CODE_ALREADY_USED");

            }


            if (codeData.ownerId === currentUser.uid) {

                throw new Error("OWN_CODE");

            }


            if (
                currentUserSnapshot.exists() &&
                currentUserSnapshot.data().partnerId
            ) {

                throw new Error("USER_ALREADY_LINKED");

            }


            const ownerReference = doc(
                db,
                "users",
                codeData.ownerId
            );

            const ownerSnapshot =
                await transaction.get(ownerReference);


            if (!ownerSnapshot.exists()) {

                throw new Error("OWNER_NOT_FOUND");

            }


            const ownerData = ownerSnapshot.data();


            if (ownerData.partnerId) {

                throw new Error("OWNER_ALREADY_LINKED");

            }


            const currentDisplayName =
                currentUserSnapshot.exists() &&
                currentUserSnapshot.data().displayName
                    ? currentUserSnapshot.data().displayName
                    : codeData.partnerName;


            transaction.set(
                currentUserReference,
                {
                    email: currentUser.email,

                    displayName: currentDisplayName,

                    partnerId: codeData.ownerId,

                    partnerName: codeData.ownerName,

                    datingDate: codeData.datingDate,

                    linked: true,

                    linkedAt: serverTimestamp()
                },
                {
                    merge: true
                }
            );


            transaction.set(
                ownerReference,
                {
                    partnerId: currentUser.uid,

                    partnerName: currentDisplayName,

                    datingDate: codeData.datingDate,

                    linked: true,

                    linkedAt: serverTimestamp()
                },
                {
                    merge: true
                }
            );


            transaction.update(
                codeReference,
                {
                    used: true,

                    usedBy: currentUser.uid,

                    usedAt: serverTimestamp()
                }
            );

        });


        alert("¡Pareja vinculada correctamente! ❤️");

        window.location.href = "dashboard.html";

    } catch (error) {

        console.error(
            "Error al vincular pareja:",
            error
        );


        switch (error.message) {

            case "CODE_NOT_FOUND":

                alert("El código no existe.");

                break;

            case "CODE_ALREADY_USED":

                alert("Este código ya fue utilizado.");

                break;

            case "OWN_CODE":

                alert(
                    "No puedes vincularte usando tu propio código."
                );

                break;

            case "USER_ALREADY_LINKED":

                alert("Ya tienes una pareja vinculada.");

                break;

            case "OWNER_ALREADY_LINKED":

                alert(
                    "La persona que creó este código ya está vinculada."
                );

                break;

            case "OWNER_NOT_FOUND":

                alert(
                    "No se encontró la cuenta que creó el código."
                );

                break;

            default:

                alert(
                    "No se pudo vincular la pareja. Revisa la consola."
                );

        }

    } finally {

        linkBtn.disabled = false;
        linkBtn.textContent = "Vincular pareja";

    }

});
