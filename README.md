# Proiect-Tehnologii-Web

Link aplicatie: proiect-tehnologii-web-lyart.vercel.app

1. Specificatii Detaliate

A. Roluri Utilizatori
Student:

•	Poate vizualiza lista profesorilor si sesiunile de inscriere active ale acestora.

•	Poate trimite o cerere preliminara catre un profesor in cadrul unei sesiuni active.

•	Poate vizualiza statusul tuturor cererilor sale (Ex: In Asteptare, Aprobat Preliminar, Respins Preliminar, Fisier Incarcat, Aprobat Final, Respins Final).

•	Poate retrage o cerere care este inca "In Asteptare".

•	Daca o cerere este "Aprobat Preliminar", poate incarca un fisier (cererea semnata).

•	Daca o cerere este "Respins Final", poate reincarca un nou fisier.

•   Vizualizeaza un "Citat al zilei" sau informatii externe preluate printr-un API public, afisate in Dashboard.

Profesor:

•	Poate crea, modifica si sterge sesiuni de inscriere.

•	La crearea unei sesiuni, defineste: data de inceput, data de sfarsit si un numar maxim de locuri.

•	Sistemul NU va permite crearea unor sesiuni care se suprapun in timp (pentru acelasi profesor).

•	Poate vizualiza toate cererile preliminare primite pentru sesiunile sale active.

•	Poate aproba preliminar o cerere (daca mai are locuri disponibile in sesiune).

•	Poate respinge preliminar o cerere (trebuie sa furnizeze o justificare text).

•	Poate vizualiza/descarca fisierul incarcat de student (dupa aprobarea preliminara).

•	Poate aproba final cererea (optional, poate incarca un fisier raspuns, ex: cererea contrasemnata).

•	Poate respinge final cererea (cu justificare, ex: "Fisierul nu este semnat corect"), trimitand statusul inapoi la "Aprobat Preliminar" pentru ca studentul sa reincarca.

__________________________________________________________________________________________________________________________________________________________

B. Modelul de Date

•	User (Utilizator)

-	id (cheie primara)

-	nume (string)

-	email (string, unic)

-	parola (string, hash)

-	rol (enum)


•	Session (Sesiune de inscriere)

-	id (cheie primara)

-	profesorId (cheie externa catre User)

-	titlu (string)

-	dataStart (timestamp)

-	dataEnd (timestamp)

-	locuriMaxime (integer)


•	Application (Cerere)

-	id (cheie primara)

-	studentId (cheie externa catre User)

-	profesorId (cheie externa catre User)

-	sessionId (cheie externa catre Session)

-	status (enum)

-	justificareRespingere (text)


•	Document (Fisier)

-	id (cheie primara)

-	applicationId (cheie externa catre Application)

-	userId (cheie externa catre User)

-	numeFisier (string)

-	caleFisier (string)

-	tip (enum)

-	timestamp (data incarcare)

___________________________________________________________________________________________________________________________________________________________


C. Logica de Business Cheie


•	Regula Aprobarii Unice:

-	Un student poate avea mai multe cereri cu statusul 'Pending'.

-	Cand un profesor aproba preliminar cererea unui student (status devine 'PrelimApproved'), aplicatia trebuie sa execute o logica suplimentara:

-	Toate celelalte cereri 'Pending' ale ACELUI student catre ALTI profesori trebuie automat anulate/respinse (sau blocate de la aprobare). Acest lucru asigura ca "nu mai poate fi aprobat de un al doilea".


•	Contor Locuri:

-	La crearea sesiunii, locuriDisponibile = locuriMaxime.

-	Cand un profesor apasa "Aproba Preliminar", sistemul verifica:

1.	Studentul are deja o alta cerere 'PrelimApproved'? (Daca da, se blocheaza -> vezi regula de mai sus).
	
2.	Sesiunea mai are locuriDisponibile > 0?
  
3.	Daca ambele sunt OK, locuriDisponibile scade cu 1, iar statusul cererii devine 'PrelimApproved'.



2. Etapele Realizarii Proiectului


Faza 1: Arhitectura si Configurare (Fundatia)


•	Definirea Arhitecturii:

-	Backend: Un API RESTful (Node.js) care va gestiona toata logica de business, utilizatorii si datele.

-	Frontend: O aplicatie de tip Single Page Application  (creat cu React/Vue) care consuma API-ul.


•	Design-ul Bazei de Date: Proiectarea schemei bazei de date relationale (SQL) folosind Sequelize pentru a stoca entitatile: Users, Sessions, Applications.

________________________________________________________________________________________________________________________________________________________________


Faza 2: Dezvoltare Backend – Autentificare si Sesiuni

Construirea API-ului de baza si gestionarea entitatilor principale.


•	API Autentificare:

-	Securizarea parolelor folosind bcrypt.

-	Generarea de JSON Web Tokens la login pentru autentificarea cererilor viitoare.


•	Middleware de Securitate:

-	Crearea unui middleware care verifica token-ul JWT si rolul utilizatorului 


•	API Sesiuni (CRUD):

-	Implementarea rutelor protejate , doar pentru profesori, pentru a crea, vizualiza, modifica si sterge sesiuni 

-	Adaugarea logicii de validare pentru a preveni suprapunerea sesiunilor pentru acelasi profesor.

________________________________________________________________________________________________________________________________________________________________


Faza 3: Dezvoltare Backend – Logica de Business

Implementarea fluxului central al aplicatiei: cererile de disertatie.


•	API Cereri (Applications):

-	Studentul creeaza o cerere.

-	Studentul isi vede toate cererile.

-	Profesorul vede cererile primite pentru sesiunile sale.


•	Logica de Aprobare/Respingere:

-	Implementarea rutelor prin care profesorul aproba preliminar sau respinge.

-	Implementarea logicii: La aprobarea preliminara, se executa o tranzactie care:


1.	Verifica: Daca studentul are deja o alta cerere 'PrelimApproved'. Daca da, esueaza.
 
2.	Verifica: Daca sesiunea mai are locuri.
  
3.	Actualizeaza: Seteaza statusul cererii curente la 'PrelimApproved'.
  
________________________________________________________________________________________________________________________________________________________________

•	API Upload Fisiere:

-	Implementarea unei rute pentru a permite studentului sa incarce fisierul semnat.

-	Implementarea unei rute similare pentru profesor.

________________________________________________________________________________________________________________________________________________________________


Faza 4: Dezvoltare Frontend (SPA)

Construirea interfetei cu care utilizatorii interactioneaza.

•	Configurare Frontend: Initializarea proiectului React/Vue si configurarea React Router/Vue Router pentru navigarea intre pagini (Login, Dashboard Student, Dashboard Profesor).

•	Managementul Starii: Implementarea React Context API pentru a stoca global datele utilizatorului autentificat si token-ul JWT.

•	Constructia Pagini/Componente:

-	Pagina Login/Register.

-	Dashboard Profesor: Componenta pentru crearea sesiunilor, lista de cereri primite (cu butoane de Aprobare/Respingere).

-	Dashboard Student: Lista de profesori/sesiuni active, formular de aplicare, lista cu statusul propriilor cereri.

•	Integrare API:

-	Crearea unui serviciu pentru a efectua apeluri catre backend.

-	Conectarea tuturor formularelor si butoanelor la API-ul corespunzator.

-	Implementarea componentei de upload fisiere.

________________________________________________________________________________________________________________________________________________________________


Faza 5: Testare, Integrare si Finalizare

Asigurarea ca toate partile functioneaza corect impreuna.

•	Testare API: Verificarea fiecarui endpoint din backend folosind Postman 

•	Testare Flux: Simularea unui flux complet:

1.	Profesorul creeaza o sesiune.
	
2.	Studentul aplica la 2 profesori.
	
3.	Profesorul A aproba (verifica daca cererea la B se anuleaza).
	
4.	Studentul incarca fisierul.
	
5.	Profesorul A respinge final (cere modificari).
	
6.	Studentul reincarca.
	
7.	Profesorul A aproba final.
	

•	Responsivitate: Ajustarea CSS-ului pentru a asigura functionalitatea pe desktop, tableta si mobil.

________________________________________________________________________________________________________________________________________________________________


3. Tehnologii, Biblioteci(SQLite, Express, React, Node.js)


Frontend (Partea Client - SPA)

•	Baza: HTML, CSS, JavaScript

•	Framework SPA: React.js/Vue.js - Pentru construirea interfetei de tip SPA.

•	Navigare: React Router - Pentru a gestiona paginile in SPA.

•   Build Tool : Vite (pentru initializare rapida si performanta).

•	Apeluri API: Axios - O biblioteca populara pentru a face cereri HTTP catre backend.

•	Management Stare: React Context API - Pentru a partaja date (ca informatiile utilizatorului logat) intre componente.

•	Stilizare: CSS 


Backend (Partea Server - API)

•	Platforma: Node.js - Mediul de rulare JavaScript pe server.

•	Framework Server: Express.js - Pentru a construi rapid si eficient API-ul RESTful.

•	Baza de Date: SQLite - stocare locala in fisier.

•   ORM: Sequelize - pentru modelarea datelor si interactiunea cu baza de date relationala

•   Autentificare: JSON Web Tokens si Bcrpy

•   Upload Fisiere: Multer

•   Serviciu Extern: Axios - pentru prelucrarea de date externe
