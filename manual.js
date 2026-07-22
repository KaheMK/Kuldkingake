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
                <!-- Käsiraamatu manual.js sisse, peatükk 5 alla: -->
<section style="background: rgba(191, 149, 63, 0.08); padding: 15px; border-radius: 6px; border-top: 2px solid #bf953f; margin-top: 20px;">
    <h3>🎓 Ülevaatlik töölaud: Objektide statistika & hindamine</h3>
    <p style="font-size: 13px; color: #b0b0b0;">Siit näed kokkuvõtet kaardile laetud objektidest. Klikka objekti nimele, et eraldada tema vaatlused kaardil ülevaate saamiseks.</p>
    
    <!-- Nupp, mis värskendab ja arvutab tabeli andmed uuesti kokku -->
    <button id="uuenda-statistika-btn" style="background: #bf953f; color: black; border: none; padding: 6px 12px; font-weight: bold; border-radius: 4px; cursor: pointer; font-size: 12px; margin-bottom: 12px;">
        🔄 Värskenda ülevaadet
    </button>

    <!-- Dünaamiline tabel, kuhu JavaScript õpilased reas genereerib -->
    <div id="opilaste-statistika-tabel" style="max-height: 200px; overflow-y: auto;">
        <p style="font-style: italic; color: #888; font-size: 13px;">Tabel on tühi. Laadi esmalt Ribboni kaudu objektide GeoJSON failid sisse!</p>
    </div>
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

// === JUHENDAJA TÖÖLAUA STATISTIKA JA HINDAMISE LOOGIKA ===
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const uuendaBtn = document.getElementById('uuenda-statistika-btn');
        if (uuendaBtn) {
            uuendaBtn.addEventListener('click', genereeriOpilasteStatistika);
        }
        
        // Automaatne värskendus ka käsiraamatu akna avamisel
        const avaKäsiraamatNupp = document.getElementById('käsiraamat-nupp');
        if (avaKäsiraamatNupp) {
            avaKäsiraamatNupp.addEventListener('click', () => {
                setTimeout(genereeriOpilasteStatistika, 300);
            });
        }
    }, 1500);
});

// Globaalne muutuja, mis mäletab, millise õpilase peal õpetaja parajasti filtreerib
window.__aktiivneFiltreeritavOpilane = null;

function genereeriOpilasteStatistika() {
    const tabeliKonteiner = document.getElementById('opilaste-statistika-tabel');
    if (!tabeliKonteiner) return;

    // 1. Korjame OpenLayersi joonistuskihist (drawSource) kokku kõik features
    const drawSource = window.mapObjects?.drawSource;
    if (!drawSource) {
        tabeliKonteiner.innerHTML = `<p style="color: #ffaa00; font-size:13px;">⚠️ Hoiatus: Kaardimootori joonistuskiht pole veel kättesaadav.</p>`;
        return;
    }

    const kõikKujundid = drawSource.getFeatures();
    
    // 2. ARVUTAME ANDMED: Käime kujundid läbi ja loeme 'opilane' väärtuseid
    let opilasteStatistika = {}; // Struktuur: { "Juku": 5, "Manni": 3 }
    let kohalikudMärkmedArv = 0;

    kõikKujundid.forEach(f => {
        const nimi = f.get('opilane');
        if (nimi) {
            opilasteStatistika[nimi] = (opilasteStatistika[nimi] || 0) + 1;
        } else {
            kohalikudMärkmedArv++;
        }
    });

    const unikaalsedOpilased = Object.keys(opilasteStatistika);

    if (unikaalsedOpilased.length === 0 && kohalikudMärkmedArv === 0) {
        tabeliKonteiner.innerHTML = `<p style="font-style: italic; color: #888; font-size: 13px;">Kaardil pole ühtegi objekti. Laadi esmalt failid sisse!</p>`;
        return;
    }

    // 3. EHITAME TABELI VISUAALI (Stiilne ja puhas ridade nimekiri)
    let tabeliHTML = `<table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; color: #e0e0e0;">`;
    tabeliHTML += `<tr style="border-bottom: 1px solid #bf953f; color: #fcf6ba; font-weight: bold;"><th style="padding: 6px 4px;">Vaatleja</th><th style="padding: 6px 4px; text-align: center;">Objekte</th><th style="padding: 6px 4px; text-align: right;">Tegevus</th></tr>`;

    // Kui seadmes on isiklikke jooniseid ("Minu objekt")
    if (kohalikudMärkmedArv > 0) {
        tabeliHTML += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 8px 4px; color: #aaa; font-style: italic;">👤 Minu kohalikud märkmed</td>
            <td style="padding: 8px 4px; text-align: center; color: #aaa;">${kohalikudMärkmedArv}</td>
            <td style="padding: 8px 4px; text-align: right; color: #666; font-size: 11px;">(Põhikaart)</td>
        </tr>`;
    }

    // Genereerime iga õpilase kohta oma rea
    unikaalsedOpilased.forEach(nimi => {
        const onFiltreeritud = (window.__aktiivneFiltreeritavOpilane === nimi);
        const nupuTekst = onFiltreeritud ? "👁️ Näita kõiki" : "🔍 Isoleeri";
        const nupuVarv = onFiltreeritud ? "#ffaa00" : "#bf953f";
        const reaTaust = onFiltreeritud ? "background: rgba(191,149,63,0.15);" : "";

        tabeliHTML += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05); ${reaTaust}">
            <td style="padding: 8px 4px; font-weight: bold; color: #fff;">🎓 ${nimi}</td>
            <td style="padding: 8px 4px; text-align: center; font-weight: bold; color: #fcf6ba;">${opilasteStatistika[nimi]}</td>
            <td style="padding: 8px 4px; text-align: right;">
                <button onclick="filtreeriOpilaseObjektid('${nimi.replace(/'/g, "\\'")}')" style="background: ${nupuVarv}; color: black; border: none; padding: 4px 8px; font-weight: bold; border-radius: 3px; cursor: pointer; font-size: 11px;">
                    ${nupuTekst}
                </button>
            </td>
        </tr>`;
    });

    tabeliHTML += `</table>`;
    tabeliKonteiner.innerHTML = tabeliHTML;
}

// 4. FILTREERIMISE SÜDA: See funktsioon peidab ja näitab reaalajas OpenLayersi kujundeid!
function filtreeriOpilaseObjektid(opilaseNimi) {
    const drawSource = window.mapObjects?.drawSource;
    const map = window.mapObjects?.map;
    if (!drawSource || !map) return;

    const kõikKujundid = drawSource.getFeatures();

    // Kui klikiti õpilasele, kes on juba filtreeritud -> Tühistame filtri (näitame kõiki)
    if (window.__aktiivneFiltreeritavOpilane === opilaseNimi) {
        window.__aktiivneFiltreeritavOpilane = null;
        
        // Taastame kõigi kujundite nähtavuse (eemaldame tühja stiili)
        kõikKujundid.forEach(f => f.setStyle(null)); 
        console.log("✦ Hindamine: Filter tühistatud. Kõik objektid on nähtaval.");
    } else {
        // Rakendame uue filtri
        window.__aktiivneFiltreeritavOpilane = opilaseNimi;

        kõikKujundid.forEach(f => {
            const fOpilane = f.get('opilane');
            
            if (fOpilane === opilaseNimi) {
                // SELLE ÕPILASE OBJEKT: Jätame nähtavaks (null tähendab, et kasutab oma ilusat unikaalset värvi!)
                f.setStyle(null); 
            } else {
                // TEISTE TÖÖD: Peidame ära, määrates neile täiesti tühja ja nähtamatu stiili!
                f.setStyle(new ol.style.Style({})); 
            }
        });
        console.log(`✦ Hindamine: Isoleeritud  ${opilaseNimi} objektid.`);
        
        // BOONUS: Suuname kaardi automaatselt selle õpilase tööde keskpunkti, et õpetaja näeks neid kohe!
        try {
            // Loome ajutise vektori, et arvutada täpne asukoht kaardil
            const tempSource = new ol.source.Vector();
            kõikKujundid.forEach(f => { if(f.get('opilane') === opilaseNimi) tempSource.addFeature(f); });
            if (tempSource.getFeatures().length > 0) {
                map.getView().fit(tempSource.getExtent(), { duration: 800, maxZoom: 15 });
            }
        } catch(e){}
    }

    // Uuendame tabeli tekste (et nupp muutuks "Näita kõiki" peale) ja joonistame kaardi üle
    genereeriOpilasteStatistika();
    map.render();
}


