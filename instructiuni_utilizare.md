# Platformă Gestionare Cereri Disertație

Aceasta este o aplicație web de tip Single Page Application (SPA) cu un backend RESTful, destinată gestionării procesului de înscriere la sesiunile de disertație. Aplicația permite studenților să aplice la sesiuni create de profesori și profesorilor să gestioneze aceste cereri.

## 🛠 Tehnologii Utilizate

### Backend
* **Node.js & Express**: Pentru API-ul RESTful.
* **SQLite & Sequelize ORM**: Pentru persistența datelor (bază de date relațională).
* **JWT (JSON Web Tokens)**: Pentru autentificare și autorizare.
* **Multer**: Pentru încărcarea fișierelor (cereri semnate).

### Frontend
* **React.js (Vite)**: Framework bazat pe componente.
* **Axios**: Pentru comunicarea cu API-ul backend.
* **React Router**: Pentru navigare (SPA).

---

## 🚀 Instrucțiuni de Instalare și Rulare

Pentru a rula proiectul local, urmați acești pași:

### 1. Clonarea Repository-ului
Deschideți un terminal (CMD/PowerShell/Bash) și rulați:

git clone https://github.com/VoicuLeonard/AplicatieTW.git
cd AplicatieTW

### 2. Configuare Backend (Server)
Deschideți un terminal în folderul server și instalați dependențele:

   * **cd server**
   * **npm install**

Porniți serverul (acesta va rula pe portul 8080 și va crea automat baza de date database.sqlite):

   * **npm run dev**

3. Configurare Frontend (Client)
Deschideți un al doilea terminal, navigați în folderul client și instalați dependențele:

   * **cd client**
   * **npm install**
   

Porniți aplicația React:

   * **npm run dev**

Accesați aplicația în browser la adresa afișată.

-------------------------------------------------------------------------------------------

# Documentație API 
# Serviciul RESTful expune următoarele rute principale:

# Autentificare (/api/auth)
    POST /register - Înregistrare utilizator nou (Student sau Profesor).
    POST /login - Autentificare și generare Token JWT.

# Sesiuni (/api/sessions)
    GET / - Returnează lista tuturor sesiunilor active (Acces: Autentificat).
    POST / - Creare sesiune nouă (Acces: Doar Profesor).

# Aplicații/Cereri (/api/applications)
    POST / - Studentul aplică la o sesiune.
    GET / - Vizualizare cereri (Studentul își vede cererile, Profesorul le vede pe cele primite).
    PUT /:id/status - Modificare status cerere (Aprobare/Respingere) (Acces: Doar Profesor).
    POST /:id/upload - Încărcare fișier cerere semnată (Acces: Student cu status aprobat preliminar).

-------------------------------------------------------------------------------------------

# Conturi de Test 
# Puteți crea conturi noi din interfață sau puteți folosi un flux standard:

   * 1.Creați un cont de Profesor(selectați rolul la înregistrare). 
   * 2.Creați o sesiune din dashboard-ul profesorului.
   * 3.Creați un cont de Student.
   * 4.Aplicați la sesiune.