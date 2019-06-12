---
layout: post
title: Améliorer la qualité de son code JS avec Sentry 
date: 2019-06-12 13:00:00 +0300
description: Nous découvrirons ici comment améliorer et tracker les erreurs côté client avec Sentry # Add post description (optional)
img: javascript.png # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [Javascript]
---
Il n'y a rien de plus frustrant lors du développement d'un site web que la remonté d'erreur côté client qui survient lors de l'exécution Javascript, comment remonter les erreurs ? Comment savoir ce que le client a fait ? Sur quel navigateur était-il ? Sur quel système d'exploitation ? Sur quoi a-t-il cliqué ? 

C'est là qu'un outil comme Sentry intervient et nous permet de mieux périmétré notre code mais surtout d'obtenir du feedback côté client en ayant connaissance des informations utiles fait par l'utilisateur. 

### Qu'est-ce que Sentry ?
Sentry est un outil dit de monitoring qui permet de tracker les erreurs qui peuvent intervenir lors de l'exécution d'une instruction de code. Il est capable de surveiller de nombreux langages de programmation tel que le Javascript, le Ruby, le .NET, le JAVA... De plus il est facilement intégrable avec bons nombres d'outils afin d'améliorer et optimiser son workflow, il permet par exemple de pouvoir remonter les erreurs dans Slack, de créer des tickets dans votre dépôt Github ou Gitlab, de suivre le numéro de version de vos applications... Tout ceci est expliqué dans la documentation disponible [à cette adresse](https://docs.sentry.io/). 

Nous allons maintenant voir ensemble comment utiliser Sentry dans nos projets. 

### Déployer Sentry
Il existe deux façons de déployer Sentry : 
* soit en utilisant le service SAAS fourni par le service lui-même, soit à l'aide d'image Docker. 
* soit à l'aide de Docker, voici un [docker-compose](https://github.com/ThomasRumas/sentry) que j'ai crée pour vous.

Une fois votre instance de Sentry disponible, vous devriez pouvoir créer un projet dans l'interface, une fois le projet crée, vous obtiendrez une clef d'identification pour ce dernier. 

Passons maintenant à l'instanciation de l'outil sur notre site web !

### Mise en place de Sentry dans un projet Javascript
La façon la plus simple pour rajouter Sentry dans vos projets web est d'utiliser le script JS disponible sur le CDN de l'outil 
```<script src="https://browser.sentry-cdn.com/5.4.0/bundle.min.js" crossorigin="anonymous"></script> ```

Cependant, vous préfereriez sans doute l'utiliser comme une dépendance NPM à votre projet 
```
    npm install @sentry/browser@5.4.0
```

Maintenant que le SDK est utilisable, voyons comment l'instancier dans votre code, pour cela, rien de plus simple, il vous suffit de l'instancier de cette façon :
``` Sentry.init({ dsn: 'https://<key>@sentry.io/<project>' }); ```

* la "key" correspond à la clef qui vous a été donné lorsque vous avez crée votre projet sous Sentry
* le "project" correspond au nom de votre projet

Et voilà, vous venez d'instanciez Sentry, maintenant dès qu'une erreur apparaitra dans la console du navigateur, cette erreur remontera dans le dashboard de Sentry. Vous y trouverez l'ensemble des informations nécessaires comme l'OS utilisé, l'IP, le navigateur utilisé, la stack trace d'exécution du code...

### Rendre les erreurs dans le code qualitatif !
Cependant, maintenant que nous arrivions à recevoir les erreurs se déroulant dans l'éxécution du code côté client, il serait tout de même plus intéressant de pouvoir envoyer des events personnalisés. Pour ceux faire Sentry met à disposition differents fonctions permettant la personnalisation de ces évènements. 

#### Capturer une exception 
Pour capture une exception se déroulant dans un try/catch, nous avons la possiblité d'utiliser la fonction captureException de Sentry. 

```
try {
    aFunctionThatMightFail();
} catch (err) {
    Sentry.captureException(err);
}
```

#### Utiliser Sentry pour du log 
Il peut arriver que l'on souhaite monitorer un appel asynchrone sur une API que notre programme utilise, par exemple lorsqu'une 500 survient, au lieu de logguer dans la console, on pourrait à l'aide de la fonction captureMessage remonter une information pertinente. 

```Sentry.captureMessage('Oops, it seems that our API is down');```

#### Filtrer les erreurs par environnement
Suite à l'initialisation que nous avons fait précédemment, toutes les erreurs sont centralisées au sein d'un même environnement, ce qui peut être vite problématique lorsque l'on développe un projet et que celui-ci est à la fois déployé sur une production, une pré-production et un environnement de développement.

Pour pouvoir remonter les erreurs aux bons endroits, rien de plus simple, lors de l'initialisation de votre appel à Sentry, vous pouvez lui passer comme paramètre : 

```
Sentry.init({
  environment: 'staging',
})
```

Avec ça, vous êtes maintenant capable de filtrer les erreurs propre à chacun de vos environnements. 

#### Comparer les erreurs entre différentes releases
De la même manière que l'on peut être ammené à developper sur plusieurs environnements, nous pouvons aussi avoir un système de versionning/release pour nos projets, il serait alors intéressant de pouvoir constater un différenciel d'erreur entre la release N-1 et la release N afin de voir les erreurs nouvellement apparues ou fixé. 

De la même manière, lors de l'initialisation de Sentry, vous pouvez indiquer le paramètre release : 

```
Sentry.init({
  release: "my-project-name@2.3.12"
})
```

![Release Sentry](https://docs.sentry.io/assets/releases-overview-5a3107c9d5be6690a84795d52036e35652bcd3ddad71b3e23ddc713ee7c0be4b.png)

Si vous souhaitez automatiser le versionning entre Sentry et votre dépôt Git, c'est aussi possible, pour ceux faire je vous invite à suivre [la documentation](https://docs.sentry.io/workflow/releases/?platform=browser).

### Aller plus loin avec Sentry
Nous avons vu ensemble qu'une infime partie des possibilités offertes par un outil tel que Sentry, en effet ce dernier permet aussi de : 

* D'être intégré à bons nombres d'outils externes tel que Github, Jira, Gitlab, Slack... 
* De demander du feedback à un utilisateur lorsqu'une erreur se produit

Et encore bien d'autres choses, la documentation vous permettra de découvrir l'ensemble des possiblités offertes par l'outil qui j'espère vous permettra de déployer plus sereinenement vos applications en production mais surtout la maintenabilité de cette dernière dans le temps. 