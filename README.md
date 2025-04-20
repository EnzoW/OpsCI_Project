# OpsCI_Project

## Informations

### Enzo Wesquy 3520224

### Pierre Ansar 21208870

### [Dépot GitHub](https://https://github.com/EnzoW/OpsCI_Project/tree/tme10-11)

## Partie 1 : Création d'une API avec Strapi connectée à une base de données PostgreSQL et implémentation d'un frontend React affichant les informations sur les produits via l'API de Strapi  

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

## Partie 3 : TME 10-11 – Internet des objets

L'objectif de cette partie finale est d'avoir une première approche de l’IoT et du protocole MQTT. MQTT est un protocole basé sur TCP/IP qui fonctionne selon le modèle PUB/SUB, tout comme Kafka. Il est souvent utilisé dans le cadre de l’Internet des objets.

L’enjeu est de réussir à faire communiquer le broker MQTT avec le broker Kafka. Pour cela, nous utilisons un connecteur nommé mqtt-kafka-connector. Le fonctionnement est le suivant :

1. Le broker MQTT reçoit des informations liées à la mise à jour des stocks, envoyées par des objets connectés.  
2. Grâce au connecteur mqtt-kafka-connector, les messages du broker MQTT sont transmis au topic stock.  
3. Les stock-consumers sont abonnés au topic stock ; ils consomment le nouveau message et effectuent une requête à Strapi afin de mettre à jour les stocks.

Cette architecture nous permet de récupérer des données provenant d'appareils IoT sans exposer directement notre Kafka, en ajoutant un intermédiaire.

## Commandes

Le projet peut être lancé avec la commande :

```shell
docker compose up
```

Une fois tous les services démarrés, on doit lancer le stock-consumer :

```shell
cd prod_cons/ && docker compose up stock_consumer
```

Puis on peut modifier le stock d'un produit via le [frontend](https://mqtt-test-front.onrender.com/).
