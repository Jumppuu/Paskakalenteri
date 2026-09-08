# Kurssikalenteri — Projektisuunnitelma

> Selainpohjainen kalenteri- ja tehtäväsovellus opiskelun tueksi.
> Käyttöliittymä suomeksi, helppokäyttöinen ja selkeä.

---

## 0. Nykytila (prototyyppi valmis)

Toimiva **prototyyppi** on jo rakennettu pelkällä frontendillä:
`index.html`, `styles.css`, `app.js`. Tiedot tallennetaan selaimen
**paikalliseen muistiin (localStorage)** — ei ulkoista tietokantaa.

Protossa toimii jo:
- ✅ Kalenterinäkymä (kuukausi + viikko)
- ✅ Tehtävälista ryhmittelyllä (myöhässä / tänään / tämä viikko / myöhemmin / valmiit)
- ✅ Tehtävien lisäys, muokkaus ja poisto
- ✅ Kurssit ja värikoodaus
- ✅ Prioriteetti ja tila (tekemättä / työn alla / valmis)
- ✅ Toistuvat tehtävät (viikoittain / joka toinen viikko)
- ✅ Suomenkielinen, mobiiliystävällinen käyttöliittymä
- ✅ Kaikkien tietojen tyhjennys
- ✅ Varmuuskopiointi ja tietojen jako (vienti/tuonti tekstikoodilla, leikepöytätuki)

Vielä puuttuu (ks. jäljempänä):
- ⏳ Oikeat muistutukset (sähköposti / push)
- ⏳ Automaattinen synkronointi laitteiden välillä (vaatii pilven)

---

## 1. Yhteenveto

Rakennetaan **web-sovellus**, jolla voi hallita kurssien tehtäviä (kotiläksyt,
palautukset, tentit). Sovellus toimii selaimessa niin puhelimella kuin
tietokoneella.

**Realistinen lähtökohta: paikallinen muisti (localStorage) ilman ulkoista
tietokantaa.** Tämä pitää sovelluksen yksinkertaisena, ilmaisena ja nopeana
rakentaa. Haittapuolena tiedot ovat vain yhdessä selaimessa/laitteessa, joten
todellinen laitteiden välinen jako ja palvelimelta lähetettävät muistutukset
vaativat myöhemmin kevyen pilviosuuden (ks. kohta 6).

> ⚖️ **Kompromissi:** Paikallinen muisti = helppo ja ilmainen, mutta ei
> automaattista synkronointia laitteiden välillä eikä sähköposti-/push-
> muistutuksia taustalla. Nämä voi lisätä myöhemmin, jos tarve kasvaa.

### Ydintavoitteet
- Tehtävien lisääminen nopeasti ja helposti
- Selkeä kalenterinäkymä (kuukausi/viikko)
- Muistutukset ennen määräaikaa (sähköposti + push)
- Kurssien värikoodaus ja järjestely
- Tehtävän tila (tekemättä / työn alla / valmis) ja prioriteetti
- Toistuvat tehtävät (esim. viikoittainen kotiläksy)

---

## 2. Käyttäjät ja käyttötapaukset

| Käyttäjä | Tarve |
|----------|-------|
| Morsian (pääkäyttäjä) | Lisää ja seuraa omia kurssitehtäviään, saa muistutukset |
| Sinä (jaettu käyttäjä) | Näet saman kalenterin, voit auttaa lisäämään tehtäviä |

> ℹ️ **Huom (paikallinen versio):** Ilman pilveä sovellus ei automaattisesti
> jaa tietoja laitteiden välillä. Käytännön kiertotapa: käytetään samaa
> laitetta/selainta, tai siirretään tiedot vienti/tuonti-toiminnolla
> (tekstikoodi, joka kopioituu leikepöydälle — toteutettu ✅).
> Aito reaaliaikainen jako edellyttää kohdan 6 pilviosuutta.

### Tyypilliset käyttötapaukset
1. "Lisää uusi kotiläksy: Matematiikka, määräaika perjantaina klo 12."
2. "Näytä tämän viikon palautukset."
3. "Merkitse tehtävä valmiiksi."
4. "Muistuta minua päivää ennen määräaikaa."
5. "Toista sama tehtävä joka viikko koko kurssin ajan."

---

## 3. Ominaisuudet

### 3.1 Pakolliset (MVP) — tila prototyypissä
- [x] **Tehtävän lisäys**: otsikko, kurssi, määräaika (pvm + kellonaika), kuvaus
- [x] **Kalenterinäkymä**: kuukausi- ja viikkonäkymä
- [x] **Listanäkymä**: tulevat tehtävät järjestyksessä määräajan mukaan
- [x] **Tehtävän tila**: tekemättä / työn alla / valmis
- [x] **Prioriteetti**: matala / normaali / korkea
- [x] **Kurssit ja värikoodaus**: jokaisella kurssilla oma väri
- [x] **Suomenkielinen käyttöliittymä**
- [x] **Paikallinen tallennus** (localStorage)
- [ ] **Muistutukset**: sähköposti + push (vaatii pilven — ks. kohta 6/7)
- [ ] **Kirjautuminen / jaettu käyttö** (vaatii pilven)

### 3.2 Toivottavat (myöhemmin)
- [x] **Toistuvat tehtävät**: viikoittain / joka toinen viikko
- [x] **Varmuuskopiointi**: tietojen vienti ja tuonti (tekstikoodi, kopioituu leikepöydälle)
- [ ] **Selainmuistutukset**: ilmoitus kun sovellus on auki (Notifications API)
- [ ] **Arvosanojen seuranta** (mahdollinen laajennus myöhemmin)
- [ ] Liitetiedostot tehtäviin (esim. tehtävänanto PDF)
- [ ] Tummatila (dark mode)
- [ ] Haku (kurssin tai tilan mukainen suodatus jo toteutettu)

---

## 4. Käyttöliittymä (suomeksi, helppo)

### Päänäkymät
1. **Kalenteri** – kuukausi/viikko, tehtävät värillisinä palkkeina
2. **Tehtävälista** – "Tulevat tehtävät" tärkeysjärjestyksessä
3. **Tehtävän lisäys/muokkaus** – yksinkertainen lomake
4. **Kurssit** – kurssien hallinta ja värit
5. **Asetukset** – muistutusajat, sähköposti, ilmoitukset

### Esimerkki suomenkielisistä teksteistä
- Painikkeet: `Lisää tehtävä`, `Tallenna`, `Peruuta`, `Merkitse valmiiksi`
- Tilat: `Tekemättä`, `Työn alla`, `Valmis`
- Prioriteetti: `Matala`, `Normaali`, `Korkea`
- Navigointi: `Kalenteri`, `Tehtävät`, `Kurssit`, `Asetukset`

### Suunnitteluperiaatteet
- Iso "+" -painike tehtävän nopeaan lisäämiseen
- Selkeät värit ja suuret kosketusalueet (mobiiliystävällinen)
- Mahdollisimman vähän kenttiä pakollisena → nopea käyttö
- Selkeä värikoodi kiireellisyydelle (esim. punainen = tänään/myöhässä)

---

## 5. Tietomalli (mitä tallennetaan)

### Kurssi (Course)
| Kenttä | Kuvaus |
|--------|--------|
| id | Yksilöivä tunniste |
| nimi | Kurssin nimi (esim. "Matematiikka") |
| väri | Värikoodi kalenteria varten |
| lukukausi | Valinnainen (esim. "Syksy 2026") |

### Tehtävä (Assignment)
| Kenttä | Kuvaus |
|--------|--------|
| id | Yksilöivä tunniste |
| otsikko | Tehtävän nimi |
| kurssi_id | Mihin kurssiin liittyy |
| kuvaus | Vapaa teksti / ohjeet |
| määräaika | Päivämäärä ja kellonaika |
| prioriteetti | matala / normaali / korkea |
| tila | tekemättä / työn alla / valmis |
| toisto | ei / viikoittain / mukautettu |
| muistutukset | Milloin muistutetaan (esim. -1 pv, -1 h) |

### Käyttäjä (User)
| Kenttä | Kuvaus |
|--------|--------|
| id | Yksilöivä tunniste |
| nimi | Näyttönimi |
| sähköposti | Kirjautumiseen ja muistutuksiin |

> ℹ️ Käyttäjä-taulu tarvitaan vasta pilviversiossa (kirjautuminen + jako).
> Paikallisessa versiossa sitä ei tarvita.

---

## 6. Tekninen toteutus

### Vaihe 1 – Paikallinen versio (nykyinen prototyyppi) ✅
- **Puhdas frontend**: HTML + CSS + JavaScript (ei rakennustyökaluja)
- **Tallennus**: selaimen `localStorage` — ei ulkoista tietokantaa
- **Hosting**: voi avata suoraan tiedostona tai laittaa ilmaiseen
  staattiseen hostiin (esim. GitHub Pages, Cloudflare Pages, Netlify)
- **PWA (myöhemmin)**: sovelluksen voi "asentaa" puhelimen kotinäytölle

Tämä riittää yhden käyttäjän arkikäyttöön yhdellä laitteella. Kevyt,
ilmainen ja nopea ylläpitää.

### Vaihe 2 – Valinnainen pilvilaajennus (jos jako/muistutukset tarvitaan)
Jos halutaan **oikea jako kahden laitteen välillä** ja **taustalla lähetettävät
muistutukset**, lisätään kevyt pilviosuus. Tämä ei vaadi koko sovelluksen
uudelleenkirjoitusta — vain tallennuskerroksen vaihdon.
- **Tietokanta + kirjautuminen**: Firebase (Firestore + Authentication) tai Supabase
- **Push-ilmoitukset**: Firebase Cloud Messaging (FCM)
- **Ajastetut muistutukset**: pilvifunktio (esim. Firebase Cloud Functions)
- **Sähköposti**: Resend tai vastaava

### Suositus
Aloitetaan **paikallisella versiolla** (valmis jo nyt). Siirrytään pilveen vasta,
jos laitteiden välinen jako tai automaattiset muistutukset osoittautuvat
tarpeellisiksi. Näin vältetään turha monimutkaisuus ja kustannukset alussa.

---

## 7. Muistutusten toiminta

### Paikallinen versio (ilman pilveä)
Ilman palvelinta muistutuksia ei voi lähettää taustalla, kun sovellus on kiinni.
Realistiset vaihtoehdot:
1. **Visuaaliset merkinnät sovelluksessa**: "Myöhässä" ja "Tänään" -merkit
   sekä ryhmittely (toteutettu jo prototyypissä).
2. **Selainilmoitukset (Notifications API)**: ilmoitus voidaan näyttää, kun
   sovellus on auki tai asennettuna PWA:na. Rajoitus: ei luotettava, jos
   selain/sovellus on kokonaan suljettu.

### Pilviversio (jos lisätään myöhemmin)
1. Käyttäjä asettaa tehtävälle määräajan.
2. Oletusmuistutukset esim. **1 päivä ennen** ja **1 tunti ennen**.
3. Pilvifunktio tarkistaa säännöllisesti lähestyvät määräajat.
4. Muistutus lähetetään **push-ilmoituksena** ja/tai **sähköpostina**.
5. Kun tehtävä merkitään valmiiksi, muistutukset lakkaavat.

---

## 8. Toteutuksen vaiheet

### Vaihe 1 – Paikallinen prototyyppi ✅ (valmis)
- [x] Puhdas frontend (HTML/CSS/JS)
- [x] Tallennus localStorageen
- [x] Tehtävien lisäys, muokkaus ja poisto
- [x] Kalenterinäkymä (kuukausi/viikko)
- [x] Tehtävälista ja tilan vaihto
- [x] Kurssit ja värikoodaus
- [x] Toistuvat tehtävät

### Vaihe 2 – Paikallisen version viimeistely (seuraavaksi)
- [x] Varmuuskopiointi: tietojen vienti/tuonti (tekstikoodi + leikepöytä)
- [ ] Selainilmoitukset (Notifications API)
- [ ] PWA (asennettavuus puhelimeen)
- [ ] Julkaisu ilmaiseen staattiseen hostiin (esim. GitHub/Cloudflare Pages)

### Vaihe 3 – Valinnainen pilvilaajennus (vain jos tarve)
- [ ] Tallennuskerroksen vaihto pilveen (Firebase/Supabase)
- [ ] Kirjautuminen ja jaettu käyttö kahdelle
- [ ] Sähköposti- ja push-muistutukset

### Vaihe 4 – Lisäominaisuudet
- [ ] Arvosanojen seuranta
- [ ] Liitetiedostot
- [ ] Tummatila

---

## 9. Avoimet kysymykset / päätettävää myöhemmin

- Riittääkö paikallinen versio (yksi laite), vai tarvitaanko oikea jako
  kahden laitteen välillä? → vaikuttaa siihen tarvitaanko pilvi.
- Tarvitaanko sähköposti-/push-muistutukset heti vai riittävätkö
  sovelluksen sisäiset merkinnät + selainilmoitukset?
- ~~Halutaanko varmuuskopiointi (vienti/tuonti)?~~ → Toteutettu tekstikoodilla.
- Tarvitaanko arvosanojen seuranta?
- Halutaanko tehtävät myös synkronoida Google-kalenteriin?

## 10. Yhteenveto valinnoista

| Asia | Valinta |
|------|---------|
| Alusta | Web-sovellus (selain, puhelin + tietokone) |
| Tallennus | **Paikallinen muisti (localStorage)** — ei ulkoista tietokantaa |
| Ilmoitukset | Sovelluksen sisäiset merkinnät nyt; sähköposti/push myöhemmin (pilvi) |
| Käyttäjät | Yksi laite kerrallaan; aito jako vaatii pilven |
| Sijainti | Toimii paikallisesti; voi julkaista ilmaiseen staattiseen hostiin |
| Ydinnäkymät | Kalenteri, kurssit + värit, tila & prioriteetti, toistuvat tehtävät |
| Kieli | Suomi |
| Teknologia | Puhdas HTML + CSS + JavaScript (ei rakennustyökaluja) |

---

*Tämä on suunnitelma – ei vielä koodia. Kun suunnitelma näyttää hyvältä,*
*voidaan aloittaa toteutus vaihe kerrallaan.*
