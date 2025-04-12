<div align="center">

# Bivouac N Go Frontend

<a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/">Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License</a>.

---

### **Description**

Ceci est le frontend de l'application Bivouac N Go. C'est une application **Android**.

---

</div>

## Table of Contents

- [Organisation du repo](#organisation-du-repo)
- [Lancer l'application](#lancer-lapplication)
    - [Pré-requis](#pré-requis)
    - [Lancer](#lancer)
    - [Compte User et Admin](#compte-user-et-admin)
- [Contributions](#contributions)
    - [Authors](#authors)

# Organisation du repo
<sup>[(Back to top)](#table-of-contents)</sup>


Voici l'organisation simplifiée des fichiers:

```
.
├── App.js
├── app.json
├── assets
├── babel.config.js
├── package.json
├── package-lock.json
├── postinstall.js
├── README.md
└── src
    ├── components
    │   ├── CounterComponent.js
    │   ├── HeaderWithLogo.js
    │   ├── Loading.js
    │   ├── RentalManagementComponent.js
    │   └── Tabs.js
    ├── store
    │   ├── authSlice.js
    │   ├── counterSlice.js
    │   └── store.js
    └── views
        ├── AdminView.js
        ├── BookingConfirmationView.js
        ├── BookingRequestDetailsView.js
        ├── BookingRequestView.js
        ├── BookReservationView.js
        ├── ExploreView.js
        ├── LocalisationMapView.js
        ├── LocationDetailsView.js
        ├── LoginView.js
        ├── MyRentalsView.js
        ├── MyTripsView.js
        ├── NewRentalView.js
        ├── ProfileView.js
        ├── RentalView.js
        └── ReservationDetailsView.js
```

# Lancer l'application
<sup>[(Back to top)](#table-of-contents)</sup>
 
Voici un guide pour lancer le frontend.

Assurez vous d'avoir le backend lancé avant de lancer le frontend pour eviter des conflits de ports.

## Pré-requis
<sup>[(Back to top)](#table-of-contents)</sup>

Clonez le projet:

```
git clone git@gitlab.polytech.umontpellier.fr:alexandre.deloire01/camping-android-app.git
```

Placez-vous dans le projet.

Installez les dépendances:

```
npm install
```

Puis modifiez le ```.env``` avec l'adresse du backend:

Testez l'application sur android avec Expo Go:

**Merci d'adapter à votre IP**

```
API_BASE_URL=http://192.168.178.185:8083
```

Pour tester avec le navigateur, ```localhost``` suffit:

```
API_BASE_URL=http://localhost:8083
```

## Lancer
<sup>[(Back to top)](#table-of-contents)</sup>

Pour lancer l'application:

```
npx expo start -c
```

Si Expo vous demande de passer sur un autre port, appuyer sur ```y```.

Pour tester sur android avec Expo Go:

**Scannez le QR Code proposé par Expo**

Pour tester sur le navigateur web:

Appuyer sur ```w```. Une fenetre devrait s'ouvrir dans votre navigateur, patientez que l'application se build. Normalement, l'adresse du frontend est ```http://localhost:8084```.

## Compte User et Admin
<sup>[(Back to top)](#table-of-contents)</sup>

Voici le login d'un compte User:

- username: ```ASmith```
- password: ```ASmith```

Voici le login d'un admin:

- username: ```BJohn```
- password: ```BJohn```

Dans la base de données que vous avez normalement chargée, BJohn a des Rentals et ASmith a prévu quelques trips!

# Contributions
<sup>[(Back to top)](#table-of-contents)</sup>

## Authors
<sup>[(Back to top)](#table-of-contents)</sup>

- [**DELOIRE Alexandre**](https://gitlab.polytech.umontpellier.fr/alexandre.deloire01)
- [**JORGE Rémi**](https://gitlab.polytech.umontpellier.fr/remi.jorge)
- [**HE Jiayi**](https://gitlab.polytech.umontpellier.fr/jiayi.he)



