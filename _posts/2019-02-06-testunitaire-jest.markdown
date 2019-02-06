---
layout: post
title: Améliorer la qualité de son code JS avec les Tests Unitaires 
date: 2019-02-05 13:00:00 +0300
description: Nous découvrirons ici comment améliorer et péréniser son code JS avec l'utilisation de Jest # Add post description (optional)
img: javascript.png # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [Javascript]
---
En programmation informatique, le test unitaire (ou « T.U. », ou « U.T. » en anglais) ou test de composants est une procédure permettant de vérifier le bon fonctionnement d'une partie précise d'un logiciel ou d'une portion d'un programme (appelée « unité » ou « module »).

Un test fonctionnel est le test qui servira à tester automatiquement toutes les fonctionnalités de votre application. "Toutes", ça veut dire : les fonctionnalités qui étaient demandées dans le cahier des charges du projet (ou autres spécifications). Par exemple, vous pourrez avoir à tester qu'un membre peut bien s'inscrire, se connecter, se déconnecter…

Pour répondre à ces besoins, j'ai fait le choix d'utiliser la librairie Jest. Jest est une librairie développé et maintenu par Facebook (mais aussi sa communauté open source), ce choix a été porté par le fait que cette librairie étant portée par Facebook risque fortement de perdurer dans le temps et d'être mis à jour facilement en fonction des révisions du langage JS, de plus il existe aussi différents plugins dont un permettant d'instancier Jest dans Visual Studio Code afin d’exécuter les tests sans devoir les exécuter par l'applet NodeJS. 



### Qu'est-ce que Jest permet de faire au niveau des tests

* Tester la valeur d'une variable (bool, string, number...)
* Tester la valeur de retour d'une fonction
* Vérifier qu'un array contient une valeur
* Des tests fonctionnels dans le DOM
* Et bien d'autres choses...

Quand devons nous faire des tests unitaires/fonctionnels ? 
La convention voudrait que chaque fonction, classe... comporte un test unitaire afin de vérifier l'intégrité d'une partie du code et/ou le code de notre projet, en pratique une permissivité existe afin de faire des tests unitaires sur certains types de code : 

* Une classe JS 
* Une fonction qui manipule de la donnée (une addition, une soustraction, une modification d'une chaine de caractère...)
* Une modification critique du DOM (ajout d'un produit au panier, la connexion à son espace client...)


### Installation de jest dans un projet JS
* Avec npm, lancez la commande `npm install --save-dev jest`
* Création d'un dossier `__tests__` où nous mettrons l'ensemble de nos tests
* Création d'un dossier `__mocks__` où nous y mettrons nos classes ES6 qui ont besoin d'être "mocké" (on reviendra sur le terme plus tard dans la doc) 
Jest est baptisé, les travaux peuvent commencer !

### Faisons des tests unitaires sur une classe JS
Vous pouvez voir que dans cette classe, le constructeur appelle une fonction avec une requête AJAX (contenu dans une Promise) afin de nous renvoyer le contenu d'un produit, ici lors de nos tests unitaires il n'est pas nécessaire d'exécuter la requête AJAX, en effet dans l'idéal une requête AJAX renvoie uniquement de la donnée et nous instancions une autre fonction pour faire le traitement de la donnée à la résolution de la requête AJAX si elle est en succès. 

C'est là qu'intervient l'idée de mock au niveau de notre classe afin que lors de l’exécution de nos tests, nous n'attendions pas après la résolution de la requête AJAX qui de plus si elle est en erreur peut biaiser la qualité du test. 

```
class Product {
    constructor(prmUrl) {
        this.getProduct(prmUrl).then((response) => {
            this.product = response; 
        })
    }

    getProduct(prmUrl) {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest(); 
            request.open('GET', prmUrl); 
            request.responseType = 'json'; 

            request.onload = () => {
                if(request.status === 200) {
                    resolve(request.response); 
                } else {
                    reject(Error(request.response)); 
                }
            }

            request.onerror = () => {
                reject(Error('There is a network error')); 
            }

            request.send(); 
        }); 
    }

    updateQuantity(prmQuantity) {
        return this.product.quantity += prmQuantity; 
    }

    updateQuantityOnDOM(prmQuantity, prmElement) {
        let element = document.querySelector(prmElement); 
        element.innerText = this.updateQuantity(prmQuantity); 
    }
}

module.exports = Product;
```


### "Mockons" (nous ?) une classe afin de l'utiliser lors de nos tests : 
Comme indiqué, pour que Jest comprenne que nous allons utiliser l'instance "mock" de notre classe, nous allons créer dans le dossier `__mocks__` un nouveau fichier contenant le même nom  que notre classe précédemment créée. Ici vous pouvez constater que nous avons modifié la fonction getProduct() de notre classe afin qu'elle nous retourne uniquement ce que le résultat de la requête AJAX devrait être en cas de succès. 

```
const getProductReturn = {
    name: "Ponceuse",
    quantity: 1
}

class Product {
    constructor() {
        this.product = this.getProduct; 
    }

	getProduct() {
		return getProductReturn; 
	}

    updateQuantity(prmQuantity) {
        return this.product.quantity += prmQuantity; 
    }

    updateQuantityOnDOM(prmQuantity, prmElement) {
        let element = document.querySelector(prmElement); 
        element.value = this.updateQuantity(prmQuantity); 
    }
}

module.exports = Product; 
Ou alors, on peut écrire de cette façon là dans notre fichier de test 
MyProduct.getProduct = jest.fn(() => Promise.resolve(
    {
        name: "Ponceuse",
        quantity: 1
    }
).then((response) => {
    expect(response.name).toBe('Ponceuse'); 
}));
```


### Créons notre premier fichier de test 
Nous y voilà enfin, nous avons préparé notre classe à être testée, on y va on va commencer les test \o/ 

Pour ce faire nous allons créer un fichier de test dans le dossier `__tests__` de notre arborescence avec comme nomenclature `nomDuFichierATester.test.js`. Les tests sont assez simple au vue de notre classe, je vous laisse donc parcourir le fichier afin de comprendre par vous même ce que les tests renvoient, n'oubliez pas d'éplucher la documentation afin de bien comprendre l'intérêt de l'outil : [Jest](https://jestjs.io/docs/en/getting-started)

```
const Product = require('../product.class'); //On importe product.class à notre projet de test
jest.mock('../product.class'); //On indique à jest qu'il faut utiliser la classe se trouvant dans le dossier __mocks__ lorsque l'on appelle une fonction provenant de notre classe Product

var MyProduct = new Product("https://www.example.com/getProduct"); 
var myFunction = () => 'Toto'; 

test('Test if product name is "Ponceuse" and that we have a Product instance', () => {
    expect(MyProduct).toBeInstanceOf(Product); 
    expect(MyProduct.product.name).toBe('Ponceuse'); 
});

test('Trying to add 6 to default quantity and verify it will be 7', () => {
    expect(MyProduct.updateQuantity(6)).toBe(7); 
});

test('Use Jest on DOM elemnt', () => {
    document.body.innerHTML =
    '<div>' +
    '  <input id="quantity" type="text" value="Michel"/>' +
    '  <button id="button" />' +
    '</div>';

    function eventFire(el, etype){ 
        if (el.fireEvent) {
            el.fireEvent('on' + etype);
        } else {
            var evObj = document.createEvent('Events');
            evObj.initEvent(etype, true, false);
            el.dispatchEvent(evObj);
        }
    }

    document.getElementById('button').addEventListener('click', function() {
        MyProduct.updateQuantityOnDOM(1,'#quantity'); 
    }); 

    eventFire(document.getElementById('button'), 'click');

    expect(document.getElementById('quantity').value).toEqual('8'); 
}); 

test('Verify if we have Toto returning by myFunction with a mock', () => {
    const myValue = "Toto";
    const myFunction = jest.fn(() => myValue);

    myFunction(); 

    expect(myFunction).toHaveReturnedWith('Toto');
}); 

test('Verifiy return value of myFunction to be Toto', () => {
    var myValue = myFunction();
    expect(myValue).toBe('Toto'); 
}); 

test('Verify is a value is null', () => {
    var myNull = null; 
    expect(myNull).toBeNull(); 
}); 

test('Verify boolean value at true', () => {
    var myBoolean = true; 
    expect(myBoolean).toBeTruthy(); 
}); 

test('Verify boolean value at false', () => {
    var myBoolean = false; 
    expect(myBoolean).not.toBeTruthy(); 
}); 

test('Array contains Tutu', () => {
    var myArray = ['toto','titi','tata','tutu']; 
    expect(myArray).toContain('tutu'); 
}); 

test('Addition to float numbers', () => {
    var addition = 3.5 + 4.2; 
    expect(addition).toBeCloseTo(7.7, 1); 
}); 

test('How many times myFunction is called on loop', () => {
    var myFunction = jest.fn();
    for(let i = 0; i < 4; i++) {
        myFunction(); 
    } 

    expect(myFunction).toHaveBeenCalledTimes(4); 
});
```



Il est tout à fait possible aussi de faire ce que l'on appelle du test fonctionnel sur nos classes, fonctions... Explorons un exemple ici.

### Testons un événement sur le DOM 
* eventFire est une fonction en javascript qui va simuler un événement sur un élément de notre DOM 
* Création de l'élément du DOM sur lequel on veut effectuer notre test fonctionnel 
* On rajoute l'événement sur notre élément du DOM 
* On appelle la fonction de notre classe Product qui met à jour la quantité de notre produit dans l'élément passé en paramètre à notre fonction 
* On test avec jest si on a bien la bonne valeur


```
test('Use Jest on DOM elemnt', () => {
    document.body.innerHTML =
    '<div>' +
    '  <input id="quantity" type="text" value="Michel"/>' +
    '  <button id="button" />' +
    '</div>';

    function eventFire(el, etype){ //Fonction permettant de simuler un clique sur un élément du DOM en JS
        if (el.fireEvent) {
            el.fireEvent('on' + etype);
        } else {
            var evObj = document.createEvent('Events');
            evObj.initEvent(etype, true, false);
            el.dispatchEvent(evObj);
        }
    }

    document.getElementById('button').addEventListener('click', function() {
        MyProduct.updateQuantityOnDOM(1,'#quantity'); 
    }); 

    eventFire(document.getElementById('button'), 'click');

    expect(document.getElementById('quantity').value).toEqual('8'); 
});
```


### Débugger un TU 
* Exécuter la commande `node --inspect-brk node_modules/.bin/jest --runInBand _tests_/truck-rental-app-desktop.src.js`
* Ouvrir chrome et renseigner dans l'URL `chrome://inspect`
* Ecoutez sur l'adresse `localhost:9229`
* Pour mettre un bon d'arrêt dans le code afin de pouvoir vérifier son code, utilisez le mot clef `debugger`, cette instruction va stopper l'exécution de votre code une fois cette dernière atteinte.


Si vous souhaitez vous amuser avec Jest, vous trouverez à cette adresse le code de cette documentation : [Jest](https://jestjs.io/docs/en/getting-started)

  

 




