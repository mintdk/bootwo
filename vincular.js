import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const myName = document.getElementById("myName");
const partnerName = document.getElementById("partnerName");
const datingDate = document.getElementById("datingDate");

const generateBtn = document.getElementById("generateBtn");

const generatedContainer = document.getElementById("generatedContainer");
const generatedCode = document.getElementById("generatedCode");
const copyBtn = document.getElementById("copyBtn");

const inviteCode = document.getElementById("inviteCode");
const linkBtn = document.getElementById("linkBtn");

let currentCode = "";


onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.href="login.html";

    }

});


function generateCode(){

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "BTW-";

    for(let i=0;i<5;i++){

        code += chars.charAt(
            Math.floor(Math.random()*chars.length)
        );

    }

    return code;

}


generateBtn.addEventListener("click",()=>{

    if(

        myName.value.trim()==="" ||

        partnerName.value.trim()==="" ||

        datingDate.value===""

    ){

        alert("Completa todos los campos.");

        return;

    }

    currentCode = generateCode();

    generatedCode.textContent = currentCode;

    generatedContainer.style.display="block";

});


copyBtn.addEventListener("click",async()=>{

    try{

        await navigator.clipboard.writeText(currentCode);

        copyBtn.textContent="✅ Código copiado";

        setTimeout(()=>{

            copyBtn.textContent="Copiar código";

        },2000);

    }catch{

        alert("No fue posible copiar el código.");

    }

});


linkBtn.addEventListener("click",()=>{

    alert("En el siguiente paso conectaremos Firebase ❤️");

});
