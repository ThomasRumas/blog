---
layout: post
title: Améliorer son workflow de développement avec Wordpress grâce à Docker
date: 2018-11-14 12:00:00 +0300
description: Nous découvrirons ensemble comment démarrer un projet sous Wordpress en utilisant la force de Docker  # Add post description (optional)
img: wordpress.jpg # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [Wordpress, Docker, Continious Integration]
---
Wordpress est le CMS le plus utilisé actuellement au monde du fait de sa communauté active, sa richesse de thème et de plugin... De ce fait, il est utilisé par beaucoup de monde pour déployer/développer de nombreux sites internet. Cependant avant de pouvoir développer sur Wordpress il faut bien souvent configurer sa machine avec un serveur Nginx/Apache, installer PHP, MySQL... Ce qui n'est pas à la portée de n'importe quel développeur front ou back, et oui à chacun sa spécialité et son métier. 

Nous allons donc voir ici comment instancier une instance de Wordpress avec l'ensemble des pré-requis nécessaire pour un fonctionnement sur un machine de développement. Mais ne vous en faites pas si votre site Wordpress est versionné sous git et que votre base de données est accessible, vous pourrez suivre ce tutoriel afin de déployer plus efficacement votre Wordpress. 

## Le choix de Docker
Comme je vous ai déjà expliqué dans un [précédent article](https://thomas.rumas.fr/dokku/), Docker est simple et facile à installer, il ne nécessite pas de grandes connaissances en administration système pour qu'un utilisateur puisse commencer à utiliser une image Docker pour travailler. 

Docker favorise aussi le travail collaboratif, en effet combien de fois avez-vous entendu votre collègue vous dire "Ca fonctionne pas chez toi ? Chez moi tout est bon, regarde !". Rien n'est plus frustrant que d'avoir un environnement de développement divergent de son collègue, la pré-production voir même la production. C'est même indispensable d'avoir un environnement iso avec votre production, en effet si vos environnements diverges lors d'une mise en production d'une release, nouvelle feature... Comment savoir si le bug provient de votre code, de vos dépendances npm, de la configuration de votre serveur...  

Avoir un environnement identique pour chacun des développeurs est donc de nos jours un pré-requis au vue du nombre de dépendances et d'outils dont nous usons chaque jour pour améliorer notre quotidien. 

L'utilisation d'une image Docker va vous permettre d'être beaucoup plus flexible, en effet, il existe de nombreuses possibilités pour déployer une image Docker sur un serveur que ce soit en cours de développement, dans un environnement de test, en pré-production... mais nous y reviendrons plus tard, ce n'est pas le but de cet article d'aujourd'hui. 

## Création de l'image Docker
Dans un premier temps, nous devons créer ce que l'on appelle une image Docker qui contiendra les étapes nécessaires au déploiement de notre Wordpress. Nous aurons donc une arborescence : 

* Dockerfile
* entrypoint.sh 

Le fichier Dockerfile comprendra l'ensemble des instructions dont nous avons besoin pour créer notre environnement, le fichier entrypoint contiendra quant à lui les instructions à exécuter lors du démarrage de notre instance. 

#### Contenu du fichier Dockerfile
```
FROM php:7.2-apache

ENV branch=master
ENV git=https://github.com/WordPress/WordPress.git

RUN apt update
RUN apt install git dos2unix -y 

WORKDIR /var/www/html

COPY entrypoint.sh /
RUN dos2unix /entrypoint.sh
RUN chmod u+x /entrypoint.sh

EXPOSE 80
VOLUME [ "/var/www/html" ]

ENTRYPOINT [ "sh","/entrypoint.sh" ]
```

Comme je vous l'ai expliqué précedemment, pour déployer notre Wordpress, nous avons besoin d'un environnement tournant avec un serveur web et PHP, ici nous partirons sur une version PHP 7.2 avec Apache comme serveur web. 

Pour cela nous allons écrire dans notre Dockerfile la ligne `FROM php:7.2-apache` qui est une image docker provenant du hub officiel de PHP et qui nous fournira les services nécessaires dont nous avons besoin. 

Vous remarquerez que dans le fichier, nous avons définit ce que l'on appelle des variables d'environnement caractérisé pour le mot clef `ENV`, ces variables vont nous permettre si on ne passe aucun paramètre lors du lancement de notre image d'utiliser des valeurs par défaut pour pouvoir fonctionner tout de même. 

Les commandes `RUN` ici permettent d'exécuter des commandes shell dans notre Docker qui serait nécessaire à la bonne exécution de notre système. 

Par défaut, les fichiers se trouvant dans une image Docker ne sont pas accessible par le host exécutant cette image, pour que ceci soit accessible nous allons déclarer un `VOLUME` que nous pourrons monter localement sur notre machine afin de pouvoir éditer les fichiers. 

Un serveur web se doit d'être accessible, c'est pourquoi la ligne `EXPOSE` nous permet d'indiquer un port sur lequel on peut accéder à notre Docker, ici c'est le port 80 vu que nous sommes sur un serveur Apache. 

Enfin, vous verrez que l'on fourni un fichier `ENTRYPOINT` à notre image, nous allons maintenant voir en détail ce que celui-ci fait. 

#### Contenu du fichier entrypoint.sh 

```
#!/bin/bash
set -e; 

if [ -z "$(ls -A /var/www/html)" ]; then
   echo "Folder is empty"; 
   echo "Get the source from git repository on specific branch : $branch"; 
   git clone -b $branch $git /var/www/html; 
fi

apachectl -DFOREGROUND;  
```

Le contenu de notre entrypoint est assez simple, en effet le fait que nous nous soyons basé sur une image Docker provenant du hub officiel de PHP nous permet de nous affranchir de l'ensemble des étapes nécessaires à la configuration d'un serveur Apache avec PHP en ne nous concentrant que sur l'essentiel. 

Vous vous souvenez de nos variables d'environnement ? Voilà à quoi ces dernières servent, elles permettent d'utiliser ces dernières comme étant des variables à notre script shell, ce qui rend notre script plus générique et plus facilement réutilisable. 

La condition ici permet de voir si le dossier `/var/www/html` est vide, si c'est le cas, notre Docker va aller chercher les sources sur le dépôt git que nous aurons fourni à l'initialisation de notre image. 

Enfin la ligne `apachectl -DFOREGROUND` permet de faire tourner notre service Apache en fond afin que notre Docker ne s'éteint pas une fois l'ensemble des tâches effectuées. 

Maintenant que nous avons vu le fonctionnement de ces deux fichiers, comment cela fonctionne ? 

## Utilisation de notre image 

Vous êtes prêt ? Le plus difficile est derrière nous, maintenant, quelques commandes suffisent pour lancer notre instance Wordpress ! 

* `docker build --tag wordpress .`
* `docker run -p 8080:80 -v ${pwd}:/var/www/html --link mysql-instance:mysql -e branch=master -e git=https://github.com/WordPress/WordPress.git wordpress` 

Notre première commande va créer notre image Docker sur notre machine afin que l'on puisse l'utiliser sur notre machine. La seconde commande va lancer une instance Docker en se basant sur notre image précémment compilée, voyons ensemble ce que font les paramètres : 

* `-p 8080:80` va nous permettre d'envoyer l'ensemble des requêtes faites sur notre machine sur le port 8080 vers le port 80 de notre instance Docker
* `-v ${pwd}:/var/www/html` va nous permettre de monter le contenu du répertoire `/var/www/html` dans le dossier courant où nous avons lancer notre instance, libre à vous de modifier ce chemin comme bon vous semble
* `--link mysql-instance:mysql` va nous permettre si vous utilisez une instance Docker MySQL de permettre à nos deux instances de communiquer entre elle, ceci c'est pas nécessaire si votre base de données se trouve déjà sur un autre serveur. 
* `-e branch=master` va nous permettre de dire sur quelle branche nous souhaitons récupérer les sources de notre site
* `-e git=https://github.com/WordPress/WordPress.git` va nous permettre de spécifier le dépôt sur lequel nous souhaitons récupérer le contenu de notre branche

Et voilà, si vous avez respecté ces quelques étapes, en allant sur `http://localhost:8080` vous devriez avoir votre instance Wordpress prête à l'emploi. L'avantage d'une telle solution c'est que vous vous êtes affranchi de toute la partie configuration mais surtout l'ensemble des personnes travaillant avec vous sur le projet aura le même environnement de développement, ainsi vous pourriez facilement migrer vos environnements pour tout le monde en déployant une nouvelle image et une nouvelle instance Docker. 

## En conclusion 

Vous trouverez l'ensemble des sources de cet article sur mon [Github](https://github.com/ThomasRumas/wordpress-starter). Je ne manquerai pas de le mettre à jour si mes besoins évoluent afin de vous en faire profiter. 

N'oubliez pas que pour Wordpress fonctionne vous avez besoin d'une base de données MySQL, pour ce faire vous pouvez aussi instancier une image MySQL à l'aide de Docker de cette façon `docker run --name mysql-instance -e MYSQL_ROOT_PASSWORD=toto -d -p 3306:3306 mysql:latest`. Ensuite utiliser n'importe quel outil vous permettant de vous connecter à un serveur MySQL pour l'administrer et créer la BDD nécessaire à l'utilisation de Wordpress. 

Pour aller plus loin, nous aurions pu imaginer rappatrier une base de données sur une instance Docker MySQL afin d'avoir la base de données en locale. Cependant tout ce que vous ferez sur une BDD locale ne sera pas répercuter sur votre base de données en production et il faudra donc synchroniser les données entre ces deux bases pour que votre site puisse fonctionner. Le mieux est peut-être de déployer une base de données de développement et une base de données de production sur lesquelles on ferait redescendre la production tous les X temps afin de synchroniser nos environnements. 

De plus, cette image Docker est tout à fait utilisable dans l'idée d'un déploiement continu, on pourrait très bien imaginer utiliser cette image sur un orchestrateur de container Docker afin d'exposer notre site Wordpress. 

J'espère que cet article vous a plu, et je suis à votre écoute pour toutes recommendations et/ou questions. 




