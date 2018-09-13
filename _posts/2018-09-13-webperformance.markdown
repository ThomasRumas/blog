---
layout: post
title: Tester les performances de vos pages webs 
date: 2018-09-13 13:00:00 +0300
description: Utiliser des outils pour tester les performances de vos pages webs #Add post description (optional)
img: sitespeed.png # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [Front, NodeJS, Web, JS]
---
Hello ! 

Aujourd'hui je vais vous expliquer comment analyser la performance de vos pages webs que ce soit en cours de développement, en préprod ou bien en production avec les outils fournis par Webpagetest et Sitespeed.io. 

## Quel est l'intérêt d'avoir des pages web efficaces ? ##

Il n'est plus à prouver que la vitesse d'exécution de vos pages webs ont un impact réel sur l'expérience que vous proposez à vos utilisateurs, c'est pourquoi il est nécessaire d'obtenir des temps de réponses et d'exécutions toujours le plus rapide possible pour l'ensemble de vos sites webs. Récemment une étude à montrer que 57% des internautes quitteraient le site si celui-ci met plus de 3 secondes à s’afficher. Et parmi ces derniers, 80% affirment qu’ils ne reviendront plus jamais sur le site après cette première expérience ratée. Au niveau du taux de rebond, un site qui se chargerait en plus de 58 secondes aurait son taux de rebond 2x plus elevé qu'un site se chargeant en une 1 seconde. 

Au niveau des sites ecommerces, selon des études, une seconde de chargement supplémentaire impacterait le taux de conversion avec une perte moyenne de 7%, ces mêmes études ont indiqué aussi que 20% des abandons de panier étaient dû à un temps de chargement jugé "trop long" par les utilisateurs. 

Quelques chiffres qui illustrent ces études : 
Pour Amazon, quand son temps de chargement augmente de 100 ms, soit 0.1 seconde, c’est une perte de 1% des ventes, ce qui aurait représenté en 2016 une perte de 1.360 milliards d’euros. Pour Shopzilla, quand celui-ci passe son temps de chargement de 7 à 2 secondes, c’est un gain de 7 à 12% de chiffre d’affaires en plus. Etam, communiquait en 2015 un gain de 20% de son taux de conversion suite à une baisse du temps moyen de chargement de ses pages de 0.7 secondes.

## Mais c'est aussi devenu important pour le SEO ##

Au moment où j'écris ses lignes, Google accorde de plus en plus d'importance à l'optimisation des pages webs pour l'expérience utilisateur, notamment au niveau des utilisateurs consultant les sites webs depuis un smartphone. Il est donc vivemment recommandé de ne plus négliger l'impact du temps de chargement de son site internet. 

## Des ressources à disposition ##

Vous me direz que pour tester les performances de ses pages webs, il faut des outils à disposition, et vous avez tout à fait raison, c'est pourquoi nous allons voir aujourd'hui deux outils intéressants : [Sitespeed.io](https://www.sitespeed.io "Sitespeed.io") et [Webpagetest](https://www.webpagetest.org/). 

Ces outils sont open source et maintenus par une forte communauté afin de répondre aux derniers critères de Google en terme de web performance et d'accessibilité. Je ne rentrerai pas en détail dans l'utilisation de ces outils, la documentation est très bien expliqué quant à leur utilisation et leur intérêt. 

Ici nous allons plutôt répondre à un besoin "d'entreprise", tester localement des pages webs non accessible depuis l'extérieur d'un réseau privé. Pour ce faire, je vous mets à disposition un lien vers mon dépôt git où vous avez la possibilité de tester localement un site web à l'aide de Webpagetest ou bien Speedtest.io [WebPerformance](https://github.com/ThomasRumas/WebPerformance "WebPerformance"), vous trouverez à ce lien le README explicatif quant à l'utilisation de ces ressources. 

Vous aurez besoin de Docker, de NodeJS, de Firefox et/ou Chrome afin de pouvoir exécuter ces scripts, mais vous ferez l'installation des prérequis est simple, il suffit de suivre la documentation officielle de chaque ressource. 

Les scripts sont assez simplistes mais ils vous permettent si vous remplissez l'ensemble des conditions nécessaires de pouvoir tester vos sites webs à l'aide d'une limitation de bande passante afin d'avoir des conditions de test "réaliste" mais aussi de tester vos pages web avec un agent mobile (utilisation du navigateur chrome). 


## En conclusion ##

Ces outils sont fantastiques afin de révéler les faiblesses mais aussi les forces de vos sites webs, cela permet par exemple lors d'un sprint d'amélioration de centraliser les efforts en se basant sur les mêmes métriques utilisées par Google. Prochainement, si cela vous intéresse, nous pourrons voir ensemble différentes pistes pour améliorer l'expérience utilisateur de vos sites internet. 



 








 




