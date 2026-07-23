import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const userName =
    document.getElementById("userName");

const daysTogether =
    document.getElementById("daysTogether");

const connectionBar =
    document.getElementById("connectionBar");

const connectionValue =
    document.getElementById("connectionValue");

const relationshipBar =
    document.getElementById("relationshipBar");

const relationshipValue =
    document.getElementById("relationshipValue");

const partnerCard =
    document.getElementById("partnerCard");

const missYouBtn =
    document.getElementById("missYouBtn");

const missYouStatus =
    document.getElementById("missYouStatus");

const dailyStatusCard =
    document.getElementById("dailyStatusCard");

const dailyStatusText =
    document.getElementById("dailyStatusText");

const dailyStatusBtn =
    document.getElementById("dailyStatusBtn");

const receivedMessageCard =
    document.getElementById("receivedMessageCard");

const receivedMessageText =
    document.getElementById("receivedMessageText");

const markMessageReadBtn =
    document.getElementById("markMessageReadBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


let currentUser = null;
let currentUserData = null;
let currentReceivedMessageId = null;


function getLocalDateKey() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function calcularDiasJuntos(fechaNoviazgo) {

    if (!fechaNoviazgo) {

        return null;

    }

    let fechaInicio;


    if (typeof fechaNoviazgo === "string") {

        fechaInicio = new Date(
            `${fechaNoviazgo}T00:00:00`
        );

    } else if (
        typeof fechaNoviazgo === "object" &&
        typeof fechaNoviazgo.toDate === "function"
    ) {

        fechaInicio =
            fechaNoviazgo.toDate();

    } else {

        return null;

    }


    if (Number.isNaN(fechaInicio.getTime())) {

        return null;

    }


    const hoy = new Date();

    fechaInicio.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);


    const diferencia =
        hoy.getTime() -
        fechaInicio.getTime();

    const milisegundosPorDia =
        1000 * 60 * 60 * 24;


    const dias = Math.floor(
        diferencia /
        milisegundosPorDia
    );


    return Math.max(dias, 0);

}

function actualizarBarra(
    barra,
    texto,
    valor
) {

    const valorSeguro = Math.min(
        Math.max(Number(valor) || 0, 0),
        100
    );

    barra.style.width =
        `${valorSeguro}%`;

    texto.textContent =
        `${valorSeguro}%`;

}


function limpiarIndicadores() {

    connectionBar.style.width = "0%";
    connectionValue.textContent = "--%";

    relationshipBar.style.width = "0%";
    relationshipValue.textContent = "--%";

}


function calcularIndiceConexion(registro) {

    const amor =
        Number(registro.love || 0);

    const felicidad =
        Number(registro.happiness || 0);

    const ganas =
        Number(registro.togetherDesire || 0);

    const tristeza =
        Number(registro.sadness || 0);

    const enojo =
        Number(registro.anger || 0);

    const estres =
        Number(registro.stress || 0);


    const equilibrioTristeza =
        100 - tristeza;

    const equilibrioEnojo =
        100 - enojo;

    const equilibrioEstres =
        100 - estres;


    const total =
        amor +
        felicidad +
        ganas +
        equilibrioTristeza +
        equilibrioEnojo +
        equilibrioEstres;


    const indice =
        Math.round(total / 6);


    return Math.min(
        Math.max(indice, 0),
        100
    );

}


async function cargarDatosUsuario(user) {

    const referenciaUsuario = doc(
        db,
        "users",
        user.uid
    );

    const documentoUsuario =
        await getDoc(referenciaUsuario);


    if (!documentoUsuario.exists()) {

        currentUserData = {

            displayName:
                user.email?.split("@")[0] ||
                "Usuario",

            partnerId: null,

            partnerName: null,

            datingDate: null,

            linked: false

        };

        return;

    }


    currentUserData =
        documentoUsuario.data();

}


function mostrarPareja(userData) {

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
                Ya pueden compartir emociones,
                mensajes y registros diarios.
            </p>

        `;

        missYouBtn.disabled = false;

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

    missYouBtn.disabled = true;

}


async function cargarRegistroDeHoy() {

    const fecha = getLocalDateKey();

    const registroId =
        `${currentUser.uid}_${fecha}`;

    const referenciaRegistro = doc(
        db,
        "dailyRecords",
        registroId
    );

    const documentoRegistro =
        await getDoc(referenciaRegistro);


    if (!documentoRegistro.exists()) {

        limpiarIndicadores();

        dailyStatusText.textContent =
            "Todavía no has completado tu registro de hoy.";

        dailyStatusBtn.hidden = false;

        return null;

    }


    const registro =
        documentoRegistro.data();


    const indice =
        calcularIndiceConexion(registro);

    actualizarBarra(
        connectionBar,
        connectionValue,
        indice
    );

    actualizarBarra(
        relationshipBar,
        relationshipValue,
        registro.togetherDesire
    );


    dailyStatusText.textContent =
        "Ya completaste tu registro de hoy ❤️";

    dailyStatusBtn.hidden = true;


    return registro;

}


async function verificarRegistroPareja() {

    if (!currentUserData?.partnerId) {

        return;

    }


    const fecha = getLocalDateKey();

    const registroParejaId =
        `${currentUserData.partnerId}_${fecha}`;

    const referenciaRegistroPareja = doc(
        db,
        "dailyRecords",
        registroParejaId
    );

    const documentoRegistroPareja =
        await getDoc(referenciaRegistroPareja);


    if (documentoRegistroPareja.exists()) {

        dailyStatusText.textContent +=
            " Tu pareja también completó el suyo 💞";

    } else {

        dailyStatusText.textContent +=
            " Tu pareja todavía no ha respondido.";

    }

}


async function enviarTeExtrano() {

    if (
        !currentUser ||
        !currentUserData?.partnerId
    ) {

        missYouStatus.textContent =
            "Primero debes vincular una pareja.";

        missYouStatus.className =
            "miss-you-status error";

        return;

    }


    try {

        missYouBtn.disabled = true;

        missYouBtn.textContent =
            "Enviando...";


        const relationshipId = [
            currentUser.uid,
            currentUserData.partnerId
        ]
            .sort()
            .join("_");


        await addDoc(
            collection(
                db,
                "missYouMessages"
            ),
            {

                senderId:
                    currentUser.uid,

                senderName:
                    currentUserData.displayName ||
                    currentUser.email?.split("@")[0] ||
                    "Tu pareja",

                receiverId:
                    currentUserData.partnerId,

                relationshipId,

                message:
                    "Te extraño 💌",

                read: false,

                createdAt:
                    serverTimestamp()

            }
        );


        missYouStatus.textContent =
            "Mensaje enviado a tu pareja 💌";

        missYouStatus.className =
            "miss-you-status success";

        missYouBtn.textContent =
            "💌 Enviado";


        setTimeout(() => {

            missYouBtn.disabled = false;

            missYouBtn.textContent =
                "💌 Te extraño";

            missYouStatus.textContent = "";

            missYouStatus.className =
                "miss-you-status";

        }, 3000);

    } catch (error) {

        console.error(
            "Error al enviar Te extraño:",
            error
        );

        missYouStatus.textContent =
            "No se pudo enviar el mensaje.";

        missYouStatus.className =
            "miss-you-status error";

        missYouBtn.disabled = false;

        missYouBtn.textContent =
            "💌 Te extraño";

    }

}


async function cargarMensajeRecibido() {

    try {

        const mensajesQuery = query(
            collection(
                db,
                "missYouMessages"
            ),
            where(
                "receiverId",
                "==",
                currentUser.uid
            ),
            where(
                "read",
                "==",
                false
            ),
            orderBy(
                "createdAt",
                "desc"
            ),
            limit(1)
        );


        const mensajesSnapshot =
            await getDocs(mensajesQuery);


        if (mensajesSnapshot.empty) {

            receivedMessageCard.hidden = true;

            currentReceivedMessageId = null;

            return;

        }


        const mensajeDocumento =
            mensajesSnapshot.docs[0];

        const mensaje =
            mensajeDocumento.data();


        currentReceivedMessageId =
            mensajeDocumento.id;


        receivedMessageText.textContent =
            `${mensaje.senderName || "Tu pareja"} te extraña 💌`;

        receivedMessageCard.hidden = false;

    } catch (error) {

        console.error(
            "Error al cargar mensajes recibidos:",
            error
        );

        /*
            Esta consulta puede solicitar
            crear un índice en Firestore.
        */

    }

}


async function marcarMensajeComoVisto() {

    if (!currentReceivedMessageId) {

        return;

    }


    try {

        markMessageReadBtn.disabled = true;

        markMessageReadBtn.textContent =
            "Guardando...";


        const referenciaMensaje = doc(
            db,
            "missYouMessages",
            currentReceivedMessageId
        );


        await updateDoc(
            referenciaMensaje,
            {
                read: true,
                readAt: serverTimestamp()
            }
        );


        receivedMessageCard.hidden = true;

        currentReceivedMessageId = null;

        markMessageReadBtn.disabled = false;

        markMessageReadBtn.textContent =
            "Marcar como visto";

    } catch (error) {

        console.error(
            "Error al marcar mensaje como visto:",
            error
        );

        markMessageReadBtn.disabled = false;

        markMessageReadBtn.textContent =
            "Marcar como visto";

    }

}


async function cargarDashboard(user) {

    await cargarDatosUsuario(user);


    userName.textContent =
        currentUserData.displayName ||
        user.email?.split("@")[0] ||
        "Usuario";


    const dias =
        calcularDiasJuntos(
            currentUserData.datingDate
        );


    daysTogether.textContent =
        dias === null
            ? "--"
            : dias;


    mostrarPareja(
        currentUserData
    );


    await cargarRegistroDeHoy();

    await verificarRegistroPareja();

    await cargarMensajeRecibido();

}


onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        currentUser = user;


        try {

            await cargarDashboard(user);

        } catch (error) {

            console.error(
                "Error al cargar dashboard:",
                error
            );

            userName.textContent =
                user.email?.split("@")[0] ||
                "Usuario";

            daysTogether.textContent = "--";

            limpiarIndicadores();

            dailyStatusText.textContent =
                "No se pudo cargar la información.";

        }

    }
);



missYouBtn.addEventListener(
    "click",
    enviarTeExtrano
);


markMessageReadBtn.addEventListener(
    "click",
    marcarMensajeComoVisto
);


logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            window.location.href =
                "login.html";

        } catch (error) {

            console.error(
                "Error al cerrar sesión:",
                error
            );

            alert(
                "No se pudo cerrar la sesión."
            );

        }

    }
);
