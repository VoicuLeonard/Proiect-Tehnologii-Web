# Platforma Gestionare Cereri Disertatie

Aceasta este o aplicatie web de tip Single Page Application (SPA) cu un backend RESTful, destinata gestionarii procesului de inscriere la sesiunile de disertatie. Aplicatia permite studentilor sa aplice la sesiuni create de profesori si profesorilor sa gestioneze aceste cereri.

##  Tehnologii Utilizate

### Backend
* **Node.js & Express**: Arhitectura serverului si API-ul RESTful.
* **SQLite & Sequelize ORM**: Baza de date relationala si managementul datelor.
* **JWT (JSON Web Tokens)**: Securitate, autentificare si autorizare pe baza de roluri.
* **Multer**: Gestionarea incarcarii fisierelor (upload) pe server.

### Frontend
* **React.js (Vite)**: Interfata utilizator bazata pe componente.
* **Axios**: Client HTTP pentru comunicarea cu backend-ul si API-uri externe.
* **React Router**: Navigare in aplicatie (SPA).
* **Serviciu Extern**: Integrare cu API public (DummyJSON) pentru "Citatul Zilei".

-------------------------------------------------------------------------------------------

##  Instructiuni de Instalare si Rulare

Pentru a rula proiectul local, urmati acesti pasi:

### 1. Clonarea Repository-ului
Deschideti un terminal (CMD/PowerShell/Bash) si rulati:

git clone https://github.com/VoicuLeonard/Proiect-Tehnologii-Web.git

cd AplicatieTW

### 2. Configuare Backend (Server)
Deschideti un terminal in folderul server si instalati dependentele:

   * **cd server**
   * **npm install**

Porniti serverul (va crea automat baza de date database.sqlite):

   * **npm run dev**

### 3. Configurare Frontend (Client)
Deschideti un al doilea terminal, navigati in folderul client si instalati dependentele:

   * **cd client**
   * **npm install**
   

Porniti aplicatia React:

   * **npm run dev**

Accesati aplicatia in browser la adresa afisata.

-------------------------------------------------------------------------------------------

# Documentație API 
## Serviciul RESTful expune urmatoarele rute principale:

## Autentificare (/api/auth)
   * POST /register - Inregistrare utilizator nou (Student sau Profesor). Include validari (nume min 3 caractere, parola min 6 caractere).
   * POST /login - Autentificare si generare Token JWT.

## Sesiuni (/api/sessions)
   * GET / - Returneaza lista tuturor sesiunilor active si numarul de locuri ocupate.
   * POST / - Creare sesiune noua.
   * Restrictie: Un profesor nu poate crea sesiuni care se suprapun calendaristic cu altele existente ale sale. (Acces: Doar Profesor).

## Aplicatii/Cereri (/api/applications)
   * POST / - Studentul aplica la o sesiune disponibila.
   * GET / - Vizualizare cereri (Studentul isi vede propriile cereri, Profesorul le vede pe cele primite).
   * PUT /:id/status - Modificare status (Acceptare Preliminara / Respingere cu motiv). (Acces: Doar Profesor).
   * POST /:id/upload - Incarcare document semnat de catre student. (Acces: Student cu status ACCEPTAT_PRELIMINAR sau RESPINS_FINAL).
   * POST /:id/upload-signed - Finalizare flux: Profesorul incarca documentul final semnat si aproba cererea. (Acces: Doar Profesor).

-------------------------------------------------------------------------------------------

# Fluxul de Utilizare (Scenariu de Test)
## Aplicatia respecta un flux logic de business strict. Iata pasii recomandati pentru testarea completa:

   ### Pasul 1: Profesorul
   * Se autentifica in aplicatie.

   * Vizualizeaza "Citatul Zilei" (preluat din serviciu extern).

   * Creeaza o sesiune noua (ex: Titlu, Descriere, Data Start/Final, Locuri).

   * Nota: Daca intervalul se suprapune cu o alta sesiune a sa, va primi eroare.

   ### Pasul 2: Studentul
   * Se autentifica.

   * Vede sesiunea creata de profesor in lista.

   * Apasa "Trimite Cerere". Statusul devine IN_ASTEPTARE.

   ### Pasul 3: Aprobarea Preliminara (Profesor)

   * Profesorul vede cererea studentului in dashboard.

   * Apasa "Accepta Preliminar".

   ### Pasul 4: Incarcarea Documentului (Student)

   * Studentul vede statusul ACCEPTAT_PRELIMINAR.

   * Ii apare butonul de upload. Selecteaza un fisier si apasa "Incarca".

   * Statusul devine FISIER_INCARCAT.

   ### Pasul 5: Aprobarea Finala (Profesor) 

   * Profesorul vede ca studentul a incarcat fisierul.

   * Poate descarca fisierul studentului pentru verificare.

   * Are doua optiuni:

   * Respinge: Scrie un motiv si cere studentului sa reincarce.

   * Aproba Final: Selecteaza fisierul semnat de el si apasa "Trimite & Aproba".

   * Statusul devine APROBAT_FINAL.

   ### Pasul 6: Finalizare (Student)

   * Studentul vede statusul APROBAT_FINAL.

   * Poate descarca fisierul final semnat de profesor.
