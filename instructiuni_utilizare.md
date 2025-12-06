# Platforma Gestionare Cereri Disertatie

Aceasta este o aplicatie web de tip Single Page Application (SPA) cu un backend RESTful, destinata gestionarii procesului de inscriere la sesiunile de disertatie. Aplicatia permite studentilor sa aplice la sesiuni create de profesori si profesorilor sa gestioneze aceste cereri.

##  Tehnologii Utilizate

### Backend
* **Node.js & Express**: Pentru API-ul RESTful.
* **SQLite & Sequelize ORM**: Pentru persistenta datelor (baza de date relationala).
* **JWT (JSON Web Tokens)**: Pentru autentificare si autorizare.
* **Multer**: Pentru incarcarea fisierelor (cereri semnate).

### Frontend
* **React.js (Vite)**: Framework bazat pe componente.
* **Axios**: Pentru comunicarea cu API-ul backend.
* **React Router**: Pentru navigare (SPA).

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
   * POST /register - Inregistrare utilizator nou (Student sau Profesor).
   * POST /login - Autentificare si generare Token JWT.

## Sesiuni (/api/sessions)
   * GET / - Returneaza lista tuturor sesiunilor active (Acces: Autentificat).
   * POST / - Creare sesiune noua (Acces: Doar Profesor).

## Aplicatii/Cereri (/api/applications)
   * POST / - Studentul aplica la o sesiune.
   * GET / - Vizualizare cereri (Studentul isi vede cererile, Profesorul le vede pe cele primite).
   * PUT /:id/status - Modificare status cerere (Aprobare/Respingere) (Acces: Doar Profesor).
   * POST /:id/upload - Incarcare fisier cerere semnata (Acces: Student cu status aprobat preliminar).

-------------------------------------------------------------------------------------------

# Conturi de Test 
## Puteti crea conturi noi din interfata sau puteti folosi un flux standard:

   * Creati un cont de Profesor (selectati rolul la inregistrare).
   * Creati o sesiune din dashboard-ul profesorului.
   * Creati un cont de Student.
   * Aplicati la sesiune.
