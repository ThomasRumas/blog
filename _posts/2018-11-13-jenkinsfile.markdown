---
layout: post
title: Améliorer le temps de build sous Jenkins 
date: 2018-11-13 13:00:00 +0300
description: Utiliser la parallélisation pour optimiser vos builds Jenkins #Add post description (optional)
img: jenkins.png # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [DevOps, Docker, Web]
---
Hello ! 

Aujourd'hui je vais vous expliquer comment améliorer la rapidité d'exécution de vos builds Jenkins. En effet au sein de ma mission actuelle, il m'a été demandé de modifier le build Jenkins d'un site web afin de gagner en temps et en efficacité lors du déploiement d'une mise à jour d'un projet.  

## Jenkinsfile à la rescousse ! ##

Jenkins est un outil permettant d'automatiser certaines tâches de déploiement, de build, de test de nos différentes applications, pour en savoir plus, je vous invite à regarder quel est l'intérêt d'un outil tel que Jenkins dans la ligne de vie d'un applicatif web. 

Partons du principe que vous ayez déjà dans votre projet vos différentes tâches de build, par exemple celle pour compiler vos fichiers CSS, vos fichiers JS et d'autres tâches qui pourraient être utile, le déploiement...

Ce qui fait que pour compiler et déployer notre site web nous avons donc besoin de : 

- Cloner le dépôt 
- Compiler les fichiers LESS/SCSS
- Compiler les fichiers JS
- ...

Si ces tâches s'exécutent de façon synchrones, le temps de build sera donc l'addition de l'ensemble de la durée nécessaire pour la résolution de chacune de ces tâches. On peut donc facilement monter à un temps de build supérieur à 15/20min si on enchaine de longues étapes coûteuses ou bien un applicatif web historique contenant plusieurs années de code. 

La solution qui s'offre à nous est donc de trouver le moyen pour exécuter l'ensemble de ces tâches en parallèle, en effet exécuter ces tâches de façon asynchrone nous donnera un temps de build correspondant à la durée la plus longue de la tâche la plus coûteuse. 

Attention : Pour rappel l'exécution d'une tâche lors d'un build sur Jenkins utilise un thread disponible sur votre host hébergeant votre Jenkins, si vous avez 6 étapes que vous souhaitez exécuter en même temps de façon asynchrone mais que vous n'avez que 4 threads disponible, vous aurez donc tant qu'un thread n'est pas libéré, 2 tâches en attente de ressource disponible. 

#### Création des étapes ####

Allez on se lance, je vais vous expliquer la structure pour utiliser la parallélisation dans votre Jenkinsfile. Reprenons notre exemple précédent avec notre tâche de compilation des sources LESS/SCSS et JS de notre applicatif web. 

Nous allons tout d'abord déclarer une `stage` en lui donnant un nom. Ensuite nous allons utiliser le mot clef `parallel` afin de préciser à Jenkins que l'on souhaite exécuter nos tâches de façon asynchrones. 

Pour chaque tâche, nous avons besoin de lui indiquer un nom pour suivre par exemple l'avancement de notre build dans la console afin de savoir quelle tâche écrit actuellement son output sur la console mais aussi le plus important ce que l'on souhaite exécuter comme tâche. Ici nous avons 4 tâches qui vont s'exécuter de façon asynchrone : 

```
...
    stage("Build") {
        parallel(
            'less': {
                sh "npm run build-less"
            },
            'browserify': {
                sh "npm run build-browserify"
            },
            'rsync': {
                sh "npm run build-rsync"
            },
            'seo': {
                sh "npm run copy-files-seo"
            }
        )
    }
...
```

## En conclusion ##

Bien sûr, si votre host Jenkins le permet vous pouvez paralléliser bien plus que 4 tâches qui peuvent s'exécuter de façon asynchrone, attention cependant à ne pas tout asynchroniser, si une étape a besoin d'être exécuter avant l'exécution de la prochaine, exécuter vos tâches de façon synchrone. 

A titre d'exemple, l'utilisation de la parallélisation sur ma mission actuelle a permit de réduire le temps de build d'une moyenne de 17min à 6min au maximum, vous comprenez donc que le gain de temps n'est pas négligeable et tout ça sans rien modifier au niveau des scripts node qui pourrait aussi faire l'objet d'une optimisation. 



 








 




