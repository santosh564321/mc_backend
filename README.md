To run the service locally, use `node index.js`

We've currently migrated from serverless to standalone ec2 instance.

Use process manger like pm2 to run main.js to start the API

Configure ngix to route the http traffic to the node process port

The DB config can be found in `config/db.js` We've harded coded the db details, but it's a good idea to use env vars to set those values for improved security.