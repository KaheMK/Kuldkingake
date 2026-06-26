// =========================================================================
// KULDKINGAKESE INFOSÜSTEEMI KÄSIRAAMAT & JUHEND (manual.js)
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Luuakse käsiraamatu HTML struktuur dünaamiliselt, et hoida index.html puhas
    looKäsiraamatuStruktuur();

    // 2. Seotakse sündmused (Event Listenerid)
    seostaJuhendiSündmused();
});

// SIIN SAAD TEKSTE JA PEATÜKKE JÄRELE TOIMETADA / MUUTA
function looKäsiraamatuStruktuur() {
    const modalHTML = `
    <div id="käsiraamat-modal" class="käsiraamat-peidus">
        <div class="käsiraamat-sisu">
            <div class="käsiraamat-päis">
                <h2>🌲 Kuldkingakese Infosüsteemi Käsiraamat</h2>
                <button id="sulge-käsiraamat">&times;</button>
            </div>
            
            <div class="käsiraamat-keha">
                <!-- NULLOSA: MISSIOON JA EESMÄRK -->
                <section style="background: rgba(191, 149, 63, 0.05); padding: 15px; border-radius: 6px; border-left: 4px solid #bf953f;">
                    <h3>0. Projekti eesmärk ja missioon</h3>
                    <p><strong>Milleks see projekt on loodud?</strong> Meie eesmärk on kaasata inimesi, õpilasi ja loodushuvilisi aktiivsemalt looduse vaatlemisse – eriti aga ohustatud liikide (nagu Kuldking) käekäigu ja edenemise jälgimisse. See on tööriist, mis toob kasu kõigile ja ühendab harrastusteaduse professionaalse looduskaitsega.</p>
                    <p><strong>Kasu kõigile – Sinu isiklik märkmik:</strong> Igal uudistajal ja kaardile sisenajal on olemas oma isiklik "digitaalne märkmik" (LocalStorage). Sa saad kaardile märkida üles mida iganes – oma matkarajad, seenekohad või huvitavad leidud. Need andmed kuuluvad Sulle ja elavad turvaliselt Sinu seadmes.</p>
                    <p><strong>Kogukond ja andmete kaitse:</strong> Tõsisemad huvilised saavad liituda meie spetsialistide tiimiga, kirjutades aadressile <a href="mailto:info@kahem.info" style="color: #fcf6ba; text-decoration: underline;">info@kahem.info</a>. Kuna tegu on ohustatud liikidega, on süsteemil topeltkaitse: administraator saab tundlikud ja kriitilised leiukohad tavakasutajate silmade eest peita, et kaitsta loodust, samal ajal kui spetsialistid näevad jooksvat tervikpilti.</p>
                </section>

                <!-- PEATÜKK 1 -->
                <section>
                    <h3>1. LocalStorage – Kohalik Kiirmälu (Sinu märkmik)</h3>
                    <p><strong>Mis see on?</strong> Veebibrauseri sisene privaatne mälupank Sinu seadmes (arvutis või telefonis). Andmed säilivad püsivalt, ka lehe värskendamisel või seadme taaskäivitamisel.</p>
                    <p><strong>Meie projektis:</strong> See on Sinu isikliku märkmiku süda. Iga joonistatud kujund salvestatakse sekundi murdosa jooksul esmalt siia. See tagab kiiruse ja offline-valmiduse – matkal olles ei pea muretsema internetilevi pärast.</p>
                </section>

                <!-- PEATÜKK 2 -->
                <section>
                    <h3>2. Pilv (Cloud) – Ühine Mälu</h3>
                    <p><strong>Mis see on?</strong> Internetis asuv keskne andmebaas, mis sünkroniseerib volitatud kasutajate andmed.</p>
                    <p><strong>Meie projektis:</strong> Kui autoriseeritud spetsialist vajutab "Salvesta", liiguvad andmed pilve, tehes need reaalajas nähtavaks teistele tiimiliikmetele. Tavalise uudistaja isiklikud märkmiku sissekanded siia ei jõua – need jäävad privaatseks.</p>
                </section>

                <!-- PEATÜKK 3 -->
                <section>
                    <h3>3. Sisselogimine ja Magic Link (Auth)</h3>
                    <p><strong>Mis see on?</strong> Paroolivaba ja üliturvaline autentimine e-posti teel spetsialistidele.</p>
                    <p><strong>Meie projektis:</strong> Sisestades oma e-posti, saadab süsteem postkasti ühekordse "Võlulingi". Sellele klikates tuvastab süsteem seadme turvaliselt ära ilma vajaduseta paroole meeles pidada või sisestada.</p>
                </section>

                <!-- PEATÜKK 4 -->
                <section>
                    <h3>4. Rollid: Spetsialist ja Admin-vaade</h3>
                    <p><strong>Spetsialist:</strong> Kasutaja, kes rikastab leiukohti bioloogiliste andmetega (liigi staatus, kuupäev, seisund) läbi Spetsialisti modali.</p>
                    <p><strong>Admin-vaade:</strong> Süsteemi lennujuhtimine. Võimaldab andmeid korrigeerida, hallata nähtavust (peita asukohti avalikkuse eest) ja puhastada süsteemi vigastest sisestustest.</p>
                </section>
                
                <!-- PEATÜKK 5: TULEVIKUVISIOON JA KOOLIPROGRAMMID -->
                <section style="border-bottom: none;">
                    <h3>5. Kooliprogrammid, Retked ja Eksport (Tulevikuvisioon)</h3>
                    <p>Rakendus sobib suurepäraselt kooliprogrammide fakulteetpääsmeteks, geograafia- või bioloogiatundide praktiliseks osaks:</p>
                    <ul>
                        <li><strong>Lokaalne korje:</strong> Õpilased märgivad matkal või õpperetkel oma tähelepanekud lokaalselt oma seadme mällu.</li>
                        <li><strong>Eristatav eksport:</strong> Kokkuvõtete tegemise ajal saab iga õpilane genereerida oma koodi/tunnusega faili (Pealkiri + kuni 300 tähemärki kirjeldust) ja edastada selle juhendajale.</li>
                        <li><strong>Juhendaja töölaud:</strong> Juhendaja saab laadida kõigi õpilaste failid kokku ühele kaardile (lokaalses raamis), et teha ühiseid järeldusi, analüüse ja õppetööd, ilma et see mõjutaks keskset pilvebaasi.</li>
                    </ul>
                </section>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}


// Funktsioon, mis juhib akna avanemist ja sulgumist
function seostaJuhendiSündmused() {
    const käsiraamatModal = document.getElementById('käsiraamat-modal');
    const avaKäsiraamatNupp = document.getElementById('käsiraamat-nupp'); // Nupp peab olema Sinu HTML-is olemas
    const sulgeKäsiraamatNupp = document.getElementById('sulge-käsiraamat');

    if (avaKäsiraamatNupp && käsiraamatModal && sulgeKäsiraamatNupp) {
        // Ava käsiraamat
        avaKäsiraamatNupp.addEventListener('click', () => {
            käsiraamatModal.classList.remove('käsiraamat-peidus');
        });
        
        // Sulge ristist
        sulgeKäsiraamatNupp.addEventListener('click', () => {
            käsiraamatModal.classList.add('käsiraamat-peidus');
        });
        
        // Sulge klikkides tumedale taustale väljaspool sisuakent
        käsiraamatModal.addEventListener('click', (e) => {
            if (e.target === käsiraamatModal) {
                käsiraamatModal.classList.add('käsiraamat-peidus');
            }
        });
    } else {
        console.warn("Käsiraamatu avamise nuppu (#käsiraamat-nupp) ei leitud veel HTML-ist.");
    }
}
