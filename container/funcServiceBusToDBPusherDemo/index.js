const Connection = require('tedious').Connection;
const Request    = require('tedious').Request;
const TYPES      = require('tedious').TYPES;

module.exports = function(context, mySbMsg) {
    context.log('JavaScript ServiceBus queue trigger function processed message', mySbMsg);

    context.log.info("funcServiceBusToDBPusherDemo: Received message.");
    if (!validateMessage(context, mySbMsg))
    {
      context.log.error("funcServiceBusToDBPusherDemo: FUNC-001: Data validation failed.");
      context.done("funcServiceBusToDBPusherDemo: FUNC-001: Data validation failed.");
    }
    else
    {
      context.log.info("funcServiceBusToDBPusherDemo: Attempting to open DB connection...");

      const config = {
        authentication: {
          options: {
            userName: process.env["DBUserName"], 
            password: process.env["DBPassword"] 
          },
          type: "default"
        },
        server: process.env["DBServerURL"], 
        options: {
          database: process.env["DBName"], 
          encrypt: true
        }
      };

      const cnn = new Connection(config);
      cnn.connect();

      cnn.on('connect', function(err) {
        if(err) {
          context.log.error("funcServiceBusToDBPusherDemo: FUNC-002: DB Connection failed. ", err);
          context.done("funcServiceBusToDBPusherDemo: FUNC-002: DB Connection failed.");
        }
        else
        {
          context.log.info("funcServiceBusToDBPusherDemo: DB Connection opened.");
          saveData(context, cnn, mySbMsg);
        }
      });
    }

    function validateMessage(context, data)
    {
      context.log(typeof data.name);
      context.log.info("funcServiceBusToDBPusherDemo: Checking ID...");
      if (typeof data.id !== 'number')
        return false;
      
      if (data.id <= 0)
        return false;
      
        context.log.info("funcServiceBusToDBPusherDemo: Checking Name...");
        if (typeof data.name !== 'string')
        return false;
      
      if (!data.name.trim())
        return false;
      
      return true;
    }

    function saveData(context, cnn, data)
    {
      context.log.info("funcServiceBusToDBPusherDemo: Saving data.");
      request = new Request("INSERT INTO DATA (ID, NAME) VALUES (@id, @name);", function(err) {
        if (err) {
          context.log.error("funcServiceBusToDBPusherDemo: FUNC-003: DB Error. ", err);
          context.done("funcServiceBusToDBPusherDemo: FUNC-003: DB Error.");}
        else {
          context.log.info("funcServiceBusToDBPusherDemo: Data saved succssfully.");
          context.done();
        }
      });
      
      request.addParameter("id", TYPES.Int, data.id);
      request.addParameter("name", TYPES.VarChar, data.name);

      cnn.execSql(request);
    }

};
