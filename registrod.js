import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const dailyForm = document.getElementById("dailyForm");
const dailyDate = document.getElementById("dailyDate");

const dailyMessage = document.getElementById("dailyMessage");
const messageCounter = document.getElementById("messageCounter");

const saveDailyBtn = document.getElementById("saveDailyBtn");
const dailyMessageResult = document.getElementById("dailyMessageResult");


const emotionFields = [
    {
        inputId: "love",
        valueId: "loveValue"
    },
    {
        inputId: "happiness",
        valueId: "happinessValue"
    },
    {
        inputId: "sadness",
        valueId: "sadnessValue"
    },
    {
        inputId: "anger",
        valueId: "angerValue"
    },
    {
        inputId: "stress",
        valueId: "stressValue"
    },
    {
        inputId: "togetherDesire",
        valueId: "togetherDesireValue"
    }
];


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


function showCurrentDate() {

    const today = new Date();

    const formattedDate = today.toLocaleDateString(
        "es-DO",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

    dailyDate.textContent =
        formattedDate.charAt(0).toUpperCase() +
        formattedDate.slice(1);

}


function showMessage(message, type = "error") {

    dailyMessageResult.textContent = message;
    dailyMessageResult.className = `form-message ${type}`;

}


function clearMessage() {

    dailyMessageResult.textContent = "";
    dailyMessageResult.className = "form-message";

}


function setFormDisabled(disabled) {

    const controls = dailyForm.querySelectorAll(
        "input, textarea, button"
    );

    controls.forEach((control) => {

        control.disabled = disabled;

    });

}


emotionFields.forEach((field) => {

    const input = document.getElementById(
        field.inputId
    );

    const value = document.getElementById(
        field.valueId
    );

    if (!input || !value) {

        console.error(
            `No se encontró ${field.inputId} o ${field.valueId}`
        );

        return;

    }

    value.textContent = `${input.value}%`;

    input.addEventListener("input", () => {

        value.textContent = `${input.value}%`;

    });

});


dailyMessage.addEventListener("input", () => {

    const currentLength = dailyMessage.value.length;

    messageCounter.textContent =
        `${currentLength}/500`;

});



function getFormData() {

    return {

        love: Number(
            document.getElementById("love").value
        ),

        happiness: Number(
            document.getElementById("happiness").value
        ),

        sadness: Number(
            document.getElementById("sadness").value
        ),

        anger: Number(
            document.getElementById("anger").value
        ),

        stress: Number(
            document.getElementById("stress").value
        ),

        togetherDesire: Number(
            document.getElementById(
                "togetherDesire"
            ).value
        ),

        message: dailyMessage.value.trim()

    };

}


function validateFormData(data) {

    const values = [
        data.love,
        data.happiness,
        data.sadness,
        data.anger,
        data.stress,
        data.togetherDesire
    ];

    const hasInvalidValue = values.some(
        (value) =>
            Number.isNaN(value) ||
            value < 0 ||
            value > 100
    );

    if (hasInvalidValue) {

        return false;

    }

    if (data.message.length > 500) {

        return false;

    }

    return true;

}


function getRelationshipId(userId, partnerId) {

    if (!partnerId) {

        return null;

    }

    return [userId, partnerId]
        .sort()
        .join("_");

}


async function checkTodayRecord(user) {

    const dateKey = getLocalDateKey();

    const recordId = `${user.uid}_${dateKey}`;

    const recordReference = doc(
        db,
        "dailyRecords",
        recordId
    );

    const recordSnapshot = await getDoc(
        recordReference
    );

    if (!recordSnapshot.exists()) {

        return false;

    }

    const recordData = recordSnapshot.data();

    document.getElementById("love").value =
        recordData.love ?? 50;

    document.getElementById("happiness").value =
        recordData.happiness ?? 50;

    document.getElementById("sadness").value =
        recordData.sadness ?? 50;

    document.getElementById("anger").value =
        recordData.anger ?? 50;

    document.getElementById("stress").value =
        recordData.stress ?? 50;

    document.getElementById(
        "togetherDesire"
    ).value =
        recordData.togetherDesire ?? 50;

    dailyMessage.value =
        recordData.message ?? "";

    emotionFields.forEach((field) => {

        const input = document.getElementById(
            field.inputId
        );

        const value = document.getElementById(
            field.valueId
        );

        value.textContent = `${input.value}%`;

    });

    messageCounter.textContent =
        `${dailyMessage.value.length}/500`;

    showMessage(
        "Ya completaste tu registro de hoy ❤️",
        "success"
    );

    saveDailyBtn.textContent =
        "Registro completado ❤️";

    setFormDisabled(true);

    return true;

}


async function loadUserData(user) {

    const userReference = doc(
        db,
        "users",
        user.uid
    );

    const userSnapshot = await getDoc(
        userReference
    );

    if (!userSnapshot.exists()) {

        currentUserData = {
            email: user.email,
            displayName:
                user.email?.split("@")[0] ||
                "Usuario",
            partnerId: null,
            partnerName: null,
            linked: false
        };

        return;

    }

    currentUserData = userSnapshot.data();

}


showCurrentDate();

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    try {

        saveDailyBtn.disabled = true;

        saveDailyBtn.textContent =
            "Cargando...";

        await loadUserData(user);

        const alreadyRegistered =
            await checkTodayRecord(user);

        if (!alreadyRegistered) {

            saveDailyBtn.disabled = false;

            saveDailyBtn.textContent =
                "Guardar mi registro ❤️";

        }

    } catch (error) {

        console.error(
            "Error al cargar el registro diario:",
            error
        );

        showMessage(
            "No se pudo cargar el registro diario. Revisa tu conexión e inténtalo nuevamente."
        );

        saveDailyBtn.disabled = false;

        saveDailyBtn.textContent =
            "Guardar mi registro ❤️";

    }

});

dailyForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        clearMessage();

        if (!currentUser) {

            showMessage(
                "Debes iniciar sesión para guardar el registro."
            );

            return;

        }

        const formData = getFormData();

        if (!validateFormData(formData)) {

            showMessage(
                "Algunos valores del registro no son válidos."
            );

            return;

        }

        try {

            saveDailyBtn.disabled = true;

            saveDailyBtn.textContent =
                "Guardando...";

            const dateKey = getLocalDateKey();

            const recordId =
                `${currentUser.uid}_${dateKey}`;

            const recordReference = doc(
                db,
                "dailyRecords",
                recordId
            );

            const existingRecord = await getDoc(
                recordReference
            );

            if (existingRecord.exists()) {

                showMessage(
                    "Ya realizaste tu registro de hoy ❤️",
                    "success"
                );

                setFormDisabled(true);

                saveDailyBtn.textContent =
                    "Registro completado ❤️";

                return;

            }

            const partnerId =
                currentUserData?.partnerId || null;

            const relationshipId =
                getRelationshipId(
                    currentUser.uid,
                    partnerId
                );

            const recordData = {

                userId: currentUser.uid,

                userEmail:
                    currentUser.email || "",

                userName:
                    currentUserData?.displayName ||
                    currentUser.email?.split("@")[0] ||
                    "Usuario",

                partnerId,

                relationshipId,

                date: dateKey,

                love: formData.love,

                happiness:
                    formData.happiness,

                sadness:
                    formData.sadness,

                anger:
                    formData.anger,

                stress:
                    formData.stress,

                togetherDesire:
                    formData.togetherDesire,

                message:
                    formData.message,

                createdAt:
                    serverTimestamp()

            };

            await setDoc(
                recordReference,
                recordData
            );

            showMessage(
                "Tu registro de hoy se guardó correctamente ❤️",
                "success"
            );

            saveDailyBtn.textContent =
                "Registro completado ❤️";

            setFormDisabled(true);

            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 1500);

        } catch (error) {

            console.error(
                "Error al guardar el registro:",
                error
            );

            showMessage(
                "No se pudo guardar el registro. Revisa tu conexión o las reglas de Firestore."
            );

            saveDailyBtn.disabled = false;

            saveDailyBtn.textContent =
                "Guardar mi registro ❤️";

        }

    }
);
