# OpsCI_Project

## Informations

### Enzo Wesquy 3520224

### Pierre Ansar 21208870

### <https://github.com/EnzoW/OpsCI_Project.git>

## Partie 1 : Strapi, PostgreSQL et frontend React

Cette première partie comporte trois composantes principales : un service Strapi, une base de données PostgreSQL dédiée à Strapi, ainsi qu'un frontend en React. Chaque service fonctionne dans un conteneur Docker dédié, et leur orchestration est assurée par un fichier Docker Compose. Par exemple, le service Strapi dépend de StrapiDB : si la base de données n'est pas opérationnelle, le CMS ne peut pas démarrer.  

### Composantes principales  

#### Strapi  

Strapi est un headless CMS qui permet de créer du contenu structuré. Dans notre cas, nous allons créer les collections produits et événements. Ce service tourne sur le port 1337.  

#### PostgreSQL  

Une base de données est nécessaire pour enregistrer les données selon la structure définie dans Strapi. Ce service tourne sur le port 5432.  

#### Frontend React  

React est un framework javascript pour le développement frontend. Ici, nous l'utilisons pour afficher les produits stockés dans la base de données en effectuant des appels à l'API Strapi, disponible sur le port 1337. Le frontend, quant à lui, est accessible depuis le port 5173.  

## Partie 2 : Utilisation de Kafka afin de gérer les collections Strapi  

L'objectif est maintenant d'ajouter plus facilement de nouveaux produits et événements dans notre base de données sans passer directement par l'interface d'administration de Strapi. Pour ce faire, nous allons utiliser un broker Kafka, qui recevra des informations sur les produits et événements dans ses différents topics. Grâce aux producers, ces messages seront ensuite consommés par des consumers, qui interagiront avec Strapi.  

### Structure du broker Kafka  

Le broker Kafka comporte quatre topics :  

- product  
- event  
- stock  
- error  

### Comment fonctionnent les producers ?  

Les *producers* récupèrent les informations sur les produits ou les événements à partir des fichiers CSV passés aux conteneurs. Ces informations sont ensuite envoyées au bon topic du broker Kafka (product pour les produits et event pour les événements).  

### Comment fonctionnent les consumers ?  

Les *consumers* sont connectés au broker Kafka et récupèrent en temps réel les messages envoyés par les producers dans les topics. Ils utilisent ensuite les informations relatives aux produits et événements contenues dans ces messages pour créer de nouveaux objets dans la base de données en appelant directement l'API de Strapi.  

Grâce au token Strapi, les consumers ont les droits nécessaires pour créer de nouveaux objets.  

## Commandes

Le projet peut être lancé avec la commande :

```shell
docker compose up
```

Une fois tous les services démarrés, on doit lancer les consommateurs (pour les évènements) :

```shell
cd prod_cons/
docker compose up product_consumer event_consumer stock_consumer
```

Puis les producteurs peuvent être (re)-lancés :

```shell
docker compose up product_producer event_producer stock_producer
```
