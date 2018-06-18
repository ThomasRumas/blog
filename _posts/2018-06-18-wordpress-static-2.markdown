---
layout: post
title: Exposer Wordpress en site statique HTML et l'héberger sur Github Pages (2/2)
date: 2018-06-18 13:00:00 +0300
description: Ici nous allons découvrir comment converitr un site Wordpress en un site HTML et l'héberger sur Githup pages # Add post description (optional)
img: wordpress.jpg # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [Wordpress, HTML, Static]
---
Si vous êtes arrivé d'abord ici sans lire le précedent article, je vous invite à lire cet [article]({{site.baseurl}}/wordpress-static/) d'abord.

Maintenant que nous avons notre site web généré correctement en HTMl, que nous avons testé que le site web était fonctionnel, nous allons pouvoir l'héberger. 

Il existe de nombreux hébergeurs sur le marché comme OVH, GoDaddy, AWS, Azure... Mais ici j'ai fais le choix de vous expliquer comment héberger votre site web sur [Github Pages](https://pages.github.com). 

Vous n'êtes pas sans savoir que Github est une des plateformes les plus connus pour tous ceux qui aiment le développement dans sa globalité. 

Mais saviez-vous que Github vous propose d'héberger votre site web Jekyll ou HTML sur un dépôt git ? 

## Préparation du dépôt pour hébergement de notre site Wordpress
Vous êtes prêt ? C'est partit, on va sur Github et on se crée un nouveau dépôt ! 

Je ne pense pas qu'il soit nécessaire de vous expliquer ici comment créer un dépôt sur Github, c'est intuitif, puis vous avez l'habitude non ? 

Allez notre dépôt est créé, on va maintenant envoyer notre Wordpress en version HTML dessus :

* `git clone mon-depot`
* `cd mon-depot`
* `git add --all` 
* `git commit -m "Push statics files on Github`
* `git push origin master`

Une fois l'ensemble de ces commandes effectués, je vous invite à retourner sur Github dans les paramètres de votre dépôt afin d'activer Github Pages. 

## Paramétrage de notre nom de domaine

Par défaut votre site web sera accessible sur une url du style *USERNAME.github.io/mon-depot*. Nous allons maintenant voir comment faire pour utiliser notre propre domaine et/ou sous-domaine pour notre site Wordpress fraichement hébergé :  

* Au niveau de la Source, vous avez le choix entre 3 possibilités, si vous avez procédé comme indiqué ici, il vous suffit de choisir la branche master
* Dans le champs *Custom Domain* nous allons renseigner le domaine que nous souhaitons utiliser 
* *Enforce HTTPS* Depuis peu, il est maintenant possible d'utiliser l'HTTPS sur nos propres noms de domaine, en effet Github et Let's Encrypt sont devenus partenaires, vous risquez de trouver de nombreux articles vous indiquant de passer par CloudFare pour un certificat HTTPS mais ce n'est plus nécessaire [aujourd'hui.](https://blog.github.com/2018-05-01-github-pages-custom-domains-https/)

![Paramètres Github Pages]({{site.baseurl}}/assets/img/githubpages.jpg)

Cette image illustre un exemple de ce à quoi doit ressembler votre configuration. 

### Faire pointer son domaine sur Github

Si vous souhaitez comme l'exemple ci-dessus utilisé ce qu'on appelle un APEX domaine (c'est un domaine "brut" qui ne comporte pas de sous-domaine), voici la procédure à suivre : 

* Allez chez votre registrar du domaine et ajoutez/modifiez les champs A de votre domaine en ajoutant chacune de ces IP : `185.199.108.153 185.199.109.153 185.199.110.153 185.199.111.153`
* Patientez le temps de propagation de votre zone DNS (généralement 24h). 

Et voilà, votre site web est maintenant accessible sur le domaine que vous avez renseigné au niveau de votre dépôt Github.

J'ai moi-même utilisé cette solution pour héberger [mon site internet Wordpress](http://rumas-conception-web.com).

Prochainement, je vous expliquerai comment créer une image Docker de son installation Wordpress avec sa base de données afin de pouvoir mettre à jour rapidement et depuis n'importe quel machine possédant Docker son site internet.  

 




