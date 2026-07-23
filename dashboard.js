import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const userName = document.getElementById("userName");
const daysTogether = document.getElementById("daysTogether");
const partnerCard = document.getElementById("partnerCard");
const logoutBtn = document.getElementById("logoutBtn");



function calcularDiasJuntos(fechaNoviazgo) {

    if (!fechaNoviazgo) {

        return null;

    }

    let fechaInicio;



    if (typeof fechaNoviazgo === "string") {

        fechaInicio = new Date(
            `${fechaNoviazgo}T00:00:00`
        );

    }


    else if (
        typeof fechaNoviazgo === "object" &&
        typeof fechaNoviazgo.toDate === "function"
    ) {

        fechaInicio = fechaNoviazgo.toDate();

    }

    else {

        return null;

    }


    if (Number.isNaN(fechaInicio.getTime())) {

        console.error(
            "Fecha de noviazgo inválida:",
            fechaNoviazgo
        );

        return null;

    }


    const hoy = new Date();

    fechaInicio.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);


    const diferenciaEnMilisegundos =
        hoy.getTime() - fechaInicio.getTime();

    const milisegundosPorDia =
        1000 * 60 * 60 * 24;

    const resultado = Math.floor(
        diferenciaEnMilisegundos /
        milisegundosPorDia
    );

    return Math.max(resultado, 0);

}


function mostrarPareja(userData) {

    if (!partnerCard) {

        return;

    }


    if (
        userData.linked === true &&
        userData.partnerId
    ) {

        partnerCard.innerHTML = `

            <h2>
                💞 Pareja
            </h2>

            <p>
                Estás vinculado con
                <strong>
                    ${userData.partnerName || "tu pareja"}
                </strong>
                ❤️
            </p>

            <p>
                Ya pueden comenzar a compartir
                sus emociones y registros diarios.
            </p>

        `;

        return;

    }


    partnerCard.innerHTML = `

        <h2>
            💞 Pareja
        </h2>

        <p>
            Aún no has vinculado una pareja.
        </p>

        <a
            href="vincular.html"
            class="btn-primary">

            Vincular pareja

        </a>

    `;

}


onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }


    try {

        const userReference = doc(
            db,
            "users",
            user.uid
        );

        const userSnapshot = await getDoc(
            userReference
        );



        if (!userSnapshot.exists()) {

            userName.textContent =
                user.email.split("@")[0];

            daysTogether.textContent = "--";

            mostrarPareja({
                linked: false,
                partnerId: null
            });

            return;

        }


        const userData = userSnapshot.data();


        /* Nombre */

        if (userData.displayName) {

            userName.textContent =
                userData.displayName;

        } else {

            userName.textContent =
                user.email.split("@")[0];

        }


        /* Días juntos */

        const dias = calcularDiasJuntos(
            userData.datingDate
        );


        if (dias === null) {

            daysTogether.textContent = "--";

        } else {

            daysTogether.textContent = dias;

        }


        /* Pareja */

        mostrarPareja(userData);


    } catch (error) {

        console.error(
            "Error al cargar el dashboard:",
            error
        );

        userName.textContent =
            user.email.split("@")[0];

        daysTogether.textContent = "--";

    }

});


logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

        window.location.href = "login.html";

    } catch (error) {

        console.error(
            "Error al cerrar sesión:",
            error
        );

        alert(
            "No se pudo cerrar la sesión."
        );

    }

});
