---
layout: post
title: Exposer Wordpress en site statique HTML et l'héberger sur Github Pages (1/2)
date: 2018-06-18 12:00:00 +0300
description: Ici nous allons découvrir comment converitr un site Wordpress en un site HTML et l'héberger sur Githup pages # Add post description (optional)
img: wordpress.jpg # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [Wordpress, HTML, Static]
---
Vous n’êtes pas sans savoir que WordPress est l’un des outils de publication et de gestion de contenu (CMS) les plus utilisés au monde par le fait de sa souplesse, ses nombreux plugins, thèmes, etc. et sa communauté.  
  
Cependant lorsqu’on utilise un outil ultra-populaire, à l’instar de Windows par exemple si on veut faire l’analogie avec les systèmes d’exploitation, il attire l’attention de nombreux hackers afin de soutirer les données de votre site internet, voir l’infecter et corrompre le site de votre société, blog perso…  
  
Une des solutions limitant les risques que nous allons voir aujourd’hui est de générer son site WordPress en fichiers HTML statiques. C’est cette solution que nous avons appliqué pour notre blog.

## Avantages de la génération d’un site web statique
La génération d’un site web statique vous permettra par exemple d’utiliser votre WordPress sur un serveur local au sein de votre groupe, société… sans l’exposer directement à la vue des internautes, ce que vous exposerez aux utilisateurs serait ce que l’on peut appeler un « miroir » de votre WordPress local mais en avec des fichiers en .html. 
  
* Vous ne soumettez pas votre WordPress directement sur internet, vous pouvez donc dans l’idéal vous affranchir des mises à jours de WordPress, et vous ne serez pas exposé aux futures failles de sécurité de votre gestionnaire de contenu préféré.  
* Vous éviterez l’ensemble des attaques des bots tentant d’infecter votre WordPress en exploitant une faille ou voulant toucher à l’intégrité de votre base de données.
* Le chargement de votre site web sera plus rapide car votre serveur web ne passera pas par la case compilation du code PHP et servira directement des fichiers déjà compilés, vous n’êtes pas sans savoir qu’un fichier statique comme un .html, .css ou un fichier image est bien plus rapide à envoyer qu’une page PHP à compiler avec des nombreux appels dans votre code de vos fichiers de constants, variables, vos différentes classes, etc.

Comme vous devez vous en douter, ici comme ailleurs, rien n’est parfait et cette solution comporte aussi des inconvénients.

## Inconvénients de la génération d’un site web statique
Le fait que votre serveur web n’exécute plus de compilation de code, on s’affranchit de la possibilité de faire des requêtes vers notre base de données pour laisser un commentaire sur un article, effectuer une recherche, etc. ou toute autre requête qu’un serveur interprète normalement, fini notre bon vieux « SELECT * WHERE MaCondition » etc.  

* Plus aucune possibilité d’effectuer des requêtes à votre base de données
* On perd le dynamise de certaines fonctionnalités de WordPress comme les commentaires et le système de recherche
  
Il faut donc pour cela trouver des solutions alternatives pour continuer à utiliser certaines fonctionnalités préférées de notre cher WordPress.

## Et si on remettait du dynamisme à notre site statique ?
Pour ce faire, il existe différentes possibilités, vous pouvez faire une solution maison, ou l’utilisation de plugin, c’est l’utilisation de plugin que nous allons préconiser dans cet article.

* Retrouvons un système de commentaire à l’aide de [Disqus](https://disqus.com/)
* Un système de recherche instantané avec [Algolia](https://www.algolia.com/)

Je vous ai listé ici deux plugins qui feront l’objet d’un article plus détaillé prochainement quand à leur mise en place sur votre site WordPress ainsi que les manipulations à faire pour les paramétrer. Je vous invite cependant à lire la documentation de ces outils qui se trouve déjà très riche et bien expliquée.

Sachez aussi maintenant que depuis la version 4.7 de WordPress une API Rest est exposée automatiquement et vous pouvez ainsi vous en servir pour récupérer les données de votre site web par le biais d’une requête HTTP. On pourrait donc si on y pense, créer une API intermédiaire entre notre site web statique et notre WordPress pour récupérer, envoyer, voir même supprimer des données depuis notre site (ou web app) client.

Plus d’infos sur la [documentation officielle](http://v2.wp-api.org/).

## Mais comment on fait pour générer notre WordPress en site statique ?

Et bien oui, maintenant que l’on a compris l’intérêt d’un site web statique, qu’on a vu ses avantages et ses inconvénients, il nous faut encore sortir notre site web en fichier .html, et c’est là que nous allons découvrir comment faire roulement de tambours. 

Le plugin Simply Static est ce dont nous avons besoin, ce plugin à la particularité de s’installer facilement et de ne demander aucunes compétences particulières pour générer votre WordPress en fichier statique. Ici je vais vous expliquer les choix que nous avons fait pour le blog.

Une fois le plugin fraichement installé sur votre WordPress, je vous invite à vous rendre dans les paramètres, vous y trouverez plusieurs options dans l’onglet *Général* :

* *Use absolute URL*, vous permettra si vous avez votre WordPress en local chez vous de définir votre domaine final pour l’exposition de votre site.
* *Use relative URL*, comme son nom l’indique les URL seront relatives et s’acclimateront à n’importe quel domaine utilisé.
* *Save for offline use*, vous servira si vous voulez parcourir votre site web sans avoir de serveur web tel Nginx ou Apache. C'est l'option que je recommande, il faut veillez à n'utiliser que des URLs relatives dans vos articles, pages... Sinon la première option est la plus intéressante. 

Vous aurez aussi la possibilité de sortir votre site web dans un fichier .ZIP ou directement sur un répertoire de votre installation. Je vous invite à lire la doc du plugin ainsi que de parcourir les différents paramètres pour adapter au mieux à votre besoin spécifique.