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

const logoutBtn =
    document.getElementById("logoutBtn");


let currentUser = null;
let currentUserData = null;



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


function calculateDaysTogether(datingDate) {

    if (!datingDate) {

        return null;

    }

    let startDate;


    if (typeof datingDate === "string") {

        startDate = new Date(
            `${datingDate}T00:00:00`
        );

    } else if (
        typeof datingDate === "object" &&
        typeof datingDate.toDate === "function"
    ) {

        startDate = datingDate.toDate();

    } else {

        return null;

    }


    if (Number.isNaN(startDate.getTime())) {

        return null;

    }


    const today = new Date();

    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);


    const difference =
        today.getTime() -
        startDate.getTime();

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    return Math.max(
        Math.floor(
            difference / millisecondsPerDay
        ),
        0
    );

}


function calculateConnectionIndex(record) {

    const love =
        Number(record.love || 0);

    const happiness =
        Number(record.happiness || 0);

    const togetherDesire =
        Number(record.togetherDesire || 0);

    const sadness =
        Number(record.sadness || 0);

    const anger =
        Number(record.anger || 0);

    const stress =
        Number(record.stress || 0);


    /*
        Las emociones positivas conservan
        su valor.

        Las emociones negativas se invierten:

        tristeza 20 = bienestar 80
    */

    const sadnessBalance =
        100 - sadness;

    const angerBalance =
        100 - anger;

    const stressBalance =
        100 - stress;


    const total =
        love +
        happiness +
        togetherDesire +
        sadnessBalance +
        angerBalance +
        stressBalance;


    const connectionIndex =
        Math.round(total / 6);


    return Math.min(
        Math.max(connectionIndex, 0),
        100
    );

}


function updateProgressBar(
    bar,
    textElement,
    value
) {

    const safeValue = Math.min(
        Math.max(Number(value) || 0, 0),
        100
    );

    bar.style.width =
        `${safeValue}%`;

    textElement.textContent =
        `${safeValue}%`;

}


function clearDailyIndicators() {

    connectionBar.style.width = "0%";
    connectionValue.textContent = "--%";

    relationshipBar.style.width = "0%";
    relationshipValue.textContent = "--%";

}


async function loadTodayRecord(userId) {

    const dateKey =
        getLocalDateKey();

    const recordId =
        `${userId}_${dateKey}`;

    const recordReference = doc(
        db,
        "dailyRecords",
        recordId
    );

    const recordSnapshot =
        await getDoc(recordReference);


    if (!recordSnapshot.exists()) {

        clearDailyIndicators();

        return null;

    }


    const record =
        recordSnapshot.data();


    const connectionIndex =
        calculateConnectionIndex(record);

    const togetherDesire =
        Number(record.togetherDesire || 0);


    updateProgressBar(
        connectionBar,
        connectionValue,
        connectionIndex
    );

    updateProgressBar(
        relationshipBar,
        relationshipValue,
        togetherDesire
    );


    return record;

}


function showPartnerInformation(userData) {

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
                Ya pueden compartir sus registros diarios.
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

async function loadUserData(user) {

    const userReference = doc(
        db,
        "users",
        user.uid
    );

    const userSnapshot =
        await getDoc(userReference);


    if (!userSnapshot.exists()) {

        currentUserData = {

            displayName:
                user.email?.split("@")[0] ||
                "Usuario",

            datingDate: null,

            partnerId: null,

            partnerName: null,

            linked: false

        };

        return;

    }


    currentUserData =
        userSnapshot.data();

}


async function loadDashboard(user) {

    await loadUserData(user);


    userName.textContent =
        currentUserData.displayName ||
        user.email?.split("@")[0] ||
        "Usuario";


    const days =
        calculateDaysTogether(
            currentUserData.datingDate
        );


    daysTogether.textContent =
        days === null
            ? "--"
            : days;


    showPartnerInformation(
        currentUserData
    );


    await loadTodayRecord(
        user.uid
    );

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

            await loadDashboard(user);

        } catch (error) {

            console.error(
                "Error al cargar el dashboard:",
                error
            );

            userName.textContent =
                user.email?.split("@")[0] ||
                "Usuario";

            daysTogether.textContent = "--";

            clearDailyIndicators();

        }

    }
);



missYouBtn.addEventListener(
    "click",
    async () => {

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
                "Tu pareja recibirá tu mensaje 💌";

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

            }, 4000);

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

        }

    }
);
